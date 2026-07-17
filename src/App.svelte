<script lang="ts">
	import { onMount } from 'svelte';
	import { ModeWatcher, mode, setMode, userPrefersMode } from 'mode-watcher';
	import AppShell from '$lib/ui/AppShell.svelte';
	import UnlockScreen from '$lib/ui/UnlockScreen.svelte';
	import { ensureDefaultAccount, getAccountsOverview } from '$lib/application/accounts';
	import {
		getAccountBalance,
		getCategoriesForType,
		listRecentTransactions
	} from '$lib/application/transactions';
	import { getMonthSummary } from '$lib/application/month-summary';
	import {
		backupFilename,
		buildBackup,
		parseBackupJson,
		restoreBackup
	} from '$lib/application/backup';
	import { resetLocalData } from '$lib/application/reset';
	import {
		createRecurringRule,
		listRecurringRules,
		materializeDueRecurring,
		removeRecurringRule,
		setRecurringActive
	} from '$lib/application/recurring';
	import {
		createGoal,
		listGoals,
		removeGoal
	} from '$lib/application/goals';
	import {
		disableLock,
		enableLock,
		isLockEnabled,
		unlockWithPassphrase
	} from '$lib/application/lock';
	import {
		createCategory,
		listCategories,
		removeCategory,
		renameCategory,
		reorderCategories
	} from '$lib/application/categories';
	import type { Account } from '$lib/domain/account';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { RecurringRule } from '$lib/domain/recurring';
	import type { Goal } from '$lib/domain/goals';
	import {
		currentMonthKey,
		shiftMonth,
		type MonthKey,
		type MonthSummary
	} from '$lib/domain/month-summary';
	import { parseAmountInput } from '$lib/domain/transaction-rules';
	import {
		parseThemePreference,
		THEME_STORAGE_KEY,
		type ThemePreference
	} from '$lib/shared/theme';

	let account = $state<Account | null>(null);
	let isSinglePot = $state(true);
	let balanceMinor = $state(0);
	let transactions = $state<LedgerTransaction[]>([]);
	let categoriesById = $state<Record<string, CategoryRow>>({});
	let expenseCategories = $state<CategoryRow[]>([]);
	let incomeCategories = $state<CategoryRow[]>([]);
	let monthKey = $state<MonthKey>(currentMonthKey());
	let monthSummary = $state<MonthSummary | null>(null);
	let recurringRules = $state<RecurringRule[]>([]);
	let goals = $state<Goal[]>([]);
	let lockEnabled = $state(false);
	let unlocked = $state(true);
	let ready = $state(false);
	let error = $state<string | null>(null);
	let themePreference = $state<ThemePreference>('system');

	async function refreshLedger(active: Account, key: MonthKey = monthKey) {
		const [balance, recent, categories, summary, rules, goalRows, exp, inc] =
			await Promise.all([
				getAccountBalance(active.id),
				listRecentTransactions(active.id),
				listCategories(),
				getMonthSummary(active.id, key),
				listRecurringRules(),
				listGoals(),
				getCategoriesForType('expense'),
				getCategoriesForType('income')
			]);
		balanceMinor = balance;
		transactions = recent;
		categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));
		monthSummary = summary;
		recurringRules = rules;
		goals = goalRows;
		expenseCategories = exp;
		incomeCategories = inc;
	}

	async function bootstrap() {
		lockEnabled = await isLockEnabled();
		unlocked = !lockEnabled;
		// Sealed category/note fields need the session key — stop before seeding/lists.
		if (!unlocked) {
			account = await ensureDefaultAccount();
			isSinglePot = true;
			return;
		}
		const overview = await getAccountsOverview();
		const active = overview.accounts[0] ?? null;
		account = active;
		isSinglePot = overview.isSinglePot;
		await materializeDueRecurring();
		if (active) {
			await refreshLedger(active);
		}
	}

	onMount(() => {
		themePreference = parseThemePreference(userPrefersMode.current);
		void (async () => {
			try {
				await bootstrap();
				ready = true;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to open local database';
				ready = true;
			}
		})();
	});

	function onThemePreferenceChange(next: ThemePreference) {
		themePreference = next;
		setMode(next);
	}

	async function onRefreshLedger() {
		if (!account) return;
		await materializeDueRecurring();
		await refreshLedger(account);
	}

	async function onPrevMonth() {
		if (!account) return;
		monthKey = shiftMonth(monthKey, -1);
		monthSummary = await getMonthSummary(account.id, monthKey);
	}

	async function onNextMonth() {
		if (!account) return;
		monthKey = shiftMonth(monthKey, 1);
		monthSummary = await getMonthSummary(account.id, monthKey);
	}

	async function onUnlock(passphrase: string) {
		const ok = await unlockWithPassphrase(passphrase);
		if (!ok) throw new Error('Incorrect passphrase');
		unlocked = true;
		if (account) await refreshLedger(account);
	}

	async function onExport() {
		const backup = await buildBackup();
		const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = backupFilename();
		a.click();
		URL.revokeObjectURL(url);
	}

	async function onImportFile(file: File) {
		const text = await file.text();
		const backup = parseBackupJson(text);
		await restoreBackup(backup);
		await bootstrap();
		if (account && unlocked) await refreshLedger(account);
	}

	async function onResetLocalData(options: {
		preserveCategories: boolean;
		preservePassphrase: boolean;
	}) {
		await resetLocalData(options);
		await bootstrap();
		if (account && unlocked) await refreshLedger(account);
	}

	$effect(() => {
		themePreference = parseThemePreference(userPrefersMode.current);
		void mode.current;
	});
</script>

<ModeWatcher
	defaultMode="system"
	modeStorageKey={THEME_STORAGE_KEY}
	themeColors={{ dark: '#0a0a0a', light: '#ffffff' }}
/>

{#if !ready}
	<div class="text-muted-foreground flex min-h-svh items-center justify-center text-sm">
		Starting up…
	</div>
{:else if lockEnabled && !unlocked}
	<UnlockScreen {onUnlock} />
{:else}
	<AppShell
		{account}
		{isSinglePot}
		{balanceMinor}
		{transactions}
		{categoriesById}
		{monthSummary}
		{recurringRules}
		{goals}
		{expenseCategories}
		{incomeCategories}
		{lockEnabled}
		{themePreference}
		{onThemePreferenceChange}
		{onRefreshLedger}
		{onPrevMonth}
		{onNextMonth}
		{onExport}
		{onImportFile}
		{onResetLocalData}
		onCreateRecurring={async (input) => {
			if (!account) return;
			await createRecurringRule({
				accountId: account.id,
				type: input.type,
				amountMinor: parseAmountInput(input.amountRaw),
				categoryId: input.categoryId,
				frequency: input.frequency,
				note: input.note
			});
			await onRefreshLedger();
		}}
		onToggleRecurring={async (id, active) => {
			await setRecurringActive(id, active);
			await onRefreshLedger();
		}}
		onDeleteRecurring={async (id) => {
			await removeRecurringRule(id);
			await onRefreshLedger();
		}}
		onCreateGoal={async (name, targetRaw, targetOn) => {
			await createGoal(name, targetRaw, targetOn);
			await onRefreshLedger();
		}}
		onDeleteGoal={async (id) => {
			await removeGoal(id);
			await onRefreshLedger();
		}}
		onEnableLock={async (passphrase) => {
			await enableLock(passphrase);
			lockEnabled = true;
		}}
		onDisableLock={async (passphrase) => {
			await disableLock(passphrase);
			lockEnabled = false;
		}}
		onCreateCategory={async (name, kind) => {
			await createCategory(name, kind);
			await onRefreshLedger();
		}}
		onRenameCategory={async (id, name) => {
			await renameCategory(id, name);
			await onRefreshLedger();
		}}
		onDeleteCategory={async (id) => {
			await removeCategory(id);
			await onRefreshLedger();
		}}
		onReorderCategories={async (kind, orderedIds) => {
			await reorderCategories(kind, orderedIds);
			await onRefreshLedger();
		}}
		{ready}
		{error}
	/>
{/if}
