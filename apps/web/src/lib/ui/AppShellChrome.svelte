<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import HomeIcon from '@lucide/svelte/icons/house';
	import ListIcon from '@lucide/svelte/icons/list';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
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
	import { DEFAULT_LEAVE_TAB } from '$lib/application/idle';
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
	import PlanListRow from '$lib/ui/PlanListRow.svelte';
	import TransactionRangePicker from '$lib/ui/TransactionRangePicker.svelte';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type { Account } from '$lib/domain/account';
	import type { PocketGoal } from '$lib/domain/goals';
	import type { PocketBudget } from '$lib/domain/budgets';
	import type { LedgerPlan } from '$lib/domain/plan';
	import { isDueInHomeWindow } from '$lib/domain/plan';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { CreatePocketInput, UpdatePocketInput } from '$lib/application/accounts';
	import { derivePocketBalance } from '$lib/domain/pocket-balance';
	import { formatMinor } from '$lib/domain/money';
	import { isAppRoute, type AppRoute } from '$lib/shared/router';
	import { profileInitials } from '$lib/application/google-profile';
	import {
		DEFAULT_ACTIVITY_FILTERS,
		ADMIN_FEE_CATEGORY_ID,
		ADMIN_FEE_LABEL,
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
	import { todayOccurredOn } from '$lib/domain/transaction-rules';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import { STOCK_ADMIN_FEE_ICON, STOCK_CUSTOM_ICON, STOCK_UNCATEGORIZED_ICON } from '$lib/domain/default-category-catalog';
	import { shouldIgnoreDismissForFloatingMenu, shouldIgnoreDismissForNativePicker } from '$lib/ui/native-picker-dismiss';
	import { readHideAmounts, writeHideAmounts } from '$lib/shared/hide-amounts';
	import {
		readActivityListSession,
		writeActivityListSession,
		activitySessionForPocket
	} from '$lib/shared/activity-list-session';
	import {
		countPlanAdvancedFilters,
		DEFAULT_PLAN_FILTERS,
		filterPlans,
		hasAdminFeePlanRow,
		hasUncategorizedPlanRow,
		isDefaultPlanFilters,
		normalizePlanFilters,
		planFiltersEqual,
		planListSections,
		shouldShowPlanCategoryFilter,
		sortPlansForList,
		usedPlanCategoryIds,
		type PlanFilterCriteria
	} from '$lib/domain/plan-filters';
	import { readPlansListSession, writePlansListSession } from '$lib/shared/plans-list-session';
	import type { PlanSheetMode } from '$lib/ui/PlanSheet.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import CategoryPicker from '$lib/ui/CategoryPicker.svelte';
	import ShellStageSkeleton from '$lib/ui/ShellStageSkeleton.svelte';
	import {
		shouldShowPocketDetailsSkeleton,
		shouldShowShellSkeleton
	} from '$lib/shared/shell-loading';

	type Props = {
		account: Account | null;
		accounts: Account[];
		goals?: PocketGoal[];
		budgets?: PocketBudget[];
		plans?: LedgerPlan[];
		balanceMinor: number;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		monthSummary: MonthSummary | null;
		canPrevMonth?: boolean;
		canNextMonth?: boolean;
		ledgerReady?: boolean;
		monthLoading?: boolean;
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		categoryGroups: OverlayGroup[];
		lockEnabled: boolean;
		signedIn?: boolean;
		themePreference: ThemePreference;
		route: AppRoute;
		pageTitle: string;
		detailsPocket?: Account | null;
		pocketId?: string | null;
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
		onChangeAccountPassphrase?: (oldPass: string, nextPass: string) => void | Promise<void>;
		onLockSession: () => void;
		onRefreshLedger: () => void | Promise<void>;
		onCreatePocket: (input: CreatePocketInput) => void | Promise<void>;
		onUpdatePocket: (input: UpdatePocketInput) => void | Promise<void>;
		onDeletePocket: (id: string) => void | Promise<void>;
		onReorderPockets: (orderedNonMainIds: string[]) => void | Promise<void>;
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
		onNavigate: (route: AppRoute) => void;
		onOpenAdd: () => void;
		onOpenEdit: (tx: LedgerTransaction) => void;
		onOpenAddPlan?: (accountId?: string) => void;
		onOpenPlan?: (plan: LedgerPlan, mode: PlanSheetMode) => void;
		/** Applied Transactions pocket ids for Add default (exactly one → that pocket). */
		onActivityPocketFilterChange?: (pocketIds: string[]) => void;
	};

	let {
		account,
		accounts,
		goals = [],
		budgets = [],
		plans = [],
		balanceMinor,
		transactions,
		categoriesById,
		monthSummary,
		canPrevMonth = false,
		canNextMonth = false,
		ledgerReady = true,
		monthLoading = false,
		expenseCategories: _expenseCategories,
		incomeCategories: _incomeCategories,
		categoryGroups,
		lockEnabled,
		signedIn = false,
		themePreference,
		route,
		pageTitle,
		detailsPocket = null,
		pocketId = null,
		onThemePreferenceChange,
		onPrevMonth,
		onNextMonth,
		onExport,
		onImportFile,
		onResetLocalData,
		onEnableLock,
		onDisableLock,
		onChangeAccountPassphrase,
		onLockSession,
		onRefreshLedger,
		onCreatePocket,
		onUpdatePocket,
		onDeletePocket,
		onReorderPockets,
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
		onNavigate,
		onOpenAdd,
		onOpenEdit,
		onOpenAddPlan,
		onOpenPlan,
		onActivityPocketFilterChange
	}: Props = $props();

	const sidebar = Sidebar.useSidebar();

	/** Matches Tailwind `md`. */
	const desktop = new MediaQuery('min-width: 768px');
	/** Matches Tailwind `xl` — wide layout uses a non-blocking filter drawer. */
	const xlWide = new MediaQuery('min-width: 1280px');

	const currencyLabel = $derived(displayCurrency);
	const recent = $derived(transactions.slice(0, 10));

	let hideHomeAmounts = $state(readHideAmounts());

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

	const initialPlansSession = readPlansListSession();
	let plansApplied = $state<PlanFilterCriteria>(normalizePlanFilters(initialPlansSession));
	let plansDraft = $state<PlanFilterCriteria>(normalizePlanFilters(initialPlansSession));
	let plansFiltersOpen = $state(false);
	let plansDiscardWarnOpen = $state(false);
	let plansFiltersSheetRef = $state<HTMLElement | null>(null);

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

	const usedPlanIds = $derived(usedPlanCategoryIds(plans));
	const showPlanCategoryFilter = $derived(shouldShowPlanCategoryFilter(plans));
	const usedPlanIncomeCategories = $derived(
		Object.values(categoriesById).filter((c) => c.kind === 'income' && usedPlanIds.has(c.id))
	);
	const usedPlanExpenseCategories = $derived(
		Object.values(categoriesById).filter((c) => c.kind === 'expense' && usedPlanIds.has(c.id))
	);
	const planCategoryFilterDisabled = $derived(isCategoryFilterDisabled(plansDraft.types));
	const planCategoryKindsAllowed = $derived(categoryKindsForTypes(plansDraft.types));
	const planCategoryGroupByKind = $derived(
		planCategoryKindsAllowed === 'all' ||
			(Array.isArray(planCategoryKindsAllowed) &&
				planCategoryKindsAllowed.includes('income') &&
				planCategoryKindsAllowed.includes('expense'))
	);
	const planCategoryShowAdminFee = $derived(
		showPlanCategoryFilter &&
			hasAdminFeePlanRow(plans) &&
			(planCategoryKindsAllowed === 'all' ||
				(Array.isArray(planCategoryKindsAllowed) && planCategoryKindsAllowed.includes('expense')))
	);
	const planCategoryShowUncategorized = $derived(
		showPlanCategoryFilter && hasUncategorizedPlanRow(plans)
	);
	const planCategoryPickerIncome = $derived(
		planCategoryKindsAllowed === 'all' ||
			(Array.isArray(planCategoryKindsAllowed) && planCategoryKindsAllowed.includes('income'))
			? usedPlanIncomeCategories
			: []
	);
	const planCategoryPickerExpense = $derived(
		planCategoryKindsAllowed === 'all' ||
			(Array.isArray(planCategoryKindsAllowed) && planCategoryKindsAllowed.includes('expense'))
			? usedPlanExpenseCategories
			: []
	);
	const planCategoryPickerFlat = $derived(
		planCategoryGroupByKind
			? []
			: Array.isArray(planCategoryKindsAllowed) && planCategoryKindsAllowed.includes('income')
				? usedPlanIncomeCategories
				: usedPlanExpenseCategories
	);

	const filtersSheetSide = $derived<'bottom' | 'right'>(desktop.current ? 'right' : 'bottom');
	const filtersSheetClass = $derived(
		filtersSheetSide === 'bottom'
			? 'mx-auto flex max-h-[100svh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
			: 'w-full gap-0 p-0 sm:max-w-sm'
	);
	const activityStageWide = $derived(
		(route === 'transactions' || route === 'plans') && xlWide.current
	);
	const stageLoading = $derived(
		shouldShowShellSkeleton({
			sessionReady: true,
			ledgerReady,
			gated: false
		})
	);
	const detailsSkeleton = $derived(
		shouldShowPocketDetailsSkeleton({
			pocketId: pocketId ?? null,
			ledgerReady
		})
	);
	const dashboardStageWide = $derived(
		xlWide.current && (route === 'home' || Boolean(detailsPocket) || detailsSkeleton)
	);

	const advancedFilterCount = $derived(countAdvancedFilters(applied));
	const hasAdvancedFilters = $derived(advancedFilterCount > 0);
	const toolbarActiveChrome =
		'border-primary text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20 shadow-xs';
	const draftDirty = $derived(
		!activityFiltersEqual(draft, applied, { ignoreSearch: true, ignoreDates: true })
	);
	const canApplyDraft = $derived(draftDirty);
	const canClearDraft = $derived(!isDefaultActivityFilters({ ...draft, search: '' }));

	const homePlans = $derived(
		sortPlansForList(
			plans.filter((p) => isDueInHomeWindow(p.dueOn, todayOccurredOn())),
			accounts
		)
	);
	const plansAdvancedCount = $derived(countPlanAdvancedFilters(plansApplied));
	const hasPlanAdvancedFilters = $derived(plansAdvancedCount > 0);
	const plansDraftDirty = $derived(
		!planFiltersEqual(
			{ ...plansDraft, search: '' },
			{ ...plansApplied, search: '' }
		)
	);
	const canApplyPlanDraft = $derived(plansDraftDirty);
	const canClearPlanDraft = $derived(!isDefaultPlanFilters({ ...plansDraft, search: '' }));
	const filteredPlans = $derived(
		sortPlansForList(filterPlans(plans, plansApplied), accounts)
	);
	const planSections = $derived(planListSections(filteredPlans));

	function clonePlanFilters(criteria: PlanFilterCriteria): PlanFilterCriteria {
		return normalizePlanFilters(criteria);
	}

	function syncPlansDraftCategory(next: PlanFilterCriteria): PlanFilterCriteria {
		return {
			...next,
			categoryIds: resolveCategoryIdsForTypes(next.categoryIds, next.types, categoryKinds)
		};
	}

	function persistPlansListSession() {
		writePlansListSession(plansApplied);
	}

	function openPlanFilters() {
		plansDraft = syncPlansDraftCategory(clonePlanFilters(plansApplied));
		plansFiltersOpen = true;
	}

	function applyPlanFilters() {
		plansApplied = { ...clonePlanFilters(plansDraft), search: plansApplied.search };
		persistPlansListSession();
		if (!xlWide.current) plansFiltersOpen = false;
	}

	function requestClosePlanFilters() {
		if (plansDraftDirty) {
			plansDiscardWarnOpen = true;
			return;
		}
		plansFiltersOpen = false;
	}

	function onPlanFiltersOpenChange(open: boolean) {
		if (open) {
			plansDraft = syncPlansDraftCategory(clonePlanFilters(plansApplied));
			plansFiltersOpen = true;
			return;
		}
		if (plansDraftDirty) {
			plansDiscardWarnOpen = true;
			return;
		}
		plansFiltersOpen = false;
	}

	function onPlanFiltersDismissAttempt(e: Event) {
		if (shouldIgnoreDismissForNativePicker(e) || shouldIgnoreDismissForFloatingMenu(e)) {
			e.preventDefault();
			return;
		}
		if (plansDraftDirty || plansDiscardWarnOpen) {
			e.preventDefault();
			if (plansDraftDirty) plansDiscardWarnOpen = true;
		}
	}

	function confirmDiscardPlanFilters() {
		plansDraft = clonePlanFilters(plansApplied);
		plansFiltersOpen = false;
		plansDiscardWarnOpen = false;
	}

	function clearPlanDraftFilters() {
		plansDraft = { ...DEFAULT_PLAN_FILTERS, search: plansApplied.search };
	}

	function onPlanFilterTypesChange(next: string[]) {
		const types = next.filter(
			(t): t is ActivityTxType => t === 'income' || t === 'expense' || t === 'transfer'
		);
		plansDraft = syncPlansDraftCategory({ ...plansDraft, types });
	}

	$effect(() => {
		if (showPlanCategoryFilter) return;
		if (plansDraft.categoryIds.length === 0 && plansApplied.categoryIds.length === 0) return;
		if (plansDraft.categoryIds.length > 0) plansDraft = { ...plansDraft, categoryIds: [] };
		if (plansApplied.categoryIds.length > 0) {
			plansApplied = { ...plansApplied, categoryIds: [] };
			persistPlansListSession();
		}
	});

	function updateAppliedPlanSearch(next: string) {
		plansApplied = { ...plansApplied, search: next };
		persistPlansListSession();
	}

	function openPlanRow(plan: LedgerPlan, from: 'home' | 'pocket' | 'plans') {
		if (!onOpenPlan) return;
		if (from === 'plans') {
			onOpenPlan(plan, 'edit');
			return;
		}
		if (from === 'home') {
			onOpenPlan(plan, 'accept');
			return;
		}
		onOpenPlan(plan, isDueInHomeWindow(plan.dueOn, todayOccurredOn()) ? 'accept' : 'edit');
	}

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
		{ id: 'pockets', label: 'Pockets', icon: LandmarkIcon },
		{ id: 'transactions', label: 'Transactions', icon: ListIcon },
		{ id: 'plans', label: 'Plans', icon: CalendarDaysIcon },
		{ id: 'categories', label: 'Categories', icon: TagsIcon },
		{ id: 'settings', label: 'Settings', icon: SettingsIcon }
	];

	function cloneFilters(criteria: ActivityFilterCriteria): ActivityFilterCriteria {
		return normalizeActivityFilters(criteria);
	}

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		if (categoryId === ADMIN_FEE_CATEGORY_ID) return ADMIN_FEE_LABEL;
		return categoriesById[categoryId]?.name ?? 'Category';
	}

	function categoryIconSlug(tx: LedgerTransaction): string {
		if (tx.categoryId == null) return STOCK_UNCATEGORIZED_ICON;
		if (tx.categoryId === ADMIN_FEE_CATEGORY_ID) return STOCK_ADMIN_FEE_ICON;
		return categoriesById[tx.categoryId]?.icon || STOCK_CUSTOM_ICON;
	}

	function homeMoney(amount: number): string {
		return hideHomeAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}

	function toggleHomeAmounts() {
		hideHomeAmounts = !hideHomeAmounts;
		writeHideAmounts(hideHomeAmounts);
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

	$effect(() => {
		if (route !== 'plans' || !xlWide.current) return;
		plansDraft = syncPlansDraftCategory(clonePlanFilters(plansApplied));
	});

	onMount(() => {
		onActivityPocketFilterChange?.([...applied.pocketIds]);
	});
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header
		class="p-6 group-data-[collapsible=icon]:min-h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
	>
		<div
			class="flex flex-col items-center gap-3 text-center group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
		>
			<img
				src="/favicon.svg"
				alt=""
				width="48"
				height="48"
				class="size-12 rounded-lg transition-[width,height] duration-300 ease-in-out group-data-[collapsible=icon]:size-8"
			/>
			<p class="text-base font-semibold group-data-[collapsible=icon]:hidden">Pocket Ledger</p>
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
								tooltipContent={item.label}
								aria-label={item.label}
								class="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
								data-testid={`nav-${item.id}`}
								aria-current={route === item.id ? 'page' : undefined}
								onclick={() => navigate(item.id)}
							>
								<Icon />
								<span class="group-data-[collapsible=icon]:sr-only">{item.label}</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	{#if signedIn && userEmail}
		<Sidebar.Footer class="p-2 group-data-[collapsible=icon]:px-0">
			<button
				type="button"
				class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
				data-testid="sidebar-account"
			>
				<span
					class="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium"
					aria-hidden="true"
				>
					{#if userPictureUrl}
						<img
							src={userPictureUrl}
							alt=""
							class="size-full object-cover"
							referrerpolicy="no-referrer"
						/>
					{:else}
						{profileInitials(userDisplayName, userEmail)}
					{/if}
				</span>
				<span class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
					<span class="block truncate font-medium">{userDisplayName || userEmail}</span>
					<span class="text-muted-foreground block truncate text-xs">{userEmail}</span>
				</span>
			</button>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>

<Sidebar.Inset
	class={route === 'categories' ||
	route === 'transactions' ||
	route === 'plans' ||
	dashboardStageWide
		? 'h-svh min-h-0 overflow-hidden'
		: undefined}
>
	<div class="flex min-h-0 flex-1 flex-col">
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
				disabled={!ledgerReady}
				onclick={() => (detailsEditRequest = detailsPocket)}
			>
				<PencilIcon class="size-4" />
			</Button>
		{/if}
		{#if route === 'home' || route === 'transactions' || route === 'pockets' || route === 'plans'}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				data-testid="toggle-home-amounts"
				aria-label={hideHomeAmounts ? 'Show money' : 'Hide money'}
				disabled={!ledgerReady}
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

	{#snippet activityChrome()}
		<div
			class={xlWide.current
				? 'shrink-0'
				: 'bg-background shrink-0 border-b px-4 py-3 md:px-6'}
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
	{/snippet}

	{#if route === 'transactions' && !xlWide.current && !stageLoading}
		{@render activityChrome()}
	{/if}

	{#snippet plansChrome()}
		<div
			class={xlWide.current
				? 'shrink-0'
				: 'bg-background shrink-0 border-b px-4 py-3 md:px-6'}
			data-testid="plans-chrome"
		>
			<div class="flex flex-col gap-3">
				<div class="flex items-center gap-2">
					<div class="relative min-w-0 flex-1" data-testid="plans-filters">
						<SearchIcon
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
							aria-hidden="true"
						/>
						<Input
							id="plans-filter-search"
							type="search"
							placeholder="Description, note, or amount"
							class="h-9 pl-9"
							value={plansApplied.search ?? ''}
							data-testid="plans-filter-search"
							oninput={(e) => updateAppliedPlanSearch(e.currentTarget.value)}
						/>
					</div>
					{#if !xlWide.current}
						<Button
							type="button"
							variant="outline"
							size="icon"
							class={['relative shrink-0', hasPlanAdvancedFilters && toolbarActiveChrome]}
							aria-label="Filters"
							aria-pressed={hasPlanAdvancedFilters}
							data-testid="plans-filters-open"
							data-active={hasPlanAdvancedFilters ? 'true' : undefined}
							onclick={openPlanFilters}
						>
							<SlidersHorizontalIcon class="size-4" />
							{#if hasPlanAdvancedFilters}
								<span
									class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full text-[10px] font-medium tabular-nums"
									data-testid="plans-filters-badge"
								>
									{plansAdvancedCount}
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
						onclick={() => onOpenAddPlan?.()}
						data-testid="plans-add"
					>
						<PlusIcon class="size-4" />
						Add Plan
					</Button>
				</div>
			</div>
		</div>
	{/snippet}

	{#if route === 'plans' && !xlWide.current && !stageLoading}
		{@render plansChrome()}
	{/if}

	{#if stageLoading}
		<ShellStageSkeleton {route} pocketDetails={detailsSkeleton} />
	{:else}
	<div
		class={[
			'mx-auto flex w-full flex-1 flex-col gap-4 p-4 pb-8 md:gap-4 md:p-6 md:pb-8 max-w-3xl',
			'data-[stage=wide]:max-w-none!',
			route === 'categories' &&
				'min-h-0 flex-1 overflow-hidden px-0! pt-0! pb-0! md:px-0! md:pt-0! md:pb-0!',
			((route === 'transactions' || route === 'plans') &&
				(xlWide.current
					? 'min-h-0 flex-1 overflow-hidden'
					: 'min-h-0 flex-1 overflow-y-auto')) ||
				(dashboardStageWide && 'min-h-0 flex-1 overflow-hidden')
		]}
		data-stage={route === 'categories' || activityStageWide || dashboardStageWide
			? 'wide'
			: 'narrow'}
		data-testid="app-stage"
	>
		{#if route === 'home'}
			{#snippet homeBalance()}
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
			{/snippet}

			{#snippet homePlansCard()}
				{#if homePlans.length > 0}
					<Card.Root class="gap-0 py-0" data-testid="home-plans-card">
						<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
							<Card.Title class="inline-flex items-center gap-1.5 text-base">
								<CalendarDaysIcon class="size-4" aria-hidden="true" />
								Plans
							</Card.Title>
						</Card.Header>
						<Card.Content class="px-2 pb-2">
							<ul class="divide-border divide-y" data-testid="home-plans-list">
								{#each homePlans as plan (plan.id)}
									<li>
										<PlanListRow
											{plan}
											{currencyLabel}
											{categoriesById}
											pockets={accounts}
											hideAmount={hideHomeAmounts}
											testid={`home-plan-row-${plan.id}`}
											onOpen={() => openPlanRow(plan, 'home')}
										/>
									</li>
								{/each}
							</ul>
						</Card.Content>
					</Card.Root>
				{/if}
			{/snippet}

			{#snippet homeMonth()}
				{#if monthSummary}
					<MonthSummaryCard
						summary={monthSummary}
						{currencyLabel}
						hideAmounts={hideHomeAmounts}
						canPrev={canPrevMonth}
						canNext={canNextMonth}
						loading={monthLoading}
						onPrevMonth={() => void onPrevMonth()}
						onNextMonth={() => void onNextMonth()}
					/>
				{/if}
			{/snippet}

			{#snippet homeRecent()}
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
											categoryIconSlug={categoryIconSlug(tx)}
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
						{#if recent.length > 0}
							<Button
								type="button"
								variant="ghost"
								class="text-muted-foreground hover:text-foreground mt-1 w-full justify-center text-sm"
								data-testid="recent-see-more"
								onclick={() => navigate('transactions')}
							>
								See more in Transactions
							</Button>
						{/if}
					</Card.Content>
				</Card.Root>
			{/snippet}

			{#if xlWide.current}
				<div
					class="flex min-h-0 flex-1 gap-4 overflow-hidden"
					data-testid="home-panel"
				>
					<div
						class="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-3"
						data-testid="home-col-summary"
					>
						<div class="flex flex-col gap-4">
							{@render homeBalance()}
							{@render homeMonth()}
						</div>
					</div>
					<div
						class="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-3"
						data-testid="home-col-lists"
					>
						<div class="flex flex-col gap-4">
							{@render homePlansCard()}
							{@render homeRecent()}
						</div>
					</div>
				</div>
			{:else}
				<div class="space-y-4" data-testid="home-panel">
					{@render homeBalance()}
					{@render homePlansCard()}
					{@render homeMonth()}
					{@render homeRecent()}
				</div>
			{/if}
		{:else if route === 'transactions'}
			<div
				data-testid="activity-panel"
				class={xlWide.current ? 'flex min-h-0 flex-1 items-start gap-4' : 'min-h-0 space-y-3'}
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
					{#if persistent}
						<Card.Root
							data-testid="activity-filters-drawer"
							class="flex w-72 shrink-0 flex-col gap-0 py-0"
						>
							<Card.Header
								class="border-border flex flex-row items-center justify-between gap-2 space-y-0 border-b px-4 py-3 [.border-b]:pb-3"
							>
								<Card.Title
									class="inline-flex items-center gap-2 text-base font-semibold"
									data-testid="activity-filters-title"
								>
									<SlidersHorizontalIcon class="size-4" aria-hidden="true" />
									Filters
								</Card.Title>
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
							</Card.Header>
							<Card.Content class="grid gap-3 px-4 py-4">
								{@render filterFormFields()}
							</Card.Content>
							<Card.Footer class="border-border border-t px-4 py-3 [.border-t]:pt-3">
								<Button
									type="button"
									class="w-full"
									disabled={!canApplyDraft}
									data-testid="activity-filters-apply"
									onclick={applyFilters}
								>
									Apply
								</Button>
							</Card.Footer>
						</Card.Root>
					{:else}
						<div
							class="border-border flex flex-row items-center justify-between gap-2 border-b px-4 py-3 text-left"
						>
							<p class="inline-flex items-center gap-2 text-base font-semibold">
								<SlidersHorizontalIcon class="size-4" aria-hidden="true" />
								Filters
							</p>
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
							<Button
								type="button"
								variant="outline"
								class="flex-1"
								data-testid="activity-filters-close"
								onclick={requestCloseFilters}
							>
								Cancel
							</Button>
							<Button
								type="button"
								class="flex-1"
								disabled={!canApplyDraft}
								data-testid="activity-filters-apply"
								onclick={applyFilters}
							>
								Apply
							</Button>
						</div>
					{/if}
				{/snippet}

				<div
					class={xlWide.current
						? 'flex min-h-0 min-w-0 flex-1 flex-col gap-4 self-stretch overflow-hidden'
						: 'min-h-0 min-w-0 flex-1 space-y-3'}
				>
					{#if xlWide.current}
						{@render activityChrome()}
					{/if}
					<div
						class={xlWide.current
							? 'min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto'
							: 'contents'}
					>
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
						hideAmounts={hideHomeAmounts}
						onEdit={onOpenEdit}
					/>
					</div>
				</div>

				{#if xlWide.current}
					{@render filterPanel()}
				{/if}
			</div>
		{:else if route === 'plans'}
			<div
				data-testid="plans-panel"
				class={xlWide.current ? 'flex min-h-0 flex-1 items-start gap-4' : 'min-h-0 space-y-3'}
			>
				{#snippet planFilterFormFields()}
					<div class="space-y-1">
						<Label for="plans-filter-type">Type</Label>
						<FilterCheckSelect
							id="plans-filter-type"
							testid="plans-filter-type"
							ariaLabel="Type"
							values={[...plansDraft.types]}
							onValuesChange={onPlanFilterTypesChange}
							items={[
								{ id: 'income', label: 'Income', testid: 'plans-filter-type-income' },
								{ id: 'expense', label: 'Expense', testid: 'plans-filter-type-expense' },
								{ id: 'transfer', label: 'Transfer', testid: 'plans-filter-type-transfer' }
							]}
						/>
					</div>
					{#if showPlanCategoryFilter}
						<div class="space-y-1">
							<Label for="plans-filter-category">Category</Label>
							<CategoryPicker
								id="plans-filter-category"
								testid="plans-filter-category"
								multiple
								values={[...plansDraft.categoryIds]}
								onValuesChange={(next) => (plansDraft = { ...plansDraft, categoryIds: next })}
								categories={planCategoryPickerFlat}
								incomeCategories={planCategoryPickerIncome}
								expenseCategories={planCategoryPickerExpense}
								groups={categoryGroups}
								groupByKind={planCategoryGroupByKind}
								showAdminFee={planCategoryShowAdminFee}
								showUncategorized={planCategoryShowUncategorized}
								emptyMeans="all"
								disabled={planCategoryFilterDisabled}
								ariaLabel="Category"
							/>
						</div>
					{/if}
					<div class="space-y-1">
						<Label for="plans-filter-pocket">Pocket</Label>
						<FilterCheckSelect
							id="plans-filter-pocket"
							testid="plans-filter-pocket"
							ariaLabel="Pocket"
							values={[...plansDraft.pocketIds]}
							onValuesChange={(next) => (plansDraft = { ...plansDraft, pocketIds: next })}
							items={accounts.map((pocket) => ({
								id: pocket.id,
								label: pocket.name,
								testid: `plans-filter-pocket-option-${pocket.id}`
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
				{/snippet}

				{#snippet planFilterPanel()}
					{@const persistent = xlWide.current}
					{#if persistent}
						<Card.Root
							data-testid="plans-filters-drawer"
							class="flex w-72 shrink-0 flex-col gap-0 py-0"
						>
							<Card.Header
								class="border-border flex flex-row items-center justify-between gap-2 space-y-0 border-b px-4 py-3 [.border-b]:pb-3"
							>
								<Card.Title
									class="inline-flex items-center gap-2 text-base font-semibold"
									data-testid="plans-filters-title"
								>
									<SlidersHorizontalIcon class="size-4" aria-hidden="true" />
									Filters
								</Card.Title>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={!canClearPlanDraft}
									data-testid="plans-filters-clear"
									onclick={clearPlanDraftFilters}
								>
									<RotateCcwIcon class="size-4" />
									Clear
								</Button>
							</Card.Header>
							<Card.Content class="grid gap-3 px-4 py-4">
								{@render planFilterFormFields()}
							</Card.Content>
							<Card.Footer class="border-border border-t px-4 py-3 [.border-t]:pt-3">
								<Button
									type="button"
									class="w-full"
									disabled={!canApplyPlanDraft}
									data-testid="plans-filters-apply"
									onclick={applyPlanFilters}
								>
									Apply
								</Button>
							</Card.Footer>
						</Card.Root>
					{:else}
						<div
							class="border-border flex flex-row items-center justify-between gap-2 border-b px-4 py-3 text-left"
						>
							<p class="inline-flex items-center gap-2 text-base font-semibold">
								<SlidersHorizontalIcon class="size-4" aria-hidden="true" />
								Filters
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={!canClearPlanDraft}
								data-testid="plans-filters-clear"
								onclick={clearPlanDraftFilters}
							>
								<RotateCcwIcon class="size-4" />
								Clear
							</Button>
						</div>
						<div class="grid gap-3 overflow-y-auto px-4 py-4">
							{@render planFilterFormFields()}
						</div>
						<div class="border-border flex flex-row gap-2 border-t px-4 py-3">
							<Button
								type="button"
								variant="outline"
								class="flex-1"
								data-testid="plans-filters-close"
								onclick={requestClosePlanFilters}
							>
								Cancel
							</Button>
							<Button
								type="button"
								class="flex-1"
								disabled={!canApplyPlanDraft}
								data-testid="plans-filters-apply"
								onclick={applyPlanFilters}
							>
								Apply
							</Button>
						</div>
					{/if}
				{/snippet}

				<div
					class={xlWide.current
						? 'flex min-h-0 min-w-0 flex-1 flex-col gap-4 self-stretch overflow-hidden'
						: 'min-h-0 min-w-0 flex-1 space-y-3'}
				>
					{#if xlWide.current}
						{@render plansChrome()}
					{/if}
					<div
						class={xlWide.current
							? 'min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto'
							: 'contents'}
					>
					{#if !xlWide.current}
						<Sheet.Root open={plansFiltersOpen} onOpenChange={onPlanFiltersOpenChange}>
							<Sheet.Content
								bind:ref={plansFiltersSheetRef}
								side={filtersSheetSide}
								class={filtersSheetClass}
								data-testid="plans-filters-sheet"
								showCloseButton={false}
								interactOutsideBehavior="close"
								escapeKeydownBehavior="close"
								onInteractOutside={onPlanFiltersDismissAttempt}
								onEscapeKeydown={onPlanFiltersDismissAttempt}
							>
								<Sheet.Title class="sr-only">Filters</Sheet.Title>
								{@render planFilterPanel()}
							</Sheet.Content>
						</Sheet.Root>
					{/if}

					<ConfirmDialog
						open={plansDiscardWarnOpen}
						title="Discard filter changes?"
						description="Your filter changes have not been applied and will be lost."
						confirmLabel="Discard"
						cancelLabel="Keep editing"
						destructive
						confirmTestId="plans-filters-discard-confirm"
						onOpenChange={(open) => (plansDiscardWarnOpen = open)}
						onConfirm={confirmDiscardPlanFilters}
					/>

					{#if plans.length === 0}
						<EmptyState
							testid="plans-empty"
							title="No plans yet"
							description="Reminders you add will show up here."
						>
							{#snippet icon()}
								<CalendarDaysIcon class="size-5" />
							{/snippet}
						</EmptyState>
					{:else if filteredPlans.length === 0}
						<EmptyState
							testid="plans-empty-filtered"
							title="No matching plans"
							description="Try clearing filters or search."
						>
							{#snippet icon()}
								<SearchIcon class="size-5" />
							{/snippet}
						</EmptyState>
					{:else}
						<ul
							class="border-border divide-border divide-y overflow-hidden rounded-lg border"
							data-testid="plans-list"
						>
							{#each planSections as section (section.kind === 'header' ? `h-${section.dueOn}` : section.plan.id)}
								{#if section.kind === 'header'}
									<li
										class="bg-muted/40 text-muted-foreground px-3 py-1.5 text-xs font-medium"
										data-testid={`plans-date-group-${section.dueOn}`}
									>
										{formatOccurredOnDisplay(section.dueOn)}
									</li>
								{:else}
									<li>
										<PlanListRow
											plan={section.plan}
											{currencyLabel}
											{categoriesById}
											pockets={accounts}
											hideAmount={hideHomeAmounts}
											testid={`plans-row-${section.plan.id}`}
											onOpen={() => openPlanRow(section.plan, 'plans')}
										/>
									</li>
								{/if}
							{/each}
						</ul>
					{/if}
					</div>
				</div>

				{#if xlWide.current}
					{@render planFilterPanel()}
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
					{budgets}
					{plans}
					{categoryGroups}
					hideAmounts={hideHomeAmounts}
					onAdd={openAdd}
					onAddPlan={() => onOpenAddPlan?.(detailsPocket.id)}
					onOpenPlan={(plan) => openPlanRow(plan, 'pocket')}
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
				{budgets}
				{transactions}
				{categoriesById}
				{categoryGroups}
				hideAmounts={hideHomeAmounts}
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
				{onChangeAccountPassphrase}
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
			/>
		{/if}
	</div>
	{/if}
	</div>
</Sidebar.Inset>

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
