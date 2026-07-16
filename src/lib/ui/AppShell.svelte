<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import QuickAddSheet from '$lib/ui/QuickAddSheet.svelte';
	import AppShellChrome from '$lib/ui/AppShellChrome.svelte';
	import AppCommandPalette from '$lib/ui/AppCommandPalette.svelte';
	import type { Account } from '$lib/domain/account';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { RecurringRule, RecurringFrequency } from '$lib/domain/recurring';
	import type { Goal } from '$lib/domain/goals';
	import type { NetWorthSnapshot } from '$lib/domain/net-worth';
	import type { AddableTransactionType } from '$lib/domain/transaction-rules';
	import { isAppRoute, parseHash, routeToHash, type AppRoute } from '$lib/shared/router';

	type Props = {
		account: Account | null;
		isSinglePot: boolean;
		balanceMinor: number;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		monthSummary: MonthSummary | null;
		recurringRules: RecurringRule[];
		goals: Goal[];
		snapshots: NetWorthSnapshot[];
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		lockEnabled: boolean;
		themePreference: ThemePreference;
		onThemePreferenceChange: (next: ThemePreference) => void;
		onRefreshLedger: () => void | Promise<void>;
		onPrevMonth: () => void | Promise<void>;
		onNextMonth: () => void | Promise<void>;
		onExport: () => void | Promise<void>;
		onImportFile: (file: File) => void | Promise<void>;
		onResetLocalData: (options: {
			preserveCategories: boolean;
			preservePassphrase: boolean;
		}) => void | Promise<void>;
		onCreateRecurring: (input: {
			type: AddableTransactionType;
			amountRaw: string;
			categoryId: string;
			frequency: RecurringFrequency;
			note: string;
		}) => void | Promise<void>;
		onToggleRecurring: (id: string, active: boolean) => void | Promise<void>;
		onDeleteRecurring: (id: string) => void | Promise<void>;
		onCreateGoal: (name: string, targetRaw: string) => void | Promise<void>;
		onUpdateGoalSaved: (id: string, savedRaw: string) => void | Promise<void>;
		onDeleteGoal: (id: string) => void | Promise<void>;
		onCaptureNetWorth: () => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
		onCreateCategory: (name: string, kind: CategoryRow['kind']) => void | Promise<void>;
		onRenameCategory: (id: string, name: string) => void | Promise<void>;
		onDeleteCategory: (id: string) => void | Promise<void>;
		onReorderCategories: (
			kind: CategoryRow['kind'],
			orderedIds: string[]
		) => void | Promise<void>;
		ready: boolean;
		error: string | null;
	};

	let {
		account,
		isSinglePot: _isSinglePot,
		balanceMinor,
		transactions,
		categoriesById,
		monthSummary,
		recurringRules,
		goals,
		snapshots,
		expenseCategories,
		incomeCategories,
		lockEnabled,
		themePreference,
		onThemePreferenceChange,
		onRefreshLedger,
		onPrevMonth,
		onNextMonth,
		onExport,
		onImportFile,
		onResetLocalData,
		onCreateRecurring,
		onToggleRecurring,
		onDeleteRecurring,
		onCreateGoal,
		onUpdateGoalSaved,
		onDeleteGoal,
		onCaptureNetWorth,
		onEnableLock,
		onDisableLock,
		onCreateCategory,
		onRenameCategory,
		onDeleteCategory,
		onReorderCategories,
		ready,
		error
	}: Props = $props();

	let txSheetOpen = $state(false);
	let commandOpen = $state(false);
	let editing = $state<LedgerTransaction | null>(null);
	let route = $state<AppRoute>('home');

	const navItems: { id: AppRoute; label: string }[] = [
		{ id: 'home', label: 'Home' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'categories', label: 'Categories' },
		{ id: 'more', label: 'More' }
	];

	const pageTitle = $derived(navItems.find((item) => item.id === route)?.label ?? 'Home');

	function openAdd() {
		editing = null;
		txSheetOpen = true;
	}

	function openEdit(tx: LedgerTransaction) {
		editing = tx;
		txSheetOpen = true;
	}

	function setRoute(next: AppRoute) {
		route = next;
		const hash = routeToHash(next);
		if (typeof location !== 'undefined' && location.hash !== hash) {
			location.hash = hash;
		}
	}

	function navigate(next: string) {
		if (!isAppRoute(next)) return;
		setRoute(next);
	}

	onMount(() => {
		route = parseHash(location.hash);
		const onHashChange = () => {
			route = parseHash(location.hash);
		};
		window.addEventListener('hashchange', onHashChange);
		if (!location.hash || location.hash === '#') {
			history.replaceState(null, '', routeToHash('home'));
		}
		return () => window.removeEventListener('hashchange', onHashChange);
	});
</script>

<div
	class="text-foreground bg-background flex min-h-svh flex-col"
	data-testid="app-shell"
>
	{#if error}
		<main class="mx-auto w-full max-w-3xl px-6 py-8">
			<Card.Root class="border-destructive/40">
				<Card.Header>
					<Card.Title>Something went wrong</Card.Title>
					<Card.Description>{error}</Card.Description>
				</Card.Header>
			</Card.Root>
		</main>
	{:else if !ready}
		<main class="mx-auto w-full max-w-3xl px-6 py-8">
			<Card.Root>
				<Card.Header>
					<Card.Title>Starting up</Card.Title>
					<Card.Description>Preparing your local ledger…</Card.Description>
				</Card.Header>
			</Card.Root>
		</main>
	{:else}
		<Sidebar.Provider class="min-h-svh">
			<AppShellChrome
				{account}
				{balanceMinor}
				{transactions}
				{categoriesById}
				{monthSummary}
				{recurringRules}
				{goals}
				{snapshots}
				{expenseCategories}
				{incomeCategories}
				{lockEnabled}
				{themePreference}
				{route}
				{pageTitle}
				{onThemePreferenceChange}
				{onPrevMonth}
				{onNextMonth}
				{onExport}
				{onImportFile}
				{onResetLocalData}
				{onCreateRecurring}
				{onToggleRecurring}
				{onDeleteRecurring}
				{onCreateGoal}
				{onUpdateGoalSaved}
				{onDeleteGoal}
				{onCaptureNetWorth}
				{onEnableLock}
				{onDisableLock}
				{onCreateCategory}
				{onRenameCategory}
				{onDeleteCategory}
				{onReorderCategories}
				onNavigate={navigate}
				onOpenAdd={openAdd}
				onOpenEdit={openEdit}
			/>
		</Sidebar.Provider>
	{/if}
</div>

{#if account}
	<QuickAddSheet
		open={txSheetOpen}
		accountId={account.id}
		currencyLabel={account.currencyLabel}
		{editing}
		onOpenChange={(next) => {
			txSheetOpen = next;
			if (!next) {
				window.setTimeout(() => {
					editing = null;
				}, 320);
			}
		}}
		onSaved={onRefreshLedger}
	/>
{/if}

<AppCommandPalette
	bind:open={commandOpen}
	onOpenChange={(next) => (commandOpen = next)}
	onNavigate={navigate}
	onAdd={openAdd}
/>
