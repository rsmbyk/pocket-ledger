<script lang="ts">
	import { onMount } from 'svelte';
	import { ModeWatcher, mode, setMode, userPrefersMode } from 'mode-watcher';
	import AppShell from '$lib/ui/AppShell.svelte';
	import UnlockScreen from '$lib/ui/UnlockScreen.svelte';
	import {
		clearPocketGoal,
		createPocket,
		deletePocket,
		ensureDefaultAccount,
		getAccountsOverview,
		reorderPockets,
		updatePocket,
		type CreatePocketInput,
		type UpdatePocketInput
	} from '$lib/application/accounts';
	import {
		getAllPocketsBalance,
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
	import {
		currentMonthKey,
		shiftMonth,
		type MonthKey,
		type MonthSummary
	} from '$lib/domain/month-summary';
	import {
		parseThemePreference,
		THEME_STORAGE_KEY,
		type ThemePreference
	} from '$lib/shared/theme';

	let account = $state<Account | null>(null);
	let accounts = $state<Account[]>([]);
	let isSinglePot = $state(true);
	let balanceMinor = $state(0);
	let transactions = $state<LedgerTransaction[]>([]);
	let categoriesById = $state<Record<string, CategoryRow>>({});
	let expenseCategories = $state<CategoryRow[]>([]);
	let incomeCategories = $state<CategoryRow[]>([]);
	let monthKey = $state<MonthKey>(currentMonthKey());
	let monthSummary = $state<MonthSummary | null>(null);
	let lockEnabled = $state(false);
	let unlocked = $state(true);
	let ready = $state(false);
	let error = $state<string | null>(null);
	let themePreference = $state<ThemePreference>('system');

	async function refreshLedger(active: Account, key: MonthKey = monthKey) {
		const [overview, balance, recent, categories, summary, exp, inc] = await Promise.all([
			getAccountsOverview(),
			getAllPocketsBalance(),
			listRecentTransactions(active.id),
			listCategories(),
			getMonthSummary(active.id, key),
			getCategoriesForType('expense'),
			getCategoriesForType('income')
		]);
		accounts = overview.accounts;
		isSinglePot = overview.isSinglePot;
		balanceMinor = balance;
		transactions = recent;
		categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));
		monthSummary = summary;
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
		accounts = overview.accounts;
		isSinglePot = overview.isSinglePot;
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
		{accounts}
		{isSinglePot}
		{balanceMinor}
		{transactions}
		{categoriesById}
		{monthSummary}
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
		onCreatePocket={async (input: CreatePocketInput) => {
			await createPocket(input);
			await onRefreshLedger();
		}}
		onUpdatePocket={async (input: UpdatePocketInput) => {
			await updatePocket(input);
			await onRefreshLedger();
		}}
		onDeletePocket={async (id) => {
			await deletePocket(id);
			await onRefreshLedger();
		}}
		onReorderPockets={async (orderedNonMainIds) => {
			await reorderPockets(orderedNonMainIds);
			await onRefreshLedger();
		}}
		onClearPocketGoal={async (id) => {
			await clearPocketGoal(id);
			await onRefreshLedger();
		}}
		{ready}
		{error}
	/>
{/if}
