<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import QuickAddSheet from '$lib/ui/QuickAddSheet.svelte';
	import PlanSheet from '$lib/ui/PlanSheet.svelte';
	import type { PlanSheetMode } from '$lib/ui/PlanSheet.svelte';
	import AppShellChrome from '$lib/ui/AppShellChrome.svelte';
	import AppCommandPalette from '$lib/ui/AppCommandPalette.svelte';
	import type { Account } from '$lib/domain/account';
	import type { PocketGoal } from '$lib/domain/goals';
	import type { PocketBudget } from '$lib/domain/budgets';
	import type { LedgerPlan } from '$lib/domain/plan';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { CreatePocketInput, UpdatePocketInput } from '$lib/application/accounts';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isAppRoute, isGatePath, nearestValidPath, parsePath, parsePocketId, routeToPath, type AppRoute } from '$lib/shared/router';
	import { DEFAULT_LEAVE_TAB } from '$lib/application/idle';
	import { shouldRedirectMissingPocket } from '$lib/shared/shell-loading';

	type Props = {
		account: Account | null;
		accounts: Account[];
		goals?: PocketGoal[];
		budgets?: PocketBudget[];
		plans?: LedgerPlan[];
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
			preserveSettings: boolean;
			preservePassphrase: boolean;
		}) => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
		onChangeAccountPassphrase?: (oldPass: string, nextPass: string) => void | Promise<void>;
		onLockSession: () => void;
		onCreatePocket: (input: CreatePocketInput) => void | Promise<void>;
		onUpdatePocket: (input: UpdatePocketInput) => void | Promise<void>;
		onDeletePocket: (id: string) => void | Promise<void>;
		onReorderPockets: (orderedNonMainIds: string[]) => void | Promise<void>;
		onPushTransaction?: (id: string, deleted?: boolean) => void | Promise<void>;
		onSyncConflict?: () => void | Promise<void>;
		cloudConfigured?: boolean;
		userEmail?: string | null;
		userDisplayName?: string;
		userPictureUrl?: string;
		sessions?: Array<{
			id: string;
			userAgent: string;
			lastSeenAt: string;
			current: boolean;
		}>;
		idleMinutes?: number;
		leaveTab?: boolean;
		displayCurrency?: string;
		onGoogleSignIn?: () => void | Promise<void>;
		onGoogleCredential?: (idToken: string) => void | Promise<void>;
		cloudError?: string | null;
		onDebugFakeSignUp?: () => void | Promise<void>;
		debugFakeUser?: boolean;
		onSignOut?: () => void | Promise<void>;
		onResetCloudSignOut?: () => void | Promise<void>;
		onResetCloudStaySignedIn?: () => void | Promise<void>;
		onRevokeSession?: (id: string) => void | Promise<void>;
		onSaveIdle?: (minutes: number, leaveTab: boolean) => void | Promise<void>;
		onSaveCurrency?: (code: string) => void | Promise<void>;
		onEnrollWebAuthn?: () => void | Promise<void>;
		webauthnEnrolled?: boolean;
		ledgerReady: boolean;
		monthLoading?: boolean;
		error: string | null;
	};

	let {
		account,
		accounts,
		goals = [],
		budgets = [],
		plans = [],
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
		onChangeAccountPassphrase,
		onLockSession,
		onCreatePocket,
		onUpdatePocket,
		onDeletePocket,
		onReorderPockets,
		onPushTransaction,
		onSyncConflict,
		cloudConfigured = false,
		userEmail = null,
		userDisplayName = '',
		userPictureUrl = '',
		sessions = [],
		idleMinutes = 30,
		leaveTab = DEFAULT_LEAVE_TAB,
		displayCurrency = 'IDR',
		onGoogleSignIn,
		onGoogleCredential,
		cloudError = null,
		onDebugFakeSignUp,
		debugFakeUser = false,
		onSignOut,
		onResetCloudSignOut,
		onResetCloudStaySignedIn,
		onRevokeSession,
		onSaveIdle,
		onSaveCurrency,
		onEnrollWebAuthn,
		webauthnEnrolled = false,
		ledgerReady,
		monthLoading = false,
		error
	}: Props = $props();

	let txSheetOpen = $state(false);
	let commandOpen = $state(false);
	let editing = $state<LedgerTransaction | null>(null);
	let planSheetOpen = $state(false);
	let planSheetMode = $state<PlanSheetMode>('create');
	let editingPlan = $state<LedgerPlan | null>(null);
	let planImpliedAccountId = $state('');
	let clearPlanTimer: number | ReturnType<typeof setTimeout> | null = null;
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
		{ id: 'pockets', label: 'Pockets' },
		{ id: 'transactions', label: 'Transactions' },
		{ id: 'plans', label: 'Plans' },
		{ id: 'categories', label: 'Categories' },
		{ id: 'settings', label: 'Settings' }
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
		const path = page.url.pathname.replace(/\/+$/, '') || '/';
		const nearest = nearestValidPath(path);
		if (isGatePath(nearest)) return;
		if (pocketId && !detailsPocket && !ledgerReady) {
			if (path !== nearest) void goto(nearest, { replaceState: true });
			return;
		}
		const desired = shouldRedirectMissingPocket({
			pocketId,
			pocketFound: Boolean(detailsPocket),
			ledgerReady
		})
			? '/pockets'
			: nearest;
		if (path !== desired) void goto(desired, { replaceState: true });
	});

	function openAddPlan(accountId?: string) {
		if (clearPlanTimer != null) {
			clearTimeout(clearPlanTimer);
			clearPlanTimer = null;
		}
		editingPlan = null;
		planSheetMode = 'create';
		planImpliedAccountId = accountId ?? '';
		planSheetOpen = true;
	}

	function openPlan(plan: LedgerPlan, nextMode: PlanSheetMode) {
		if (clearPlanTimer != null) {
			clearTimeout(clearPlanTimer);
			clearPlanTimer = null;
		}
		editingPlan = plan;
		planSheetMode = nextMode;
		planImpliedAccountId = '';
		planSheetOpen = true;
	}

	const lockViewport = $derived(
		route === 'categories' || route === 'transactions' || route === 'plans'
	);
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
	{:else}
		<Sidebar.Provider class={lockViewport ? 'h-svh min-h-0 overflow-hidden' : 'min-h-svh'}>
			<AppShellChrome
				{account}
				{accounts}
				{goals}
				{budgets}
				{plans}
				{balanceMinor}
				{transactions}
				{categoriesById}
				{monthSummary}
				{canPrevMonth}
				{canNextMonth}
				{ledgerReady}
				{monthLoading}
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
				{pocketId}
				{onThemePreferenceChange}
				{onPrevMonth}
				{onNextMonth}
				{onExport}
				{onImportFile}
				{onResetLocalData}
				{onEnableLock}
				{onDisableLock}
				{onChangeAccountPassphrase}
				{onLockSession}
				{onCreatePocket}
				{onUpdatePocket}
				{onDeletePocket}
				{onReorderPockets}
				{cloudConfigured}
				{userEmail}
				{userDisplayName}
				{userPictureUrl}
				{sessions}
				{idleMinutes}
				{leaveTab}
				{displayCurrency}
				{onGoogleSignIn}
				{onGoogleCredential}
				{cloudError}
				{onDebugFakeSignUp}
				{debugFakeUser}
				{onSignOut}
				{onResetCloudSignOut}
				{onResetCloudStaySignedIn}
				{onRevokeSession}
				{onSaveIdle}
				{onSaveCurrency}
				{onEnrollWebAuthn}
				{webauthnEnrolled}
				onNavigate={navigate}
				onOpenAdd={openAdd}
				onOpenEdit={openEdit}
				onOpenAddPlan={openAddPlan}
				onOpenPlan={openPlan}
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
		currencyLabel={displayCurrency}
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
		{budgets}
		ledgerTransactions={transactions}
		{categoriesById}
		onGoToPocket={(id) => void goto(`/pockets/${id}`)}
	/>
{/if}

{#if account}
	<PlanSheet
		open={planSheetOpen}
		mode={planSheetMode}
		currencyLabel={displayCurrency}
		{accounts}
		impliedAccountId={planImpliedAccountId || preferredAccountId || account.id}
		editing={editingPlan}
		onOpenChange={(next) => {
			planSheetOpen = next;
			if (!next) {
				if (clearPlanTimer != null) clearTimeout(clearPlanTimer);
				clearPlanTimer = window.setTimeout(() => {
					editingPlan = null;
					clearPlanTimer = null;
				}, 320);
			} else if (clearPlanTimer != null) {
				clearTimeout(clearPlanTimer);
				clearPlanTimer = null;
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
