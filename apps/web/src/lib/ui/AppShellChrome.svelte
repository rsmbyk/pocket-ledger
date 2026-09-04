<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import HomeIcon from '@lucide/svelte/icons/house';
	import ListIcon from '@lucide/svelte/icons/list';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import TagsIcon from '@lucide/svelte/icons/tags';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchIcon from '@lucide/svelte/icons/search';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import LockIcon from '@lucide/svelte/icons/lock';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import FilterCheckSelect from '$lib/ui/FilterCheckSelect.svelte';
	import ThemeMenu from '$lib/ui/ThemeMenu.svelte';
	import MonthSummaryCard from '$lib/ui/MonthSummary.svelte';
	import MorePanel from '$lib/ui/MorePanel.svelte';
	import CategoriesPanel from '$lib/ui/CategoriesPanel.svelte';
	import PocketsPanel from '$lib/ui/PocketsPanel.svelte';
	import PocketDetailsPanel from '$lib/ui/PocketDetailsPanel.svelte';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import ActivityTable from '$lib/ui/ActivityTable.svelte';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import TransactionRangePicker from '$lib/ui/TransactionRangePicker.svelte';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { Account } from '$lib/domain/account';
	import type { PocketGoal } from '$lib/domain/goals';
	import { verifyPassphrase } from '$lib/application/lock';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { CreatePocketInput, UpdatePocketInput } from '$lib/application/accounts';
	import { derivePocketBalance } from '$lib/domain/pocket-balance';
	import { formatMinor } from '$lib/domain/money';
	import { isAppRoute, type AppRoute } from '$lib/shared/router';
	import {
		DEFAULT_ACTIVITY_FILTERS,
		activityFiltersEqual,
		categoryKindsForTypes,
		countAdvancedFilters,
		filterTransactions,
		hasAdminFeeLedgerRow,
		hasUncategorizedLedgerRow,
		isCategoryFilterDisabled,
		isDefaultActivityFilters,
		normalizeActivityFilters,
		resolveCategoryIdsForTypes,
		shouldShowActivityCategoryFilter,
		usedCategoryIds,
		type ActivityFilterCriteria,
		type ActivityTxType
	} from '$lib/domain/activity-filters';
	import {
		type TransactionDateRange
	} from '$lib/domain/transaction-date-range';
	import { STOCK_CUSTOM_ICON, STOCK_UNCATEGORIZED_ICON } from '$lib/domain/default-category-catalog';
	import { shouldIgnoreDismissForFloatingMenu, shouldIgnoreDismissForNativePicker } from '$lib/ui/native-picker-dismiss';
	import { readHideAmounts, writeHideAmounts } from '$lib/shared/hide-amounts';
	import {
		readActivityListSession,
		writeActivityListSession,
		activitySessionForPocket
	} from '$lib/shared/activity-list-session';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import CategoryPicker from '$lib/ui/CategoryPicker.svelte';

	type Props = {
		account: Account | null;
		accounts: Account[];
		goals?: PocketGoal[];
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
		route: AppRoute;
		pageTitle: string;
		detailsPocket?: Account | null;
		onThemePreferenceChange: (next: ThemePreference) => void;
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
		onLockSession: () => void;
		onRefreshLedger: () => void | Promise<void>;
		onCreatePocket: (input: CreatePocketInput) => void | Promise<void>;
		onUpdatePocket: (input: UpdatePocketInput) => void | Promise<void>;
		onDeletePocket: (id: string) => void | Promise<void>;
		onReorderPockets: (orderedNonMainIds: string[]) => void | Promise<void>;
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
		displayCurrency?: string;
		onGoogleSignIn?: () => void | Promise<void>;
		onGoogleCredential?: (idToken: string) => void | Promise<void>;
		onSignOut?: () => void | Promise<void>;
		onRevokeSession?: (id: string) => void | Promise<void>;
		onSaveIdle?: (minutes: number, leaveTab: boolean) => void | Promise<void>;
		onSaveCurrency?: (code: string) => void | Promise<void>;
		onEnrollWebAuthn?: () => void | Promise<void>;
		webauthnEnrolled?: boolean;
		onNavigate: (route: AppRoute) => void;
		onOpenAdd: () => void;
		onOpenEdit: (tx: LedgerTransaction) => void;
		/** Applied Transactions pocket ids for Add default (exactly one → that pocket). */
		onActivityPocketFilterChange?: (pocketIds: string[]) => void;
	};

	let {
		account,
		accounts,
		goals = [],
		balanceMinor,
		transactions,
		categoriesById,
		monthSummary,
		canPrevMonth = false,
		canNextMonth = false,
		expenseCategories: _expenseCategories,
		incomeCategories: _incomeCategories,
		categoryGroups,
		lockEnabled,
		signedIn = false,
		themePreference,
		route,
		pageTitle,
		detailsPocket = null,
		onThemePreferenceChange,
		onPrevMonth,
		onNextMonth,
		onExport,
		onImportFile,
		onResetLocalData,
		onEnableLock,
		onDisableLock,
		onLockSession,
		onRefreshLedger,
		onCreatePocket,
		onUpdatePocket,
		onDeletePocket,
		onReorderPockets,
		cloudConfigured = false,
		userEmail = null,
		sessions = [],
		idleMinutes = 30,
		leaveTab = true,
		displayCurrency = 'IDR',
		onGoogleSignIn,
		onGoogleCredential,
		onSignOut,
		onRevokeSession,
		onSaveIdle,
		onSaveCurrency,
		onEnrollWebAuthn,
		webauthnEnrolled = false,
		onNavigate,
		onOpenAdd,
		onOpenEdit,
		onActivityPocketFilterChange
	}: Props = $props();

	const sidebar = Sidebar.useSidebar();

	/** Matches Tailwind `md`. */
	const desktop = new MediaQuery('min-width: 768px');
	/** Matches Tailwind `xl` — wide layout uses a non-blocking filter drawer. */
	const xlWide = new MediaQuery('min-width: 1280px');

	const currencyLabel = $derived(displayCurrency);
	const recent = $derived(transactions.slice(0, 5));

	let hideHomeAmounts = $state(readHideAmounts());
	let showMoneyDialogOpen = $state(false);
	let showMoneyPass = $state('');
	let showMoneyError = $state<string | null>(null);
	let showMoneyBusy = $state(false);

	const initialActivitySession = readActivityListSession();
	let applied = $state<ActivityFilterCriteria>(
		normalizeActivityFilters(initialActivitySession.filters)
	);
	let draft = $state<ActivityFilterCriteria>(
		normalizeActivityFilters(initialActivitySession.filters)
	);
	let dateRange = $state<TransactionDateRange>(initialActivitySession.range);
	let filtersOpen = $state(false);
	let filtersSheetRef = $state<HTMLElement | null>(null);
	let discardWarnOpen = $state(false);
	let categoriesReorderDirty = $state(false);
	let pendingNav = $state<AppRoute | null>(null);
	let leaveCategoriesOpen = $state(false);
	let detailsEditRequest = $state<Account | null>(null);

	const categoryKinds = $derived(
		Object.fromEntries(Object.values(categoriesById).map((c) => [c.id, c.kind]))
	);
	const usedIds = $derived(usedCategoryIds(transactions));
	const showActivityCategoryFilter = $derived(shouldShowActivityCategoryFilter(transactions));
	const usedIncomeCategories = $derived(
		Object.values(categoriesById).filter((c) => c.kind === 'income' && usedIds.has(c.id))
	);
	const usedExpenseCategories = $derived(
		Object.values(categoriesById).filter((c) => c.kind === 'expense' && usedIds.has(c.id))
	);
	const categoryFilterDisabled = $derived(isCategoryFilterDisabled(draft.types));
	const categoryKindsAllowed = $derived(categoryKindsForTypes(draft.types));
	const categoryGroupByKind = $derived(
		categoryKindsAllowed === 'all' ||
			(Array.isArray(categoryKindsAllowed) &&
				categoryKindsAllowed.includes('income') &&
				categoryKindsAllowed.includes('expense'))
	);
	const categoryShowAdminFee = $derived(
		showActivityCategoryFilter &&
			hasAdminFeeLedgerRow(transactions) &&
			(categoryKindsAllowed === 'all' ||
				(Array.isArray(categoryKindsAllowed) && categoryKindsAllowed.includes('expense')))
	);
	const categoryShowUncategorized = $derived(
		showActivityCategoryFilter && hasUncategorizedLedgerRow(transactions)
	);
	const categoryPickerIncome = $derived(
		categoryKindsAllowed === 'all' ||
			(Array.isArray(categoryKindsAllowed) && categoryKindsAllowed.includes('income'))
			? usedIncomeCategories
			: []
	);
	const categoryPickerExpense = $derived(
		categoryKindsAllowed === 'all' ||
			(Array.isArray(categoryKindsAllowed) && categoryKindsAllowed.includes('expense'))
			? usedExpenseCategories
			: []
	);
	const categoryPickerFlat = $derived(
		categoryGroupByKind
			? []
			: Array.isArray(categoryKindsAllowed) && categoryKindsAllowed.includes('income')
				? usedIncomeCategories
				: usedExpenseCategories
	);

	const filtersSheetSide = $derived<'bottom' | 'right'>(desktop.current ? 'right' : 'bottom');
	const filtersSheetClass = $derived(
		filtersSheetSide === 'bottom'
			? 'mx-auto flex max-h-[100svh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
			: 'w-full gap-0 p-0 sm:max-w-sm'
	);
	const activityStageWide = $derived(route === 'transactions' && xlWide.current);

	const advancedFilterCount = $derived(countAdvancedFilters(applied));
	const hasAdvancedFilters = $derived(advancedFilterCount > 0);
	const toolbarActiveChrome =
		'border-primary text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20 shadow-xs';
	const draftDirty = $derived(
		!activityFiltersEqual(draft, applied, { ignoreSearch: true, ignoreDates: true })
	);
	const canApplyDraft = $derived(draftDirty);
	const canClearDraft = $derived(!isDefaultActivityFilters({ ...draft, search: '' }));

	const filteredTransactions = $derived(
		filterTransactions(transactions, {
			...applied,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate
		})
	);

	const pocketsById = $derived(
		Object.fromEntries(accounts.map((a) => [a.id, { name: a.name, isMain: a.isMain }]))
	);
	const pocketBalances = $derived(
		Object.fromEntries(accounts.map((a) => [a.id, derivePocketBalance(a, transactions)]))
	);

	const navItems: {
		id: AppRoute;
		label: string;
		icon: typeof HomeIcon;
	}[] = [
		{ id: 'home', label: 'Home', icon: HomeIcon },
		{ id: 'transactions', label: 'Transactions', icon: ListIcon },
		{ id: 'pockets', label: 'Pockets', icon: LandmarkIcon },
		{ id: 'categories', label: 'Categories', icon: TagsIcon },
		{ id: 'settings', label: 'Settings', icon: SettingsIcon }
	];

	function cloneFilters(criteria: ActivityFilterCriteria): ActivityFilterCriteria {
		return normalizeActivityFilters(criteria);
	}

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		return categoriesById[categoryId]?.name ?? 'Category';
	}

	function categoryIconSlug(tx: LedgerTransaction): string {
		if (tx.categoryId == null) return STOCK_UNCATEGORIZED_ICON;
		return categoriesById[tx.categoryId]?.icon || STOCK_CUSTOM_ICON;
	}

	function homeMoney(amount: number): string {
		return hideHomeAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}

	function toggleHomeAmounts() {
		if (!hideHomeAmounts) {
			hideHomeAmounts = true;
			writeHideAmounts(true);
			return;
		}
		if (lockEnabled) {
			showMoneyPass = '';
			showMoneyError = null;
			showMoneyDialogOpen = true;
			return;
		}
		hideHomeAmounts = false;
		writeHideAmounts(false);
	}

	async function confirmShowMoney() {
		showMoneyBusy = true;
		showMoneyError = null;
		try {
			const ok = await verifyPassphrase(showMoneyPass);
			if (!ok) {
				showMoneyError = 'Incorrect passphrase';
				return;
			}
			hideHomeAmounts = false;
			writeHideAmounts(false);
			showMoneyDialogOpen = false;
			showMoneyPass = '';
		} finally {
			showMoneyBusy = false;
		}
	}

	function navigate(next: string) {
		if (!isAppRoute(next)) return;
		if (route === 'categories' && categoriesReorderDirty && next !== 'categories') {
			pendingNav = next;
			leaveCategoriesOpen = true;
			return;
		}
		onNavigate(next);
		sidebar.setOpenMobile(false);
	}

	function openAdd() {
		onOpenAdd();
		sidebar.setOpenMobile(false);
	}

	function openFilters() {
		draft = syncDraftCategory(cloneFilters(applied));
		filtersOpen = true;
	}

	function syncDraftCategory(next: ActivityFilterCriteria): ActivityFilterCriteria {
		return {
			...next,
			categoryIds: resolveCategoryIdsForTypes(next.categoryIds, next.types, categoryKinds)
		};
	}

	function persistActivityListSession() {
		writeActivityListSession({ filters: applied, range: dateRange });
	}

	function seeMoreForPocket(pocketId: string) {
		const session = activitySessionForPocket(pocketId);
		applied = normalizeActivityFilters(session.filters);
		draft = cloneFilters(applied);
		dateRange = session.range;
		writeActivityListSession(session);
		onActivityPocketFilterChange?.([...applied.pocketIds]);
		navigate('transactions');
	}

	function setDateRange(next: TransactionDateRange) {
		dateRange = next;
		writeActivityListSession({ filters: applied, range: next });
	}

	$effect(() => {
		if (showActivityCategoryFilter) return;
		if (draft.categoryIds.length === 0 && applied.categoryIds.length === 0) return;
		if (draft.categoryIds.length > 0) draft = { ...draft, categoryIds: [] };
		if (applied.categoryIds.length > 0) {
			applied = { ...applied, categoryIds: [] };
			persistActivityListSession();
		}
	});

	function onFilterTypesChange(next: string[]) {
		draft = syncDraftCategory({
			...draft,
			types: next.filter((t): t is ActivityTxType =>
				t === 'income' || t === 'expense' || t === 'transfer'
			)
		});
	}

	function applyFilters() {
		applied = { ...cloneFilters(draft), search: applied.search };
		onActivityPocketFilterChange?.([...applied.pocketIds]);
		persistActivityListSession();
		if (!xlWide.current) filtersOpen = false;
	}

	function requestCloseFilters() {
		if (draftDirty) {
			discardWarnOpen = true;
			return;
		}
		filtersOpen = false;
	}

	function onFiltersOpenChange(open: boolean) {
		if (open) {
			draft = syncDraftCategory(cloneFilters(applied));
			filtersOpen = true;
			return;
		}
		if (draftDirty) {
			discardWarnOpen = true;
			return;
		}
		filtersOpen = false;
	}

	function onFiltersDismissAttempt(e: Event) {
		if (shouldIgnoreDismissForNativePicker(e) || shouldIgnoreDismissForFloatingMenu(e)) {
			e.preventDefault();
			return;
		}
		if (draftDirty || discardWarnOpen) {
			e.preventDefault();
			if (draftDirty) discardWarnOpen = true;
		}
	}

	function onFiltersSheetAutoFocus(e: Event) {
		e.preventDefault();
		const fromEvent =
			e.currentTarget instanceof HTMLElement
				? e.currentTarget
				: e.target instanceof HTMLElement
					? e.target.closest('[data-testid="activity-filters-sheet"]')
					: null;
		const panel = filtersSheetRef ?? fromEvent;
		if (!(panel instanceof HTMLElement)) return;
		panel.tabIndex = -1;
		const focusPanel = () => panel.focus({ preventScroll: true });
		requestAnimationFrame(focusPanel);
		setTimeout(focusPanel, 0);
	}

	function confirmDiscardFilters() {
		draft = cloneFilters(applied);
		filtersOpen = false;
	}

	function clearDraftFilters() {
		draft = { ...DEFAULT_ACTIVITY_FILTERS, search: applied.search };
	}

	function updateAppliedSearch(next: string) {
		applied = { ...applied, search: next };
		persistActivityListSession();
	}

	$effect(() => {
		if (route !== 'transactions' || !xlWide.current) return;
		draft = cloneFilters(applied);
	});

	onMount(() => {
		onActivityPocketFilterChange?.([...applied.pocketIds]);
	});
</script>

<Sidebar.Root collapsible="offcanvas">
	<Sidebar.Header class="p-4">
		<div class="flex flex-col items-center gap-2 text-center">
			<img src="/favicon.svg" alt="" width="36" height="36" class="size-9 rounded-lg" />
			<p class="text-sm font-semibold">Pocket Ledger</p>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu data-testid="app-nav" aria-label="Primary">
					{#each navItems as item (item.id)}
						{@const Icon = item.icon}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								size="lg"
								isActive={route === item.id}
								class="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
								data-testid={`nav-${item.id}`}
								aria-current={route === item.id ? 'page' : undefined}
								onclick={() => navigate(item.id)}
							>
								<Icon />
								<span>{item.label}</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	{#if signedIn && userEmail}
		<Sidebar.Footer class="p-2">
			<button
				type="button"
				class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center rounded-md px-2 py-2 text-left text-sm"
				data-testid="sidebar-account"
			>
				<span class="truncate">{userEmail}</span>
			</button>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>

<Sidebar.Inset
	class={route === 'categories' || route === 'transactions'
		? 'h-svh min-h-0 overflow-hidden'
		: undefined}
>
	<header
		class="bg-background sticky top-0 z-10 flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2 md:px-6"
	>
		<Sidebar.Trigger data-testid="open-menu" />
		<div class="min-w-0 flex-1">
			<div class="flex min-w-0 items-center gap-1">
				{#if detailsPocket}
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						data-testid="pocket-details-back"
						aria-label="Back to pockets"
						onclick={() => navigate('pockets')}
					>
						<ChevronLeftIcon class="size-4" />
					</Button>
				{/if}
				<p class="text-base font-semibold tracking-tight md:text-lg" data-testid="page-title">
					{#if detailsPocket}
						<PocketLabel
							name={detailsPocket.name}
							isMain={detailsPocket.isMain}
							class="font-semibold"
						/>
					{:else}
						{pageTitle}
					{/if}
				</p>
			</div>
		</div>
		{#if detailsPocket}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				data-testid="pocket-details-edit"
				aria-label={`Edit ${detailsPocket.name}`}
				onclick={() => (detailsEditRequest = detailsPocket)}
			>
				<PencilIcon class="size-4" />
			</Button>
		{/if}
		{#if route === 'home' || detailsPocket}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				data-testid="toggle-home-amounts"
				aria-label={hideHomeAmounts ? 'Show money' : 'Hide money'}
				onclick={toggleHomeAmounts}
			>
				{#if hideHomeAmounts}
					<EyeOffIcon class="size-4" />
				{:else}
					<EyeIcon class="size-4" />
				{/if}
			</Button>
		{/if}
		{#if lockEnabled}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				data-testid="header-lock"
				aria-label="Lock app"
				onclick={() => onLockSession()}
			>
				<LockIcon class="size-4" />
			</Button>
		{/if}
		<ThemeMenu preference={themePreference} onPreferenceChange={onThemePreferenceChange} />
	</header>

	{#if route === 'transactions'}
		<div
			class="bg-background shrink-0 border-b px-4 py-3 md:px-6"
			data-testid="activity-chrome"
		>
			<div class="flex flex-col gap-3">
				<div class="flex justify-center" data-testid="activity-range">
					<TransactionRangePicker range={dateRange} onRangeChange={setDateRange} />
				</div>
				<div class="flex items-center gap-2">
					<div class="relative min-w-0 flex-1" data-testid="activity-filters">
						<SearchIcon
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
							aria-hidden="true"
						/>
						<Input
							id="activity-filter-search"
							type="search"
							placeholder="Note or amount"
							class="h-9 pl-9"
							value={applied.search ?? ''}
							data-testid="activity-filter-search"
							oninput={(e) => updateAppliedSearch(e.currentTarget.value)}
						/>
					</div>
					{#if !xlWide.current}
						<Button
							type="button"
							variant="outline"
							size="icon"
							class={['relative shrink-0', hasAdvancedFilters && toolbarActiveChrome]}
							aria-label="Filters"
							aria-pressed={hasAdvancedFilters}
							data-testid="activity-filters-open"
							data-active={hasAdvancedFilters ? 'true' : undefined}
							onclick={openFilters}
						>
							<SlidersHorizontalIcon class="size-4" />
							{#if hasAdvancedFilters}
								<span
									class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full text-[10px] font-medium tabular-nums"
									data-testid="activity-filters-badge"
								>
									{advancedFilterCount}
								</span>
							{/if}
						</Button>
					{/if}
				</div>
				<div class="flex justify-end">
					<Button
						type="button"
						size="sm"
						disabled={!account}
						onclick={openAdd}
						data-testid="activity-add"
					>
						<PlusIcon class="size-4" />
						Add Transaction
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<div
		class={[
			'mx-auto flex w-full flex-1 flex-col gap-4 p-4 pb-8 md:gap-4 md:p-6 md:pb-8 max-w-3xl',
			'data-[stage=wide]:max-w-none!',
			route === 'categories' &&
				'min-h-0 flex-1 overflow-hidden px-0! pt-0! pb-0! md:px-0! md:pt-0! md:pb-0!',
			route === 'transactions' && 'min-h-0 flex-1 overflow-y-auto'
		]}
		data-stage={route === 'categories' || activityStageWide ? 'wide' : 'narrow'}
		data-testid="app-stage"
	>
		{#if route === 'home'}
			<div class="space-y-4" data-testid="home-panel">
				<section
					class="border-border/80 bg-card flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-[var(--elev-card)]"
					data-testid="balance-hero"
				>
					<p class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
						<WalletIcon class="size-3.5" aria-hidden="true" />
						Balance
					</p>
					<p
						class="text-2xl font-semibold tracking-tight md:text-3xl"
						data-testid="account-balance"
					>
						{homeMoney(balanceMinor)}
					</p>
				</section>

				{#if monthSummary}
					<MonthSummaryCard
						summary={monthSummary}
						{currencyLabel}
						hideAmounts={hideHomeAmounts}
						canPrev={canPrevMonth}
						canNext={canNextMonth}
						onPrevMonth={() => void onPrevMonth()}
						onNextMonth={() => void onNextMonth()}
					/>
				{/if}

				<Card.Root class="gap-0 py-0" data-testid="recent-card">
					<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
						<Card.Title class="inline-flex items-center gap-1.5 text-base">
							<HistoryIcon class="size-4" aria-hidden="true" />
							Recent
						</Card.Title>
						<Button
							type="button"
							size="sm"
							disabled={!account}
							onclick={openAdd}
							data-testid="recent-add"
						>
							<PlusIcon class="size-4" />
							Add
						</Button>
					</Card.Header>
					<Card.Content class="px-2 pb-2">
						{#if recent.length === 0}
							<EmptyState
								testid="recent-empty"
								title="No recent activity"
								description="Transactions you add will show up here."
								class="px-2 pb-2"
							>
								{#snippet icon()}
									<InboxIcon class="size-5" />
								{/snippet}
							</EmptyState>
						{:else}
							<ul class="divide-border divide-y" data-testid="recent-list">
								{#each recent as tx (tx.id)}
									<li>
										<TransactionListRow
											{tx}
											{currencyLabel}
											categoryLabel={categoryName(tx.categoryId)}
											uncategorized={tx.categoryId == null}
											hideAmount={hideHomeAmounts}
											secondary="date"
											{pocketsById}
											showPocket
											testid={`recent-row-${tx.id}`}
											onOpen={() => onOpenEdit(tx)}
										/>
									</li>
								{/each}
							</ul>
						{/if}
						<Button
							type="button"
							variant="ghost"
							class="text-muted-foreground hover:text-foreground mt-1 w-full justify-center text-sm"
							data-testid="recent-see-more"
							onclick={() => navigate('transactions')}
						>
							See more in Transactions
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		{:else if route === 'transactions'}
			<div
				data-testid="activity-panel"
				class={xlWide.current ? 'flex min-h-0 gap-4' : 'min-h-0 space-y-3'}
			>
				{#snippet filterFormFields()}
					<div class="space-y-1">
						<Label for="activity-filter-type">Type</Label>
						<FilterCheckSelect
							id="activity-filter-type"
							testid="activity-filter-type"
							ariaLabel="Type"
							values={[...draft.types]}
							onValuesChange={onFilterTypesChange}
							items={[
								{ id: 'income', label: 'Income', testid: 'activity-filter-type-income' },
								{ id: 'expense', label: 'Expense', testid: 'activity-filter-type-expense' },
								{ id: 'transfer', label: 'Transfer', testid: 'activity-filter-type-transfer' }
							]}
						/>
					</div>
					{#if showActivityCategoryFilter}
						<div class="space-y-1">
							<Label for="activity-filter-category">Category</Label>
							<CategoryPicker
								id="activity-filter-category"
								testid="activity-filter-category"
								multiple
								values={[...draft.categoryIds]}
								onValuesChange={(next) => (draft = { ...draft, categoryIds: next })}
								categories={categoryPickerFlat}
								incomeCategories={categoryPickerIncome}
								expenseCategories={categoryPickerExpense}
								groups={categoryGroups}
								groupByKind={categoryGroupByKind}
								showAdminFee={categoryShowAdminFee}
								showUncategorized={categoryShowUncategorized}
								emptyMeans="all"
								disabled={categoryFilterDisabled}
								ariaLabel="Category"
							/>
						</div>
					{/if}
					<div class="space-y-1">
						<Label for="activity-filter-pocket">Pocket</Label>
						<FilterCheckSelect
							id="activity-filter-pocket"
							testid="activity-filter-pocket"
							ariaLabel="Pocket"
							values={[...draft.pocketIds]}
							onValuesChange={(next) => (draft = { ...draft, pocketIds: next })}
							items={accounts.map((pocket) => ({
								id: pocket.id,
								label: pocket.name,
								testid: `activity-filter-pocket-option-${pocket.id}`
							}))}
						>
							{#snippet item(row)}
								{@const pocket = accounts.find((a) => a.id === row.id)}
								{#if pocket}
									<PocketLabel name={pocket.name} isMain={pocket.isMain} optical />
								{:else}
									{row.label}
								{/if}
							{/snippet}
						</FilterCheckSelect>
					</div>
					<label class="flex cursor-pointer items-center gap-2 text-sm">
						<input
							type="checkbox"
							class="size-5 cursor-pointer accent-primary md:size-4"
							checked={draft.showVoided}
							onchange={(e) => (draft = { ...draft, showVoided: e.currentTarget.checked })}
							data-testid="activity-filter-show-voided"
						/>
						Show voided
					</label>
				{/snippet}

				{#snippet filterPanel()}
					{@const persistent = xlWide.current}
					<div
						class={[
							'border-border flex flex-row items-center gap-2 border-b px-4 py-3 text-left',
							persistent ? 'justify-end' : 'justify-between'
						]}
					>
						{#if !persistent}
							<p class="inline-flex items-center gap-2 text-base font-semibold">
								<SlidersHorizontalIcon class="size-4" aria-hidden="true" />
								Filters
							</p>
						{/if}
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!canClearDraft}
							data-testid="activity-filters-clear"
							onclick={clearDraftFilters}
						>
							<RotateCcwIcon class="size-4" />
							Clear
						</Button>
					</div>
					<div class="grid gap-3 overflow-y-auto px-4 py-4">
						{@render filterFormFields()}
					</div>
					<div class="border-border flex flex-row gap-2 border-t px-4 py-3">
						{#if !persistent}
							<Button
								type="button"
								variant="outline"
								class="flex-1"
								data-testid="activity-filters-close"
								onclick={requestCloseFilters}
							>
								Close
							</Button>
						{/if}
						<Button
							type="button"
							class={persistent ? 'w-full' : 'flex-1'}
							disabled={!canApplyDraft}
							data-testid="activity-filters-apply"
							onclick={applyFilters}
						>
							Apply
						</Button>
					</div>
				{/snippet}

				<div class="min-w-0 min-h-0 flex-1 space-y-3">
					{#if !xlWide.current}
						<Sheet.Root open={filtersOpen} onOpenChange={onFiltersOpenChange}>
							<Sheet.Content
								bind:ref={filtersSheetRef}
								side={filtersSheetSide}
								class={filtersSheetClass}
								data-testid="activity-filters-sheet"
								showCloseButton={false}
								interactOutsideBehavior="close"
								escapeKeydownBehavior="close"
								onInteractOutside={onFiltersDismissAttempt}
								onEscapeKeydown={onFiltersDismissAttempt}
								onOpenAutoFocus={onFiltersSheetAutoFocus}
							>
								<Sheet.Title class="sr-only">Filters</Sheet.Title>
								{@render filterPanel()}
							</Sheet.Content>
						</Sheet.Root>
					{/if}

					<ConfirmDialog
						open={discardWarnOpen}
						title="Discard filter changes?"
						description="Your filter changes have not been applied and will be lost."
						confirmLabel="Discard"
						cancelLabel="Keep editing"
						destructive
						confirmTestId="activity-filters-discard-confirm"
						onOpenChange={(open) => (discardWarnOpen = open)}
						onConfirm={confirmDiscardFilters}
					/>

					<ActivityTable
						transactions={filteredTransactions}
						totalCount={transactions.length}
						{currencyLabel}
						{categoryName}
						{categoryIconSlug}
						{pocketsById}
						onEdit={onOpenEdit}
					/>
				</div>

				{#if xlWide.current}
					<aside
						data-testid="activity-filters-drawer"
						class="border-border bg-card flex w-72 shrink-0 flex-col border-l"
					>
						{@render filterPanel()}
					</aside>
				{/if}
			</div>
		{:else if route === 'pockets'}
			{#if detailsPocket}
				<PocketDetailsPanel
					pocket={detailsPocket}
					balance={pocketBalances[detailsPocket.id] ?? 0}
					{currencyLabel}
					{transactions}
					{categoriesById}
					pockets={accounts}
					{goals}
					hideAmounts={hideHomeAmounts}
					onAdd={openAdd}
					onSeeMore={() => seeMoreForPocket(detailsPocket.id)}
					onOpenTx={onOpenEdit}
					onRefresh={onRefreshLedger}
				/>
			{/if}
			<PocketsPanel
				pockets={accounts}
				balances={pocketBalances}
				{currencyLabel}
				{goals}
				{onCreatePocket}
				{onUpdatePocket}
				onDeletePocket={async (id) => {
					await onDeletePocket(id);
					if (detailsPocket?.id === id) onNavigate('pockets');
				}}
				{onReorderPockets}
				requestEdit={detailsEditRequest}
				onRequestEditConsumed={() => (detailsEditRequest = null)}
				hideList={Boolean(detailsPocket)}
			/>
		{:else if route === 'categories'}
			<CategoriesPanel
				categories={Object.values(categoriesById)}
				groups={categoryGroups}
				onRefresh={onRefreshLedger}
				bind:reorderDirty={categoriesReorderDirty}
			/>
		{:else}
			<MorePanel
				{lockEnabled}
				{signedIn}
				{cloudConfigured}
				{userEmail}
				{sessions}
				{idleMinutes}
				{leaveTab}
				{displayCurrency}
				{onExport}
				{onImportFile}
				{onResetLocalData}
				{onEnableLock}
				{onDisableLock}
				{onGoogleSignIn}
				{onGoogleCredential}
				{onSignOut}
				{onRevokeSession}
				{onSaveIdle}
				{onSaveCurrency}
				{onEnrollWebAuthn}
				{webauthnEnrolled}
			/>
		{/if}
	</div>
</Sidebar.Inset>

<Dialog.Root
	bind:open={showMoneyDialogOpen}
	onOpenChange={(open) => {
		showMoneyDialogOpen = open;
		if (!open) {
			showMoneyPass = '';
			showMoneyError = null;
		}
	}}
>
	<Dialog.Content class="max-w-sm sm:max-w-sm" data-testid="show-money-dialog">
		<Dialog.Header>
			<Dialog.Title>Show money?</Dialog.Title>
			<Dialog.Description>Enter your passphrase to reveal amounts.</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-3"
			onsubmit={(e) => {
				e.preventDefault();
				void confirmShowMoney();
			}}
		>
			<div class="space-y-2">
				<Label for="show-money-pass">Passphrase</Label>
				<Input
					id="show-money-pass"
					type="password"
					autocomplete="current-password"
					bind:value={showMoneyPass}
					data-testid="show-money-passphrase"
					aria-invalid={showMoneyError ? true : undefined}
					oninput={() => (showMoneyError = null)}
				/>
				{#if showMoneyError}
					<p class="text-destructive text-sm" role="alert" data-testid="show-money-error">
						{showMoneyError}
					</p>
				{/if}
			</div>
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={showMoneyBusy}
					onclick={() => (showMoneyDialogOpen = false)}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={showMoneyBusy || !showMoneyPass}
					data-testid="show-money-confirm"
				>
					{showMoneyBusy ? 'Checking…' : 'Show'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={leaveCategoriesOpen}
	title="Discard group order?"
	description="Leave Categories without saving reorder? Your last saved order stays."
	confirmLabel="Leave"
	destructive
	confirmTestId="category-reorder-leave-confirm"
	onOpenChange={(next) => (leaveCategoriesOpen = next)}
	onConfirm={() => {
		categoriesReorderDirty = false;
		leaveCategoriesOpen = false;
		const dest = pendingNav;
		pendingNav = null;
		if (dest) {
			onNavigate(dest);
			sidebar.setOpenMobile(false);
		}
	}}
/>
