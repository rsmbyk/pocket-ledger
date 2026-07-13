<script lang="ts">
	import { onMount } from 'svelte';
	import { ModeWatcher, mode, setMode, userPrefersMode } from 'mode-watcher';
	import AppShell from '$lib/ui/AppShell.svelte';
	import { getAccountsOverview } from '$lib/application/accounts';
	import {
		getAccountBalance,
		listRecentTransactions
	} from '$lib/application/transactions';
	import { getMonthSummary } from '$lib/application/month-summary';
	import { listCategories } from '$lib/data/category-repo';
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
	let isSinglePot = $state(true);
	let balanceMinor = $state(0);
	let transactions = $state<LedgerTransaction[]>([]);
	let categoriesById = $state<Record<string, CategoryRow>>({});
	let monthKey = $state<MonthKey>(currentMonthKey());
	let monthSummary = $state<MonthSummary | null>(null);
	let ready = $state(false);
	let error = $state<string | null>(null);
	let themePreference = $state<ThemePreference>('system');

	async function refreshLedger(active: Account, key: MonthKey = monthKey) {
		const [balance, recent, categories, summary] = await Promise.all([
			getAccountBalance(active.id),
			listRecentTransactions(active.id),
			listCategories(),
			getMonthSummary(active.id, key)
		]);
		balanceMinor = balance;
		transactions = recent;
		categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));
		monthSummary = summary;
	}

	async function bootstrap() {
		const overview = await getAccountsOverview();
		const active = overview.accounts[0] ?? null;
		account = active;
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

<AppShell
	{account}
	{isSinglePot}
	{balanceMinor}
	{transactions}
	{categoriesById}
	{monthSummary}
	{themePreference}
	{onThemePreferenceChange}
	{onRefreshLedger}
	{onPrevMonth}
	{onNextMonth}
	{ready}
	{error}
/>
