<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import QuickAddSheet from '$lib/ui/QuickAddSheet.svelte';
	import AppShellChrome from '$lib/ui/AppShellChrome.svelte';
	import AppCommandPalette from '$lib/ui/AppCommandPalette.svelte';
	import type { Account } from '$lib/domain/account';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { CreatePocketInput, UpdatePocketInput } from '$lib/application/accounts';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isAppRoute, isLegacyActivityPath, parsePath, parsePocketId, routeToPath, type AppRoute } from '$lib/shared/router';

	type Props = {
		account: Account | null;
		accounts: Account[];
		isSinglePot: boolean;
		balanceMinor: number;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		monthSummary: MonthSummary | null;
		canPrevMonth?: boolean;
		canNextMonth?: boolean;
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		categoryGroups: OverlayGroup[];
		lockEnabled: boolean;
		signedIn?: boolean;
		themePreference: ThemePreference;
		onThemePreferenceChange: (next: ThemePreference) => void;
		onRefreshLedger: () => void | Promise<void>;
		onPrevMonth: () => void | Promise<void>;
		onNextMonth: () => void | Promise<void>;
		onExport: (passphrase: string) => void | Promise<void>;
		onImportFile: (file: File, passphrase: string) => void | Promise<void>;
		onResetLocalData: (options: {
			preserveCategories: boolean;
			preservePassphrase: boolean;
		}) => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
		onLockSession: () => void;
		onCreatePocket: (input: CreatePocketInput) => void | Promise<void>;
		onUpdatePocket: (input: UpdatePocketInput) => void | Promise<void>;
		onDeletePocket: (id: string) => void | Promise<void>;
		onReorderPockets: (orderedNonMainIds: string[]) => void | Promise<void>;
		onClearPocketGoal: (id: string) => void | Promise<void>;
		onPushTransaction?: (id: string, deleted?: boolean) => void | Promise<void>;
		onSyncConflict?: () => void | Promise<void>;
		cloudConfigured?: boolean;
		userEmail?: string | null;
		sessions?: Array<{
			id: string;
			userAgent: string;
			lastSeenAt: string;
			current: boolean;
		}>;
		idleMinutes?: number;
		leaveTab?: boolean;
		onGoogleSignIn?: () => void | Promise<void>;
		onSignOut?: () => void | Promise<void>;
		onRevokeSession?: (id: string) => void | Promise<void>;
		onIdleMinutes?: (minutes: number) => void;
		onLeaveTab?: (on: boolean) => void;
		onEnrollWebAuthn?: () => void | Promise<void>;
		webauthnEnrolled?: boolean;
		ready: boolean;
		error: string | null;
	};

	let {
		account,
		accounts,
		isSinglePot: _isSinglePot,
		balanceMinor,
		transactions,
		categoriesById,
		monthSummary,
		canPrevMonth = false,
		canNextMonth = false,
		expenseCategories,
		incomeCategories,
		categoryGroups,
		lockEnabled,
		signedIn = false,
		themePreference,
		onThemePreferenceChange,
		onRefreshLedger,
		onPrevMonth,
		onNextMonth,
		onExport,
		onImportFile,
		onResetLocalData,
		onEnableLock,
		onDisableLock,
		onLockSession,
		onCreatePocket,
		onUpdatePocket,
		onDeletePocket,
		onReorderPockets,
		onClearPocketGoal,
		onPushTransaction,
		onSyncConflict,
		cloudConfigured = false,
		userEmail = null,
		sessions = [],
		idleMinutes = 30,
		leaveTab = true,
		onGoogleSignIn,
		onSignOut,
		onRevokeSession,
		onIdleMinutes,
		onLeaveTab,
		onEnrollWebAuthn,
		webauthnEnrolled = false,
		ready,
		error
	}: Props = $props();

	let txSheetOpen = $state(false);
	let commandOpen = $state(false);
	let editing = $state<LedgerTransaction | null>(null);
	let route = $derived(parsePath(page.url.pathname));
	let pocketId = $derived(parsePocketId(page.url.pathname));
	const detailsPocket = $derived(accounts.find((a) => a.id === pocketId) ?? null);
	/** Applied Transactions pocket ids; exactly one → Add default, else Main. */
	let activityPocketFilterIds = $state<string[]>([]);
	/** Clears `editing` after close animation; must cancel if reopened quickly. */
	let clearEditingTimer: number | ReturnType<typeof setTimeout> | null = null;

	const preferredAccountId = $derived(
		detailsPocket
			? detailsPocket.id
			: activityPocketFilterIds.length === 1 &&
				  accounts.some((a) => a.id === activityPocketFilterIds[0])
				? activityPocketFilterIds[0]!
				: (account?.id ?? '')
	);

	const navItems: { id: AppRoute; label: string }[] = [
		{ id: 'home', label: 'Home' },
		{ id: 'transactions', label: 'Transactions' },
		{ id: 'pockets', label: 'Pockets' },
		{ id: 'categories', label: 'Categories' },
		{ id: 'more', label: 'More' }
	];

	const pageTitle = $derived(
		detailsPocket?.name ?? navItems.find((item) => item.id === route)?.label ?? 'Home'
	);

	function cancelClearEditing() {
		if (clearEditingTimer != null) {
			clearTimeout(clearEditingTimer);
			clearEditingTimer = null;
		}
	}

	function openAdd() {
		cancelClearEditing();
		editing = null;
		txSheetOpen = true;
	}

	function openEdit(tx: LedgerTransaction) {
		cancelClearEditing();
		editing = tx;
		txSheetOpen = true;
	}

	function setRoute(next: AppRoute) {
		const path = routeToPath(next);
		if (page.url.pathname !== path) {
			void goto(path);
		}
	}

	function navigate(next: string) {
		if (!isAppRoute(next)) return;
		setRoute(next);
	}

	$effect(() => {
		if (isLegacyActivityPath(page.url.pathname)) {
			void goto('/transactions', { replaceState: true });
		}
	});

	$effect(() => {
		if (!ready) return;
		if (pocketId && !detailsPocket) {
			void goto('/pockets', { replaceState: true });
		}
	});

	const lockViewport = $derived(route === 'categories' || route === 'transactions');
</script>

<div
	class={[
		'text-foreground bg-background flex min-h-svh flex-col',
		lockViewport && 'h-svh overflow-hidden'
	]}
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
		<Sidebar.Provider class={lockViewport ? 'h-svh min-h-0 overflow-hidden' : 'min-h-svh'}>
			<AppShellChrome
				{account}
				{accounts}
				{balanceMinor}
				{transactions}
				{categoriesById}
				{monthSummary}
				{canPrevMonth}
				{canNextMonth}
				{expenseCategories}
				{incomeCategories}
				{categoryGroups}
				{onRefreshLedger}
				{lockEnabled}
				{signedIn}
				{themePreference}
				{route}
				{pageTitle}
				{detailsPocket}
				{onThemePreferenceChange}
				{onPrevMonth}
				{onNextMonth}
				{onExport}
				{onImportFile}
				{onResetLocalData}
				{onEnableLock}
				{onDisableLock}
				{onLockSession}
				{onCreatePocket}
				{onUpdatePocket}
				{onDeletePocket}
				{onReorderPockets}
				{onClearPocketGoal}
				{cloudConfigured}
				{userEmail}
				{sessions}
				{idleMinutes}
				{leaveTab}
				{onGoogleSignIn}
				{onSignOut}
				{onRevokeSession}
				{onIdleMinutes}
				{onLeaveTab}
				{onEnrollWebAuthn}
				{webauthnEnrolled}
				onNavigate={navigate}
				onOpenAdd={openAdd}
				onOpenEdit={openEdit}
				onActivityPocketFilterChange={(pocketIds) => (activityPocketFilterIds = pocketIds)}
			/>
		</Sidebar.Provider>
	{/if}
</div>

{#if account}
	<QuickAddSheet
		open={txSheetOpen}
		accountId={account.id}
		preferredAccountId={preferredAccountId || account.id}
		currencyLabel={account.currencyLabel}
		{accounts}
		{editing}
		onOpenChange={(next) => {
			txSheetOpen = next;
			if (!next) {
				cancelClearEditing();
				clearEditingTimer = window.setTimeout(() => {
					editing = null;
					clearEditingTimer = null;
				}, 320);
			} else {
				cancelClearEditing();
			}
		}}
		onSaved={onRefreshLedger}
		{onPushTransaction}
		{onSyncConflict}
	/>
{/if}

<AppCommandPalette
	bind:open={commandOpen}
	onOpenChange={(next) => (commandOpen = next)}
	onNavigate={navigate}
	onAdd={openAdd}
/>
