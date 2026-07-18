<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import HomeIcon from '@lucide/svelte/icons/house';
	import ListIcon from '@lucide/svelte/icons/list';
	import TagsIcon from '@lucide/svelte/icons/tags';
	import MoreHorizontalIcon from '@lucide/svelte/icons/ellipsis';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchIcon from '@lucide/svelte/icons/search';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ThemeMenu from '$lib/ui/ThemeMenu.svelte';
	import MonthSummaryCard from '$lib/ui/MonthSummary.svelte';
	import MorePanel from '$lib/ui/MorePanel.svelte';
	import CategoriesPanel from '$lib/ui/CategoriesPanel.svelte';
	import ActivityTable from '$lib/ui/ActivityTable.svelte';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type { Account } from '$lib/domain/account';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { RecurringRule, RecurringFrequency } from '$lib/domain/recurring';
	import type { Goal } from '$lib/domain/goals';
	import {
		daysRemaining,
		goalProgressPercent,
		sortGoalsByNearestDeadline
	} from '$lib/domain/goals';
	import {
		todayOccurredOn,
		type AddableTransactionType
	} from '$lib/domain/transaction-rules';
	import { formatMinor } from '$lib/domain/money';
	import { isAppRoute, type AppRoute } from '$lib/shared/router';
	import {
		DEFAULT_ACTIVITY_FILTERS,
		DEFAULT_ACTIVITY_SORT,
		filterTransactions,
		isDefaultActivityFilters,
		UNCATEGORIZED_FILTER,
		type ActivityFilterCriteria,
		type ActivitySortMode,
		type CategorySortMeta
	} from '$lib/domain/activity-filters';
	import { readHideAmounts, writeHideAmounts } from '$lib/shared/hide-amounts';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		account: Account | null;
		balanceMinor: number;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		monthSummary: MonthSummary | null;
		recurringRules: RecurringRule[];
		goals: Goal[];
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		lockEnabled: boolean;
		themePreference: ThemePreference;
		route: AppRoute;
		pageTitle: string;
		onThemePreferenceChange: (next: ThemePreference) => void;
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
		onCreateGoal: (name: string, targetRaw: string, targetOn: string) => void | Promise<void>;
		onDeleteGoal: (id: string) => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
		onCreateCategory: (name: string, kind: CategoryRow['kind']) => void | Promise<void>;
		onRenameCategory: (id: string, name: string) => void | Promise<void>;
		onDeleteCategory: (id: string) => void | Promise<void>;
		onReorderCategories: (
			kind: CategoryRow['kind'],
			orderedIds: string[]
		) => void | Promise<void>;
		onNavigate: (route: AppRoute) => void;
		onOpenAdd: () => void;
		onOpenEdit: (tx: LedgerTransaction) => void;
	};

	let {
		account,
		balanceMinor,
		transactions,
		categoriesById,
		monthSummary,
		recurringRules,
		goals,
		expenseCategories,
		incomeCategories,
		lockEnabled,
		themePreference,
		route,
		pageTitle,
		onThemePreferenceChange,
		onPrevMonth,
		onNextMonth,
		onExport,
		onImportFile,
		onResetLocalData,
		onCreateRecurring,
		onToggleRecurring,
		onDeleteRecurring,
		onCreateGoal,
		onDeleteGoal,
		onEnableLock,
		onDisableLock,
		onCreateCategory,
		onRenameCategory,
		onDeleteCategory,
		onReorderCategories,
		onNavigate,
		onOpenAdd,
		onOpenEdit
	}: Props = $props();

	const sidebar = Sidebar.useSidebar();

	/** Matches Tailwind `md`. */
	const desktop = new MediaQuery('min-width: 768px');
	/** Matches Tailwind `xl` — wide layout uses a non-blocking filter drawer. */
	const xlWide = new MediaQuery('min-width: 1280px');

	const currencyLabel = $derived(account?.currencyLabel ?? 'IDR');
	const recent = $derived(transactions.slice(0, 5));

	let hideHomeAmounts = $state(readHideAmounts());

	let applied = $state<ActivityFilterCriteria>({ ...DEFAULT_ACTIVITY_FILTERS });
	let draft = $state<ActivityFilterCriteria>({ ...DEFAULT_ACTIVITY_FILTERS });
	let filtersOpen = $state(false);
	let sortOpen = $state(false);
	let discardWarnOpen = $state(false);
	let activitySort = $state<ActivitySortMode>(DEFAULT_ACTIVITY_SORT);

	const filterCategories = $derived(
		[...expenseCategories, ...incomeCategories].sort((a, b) => a.name.localeCompare(b.name))
	);

	const categorySortMeta = $derived<CategorySortMeta[]>(
		[...incomeCategories, ...expenseCategories].map((c) => ({
			id: c.id,
			kind: c.kind,
			sortOrder: c.sortOrder
		}))
	);

	const filtersSheetSide = $derived<'bottom' | 'right'>(
		desktop.current ? 'right' : 'bottom'
	);
	const filtersSheetClass = $derived(
		filtersSheetSide === 'bottom'
			? 'mx-auto max-h-[90svh] w-full max-w-lg gap-0 rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
			: 'w-full gap-0 p-0 sm:max-w-sm'
	);
	const sortSheetSide = $derived(filtersSheetSide);
	const sortSheetClass = $derived(filtersSheetClass);
	const activityStageWide = $derived(route === 'activity' && xlWide.current);

	const advancedFilterCount = $derived(countAdvancedFilters(applied));
	const hasAdvancedFilters = $derived(advancedFilterCount > 0);
	const sortActive = $derived(activitySort !== DEFAULT_ACTIVITY_SORT);
	const toolbarActiveChrome =
		'border-primary text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20 shadow-xs';
	const draftDirty = $derived(!activityFiltersEqual(draft, applied, { ignoreSearch: true }));
	const canApplyDraft = $derived(draftDirty);
	const canClearDraft = $derived(!isDefaultActivityFilters({ ...draft, search: '' }));

	const filteredTransactions = $derived(filterTransactions(transactions, applied));

	const navItems: {
		id: AppRoute;
		label: string;
		icon: typeof HomeIcon;
	}[] = [
		{ id: 'home', label: 'Home', icon: HomeIcon },
		{ id: 'activity', label: 'Activity', icon: ListIcon },
		{ id: 'categories', label: 'Categories', icon: TagsIcon },
		{ id: 'more', label: 'More', icon: MoreHorizontalIcon }
	];

	function countAdvancedFilters(criteria: ActivityFilterCriteria): number {
		let count = 0;
		if ((criteria.type ?? 'all') !== 'all') count++;
		const categoryId = criteria.categoryId ?? '';
		if (categoryId !== '' && categoryId != null) count++;
		if (criteria.startDate?.trim()) count++;
		if (criteria.endDate?.trim()) count++;
		if (criteria.hideVoided) count++;
		if ((criteria.amountOp ?? 'none') !== 'none') count++;
		return count;
	}

	function activityFiltersEqual(
		a: ActivityFilterCriteria,
		b: ActivityFilterCriteria,
		options?: { ignoreSearch?: boolean }
	): boolean {
		const ignoreSearch = options?.ignoreSearch ?? false;
		return (
			(a.type ?? 'all') === (b.type ?? 'all') &&
			(a.categoryId ?? '') === (b.categoryId ?? '') &&
			(a.startDate?.trim() ?? '') === (b.startDate?.trim() ?? '') &&
			(a.endDate?.trim() ?? '') === (b.endDate?.trim() ?? '') &&
			(ignoreSearch || (a.search?.trim() ?? '') === (b.search?.trim() ?? '')) &&
			(a.hideVoided ?? false) === (b.hideVoided ?? false) &&
			(a.amountOp ?? 'none') === (b.amountOp ?? 'none') &&
			(a.amountRaw?.trim() ?? '') === (b.amountRaw?.trim() ?? '')
		);
	}

	function cloneFilters(criteria: ActivityFilterCriteria): ActivityFilterCriteria {
		// Shallow copy — $state proxies are not structuredClone-safe.
		return {
			type: criteria.type ?? 'all',
			categoryId: criteria.categoryId ?? '',
			startDate: criteria.startDate ?? '',
			endDate: criteria.endDate ?? '',
			search: criteria.search ?? '',
			hideVoided: criteria.hideVoided ?? false,
			amountOp: criteria.amountOp ?? 'none',
			amountRaw: criteria.amountRaw ?? ''
		};
	}

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		return categoriesById[categoryId]?.name ?? 'Category';
	}

	function homeMoney(amount: number): string {
		return hideHomeAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}

	function daysLeftLabel(days: number): string {
		if (days > 0) return `${days} days left`;
		if (days === 0) return 'Due today';
		return `Overdue by ${Math.abs(days)} days`;
	}

	function navigate(next: string) {
		if (!isAppRoute(next)) return;
		onNavigate(next);
		sidebar.setOpenMobile(false);
	}

	function openAdd() {
		onOpenAdd();
		sidebar.setOpenMobile(false);
	}

	function openFilters() {
		draft = cloneFilters(applied);
		filtersOpen = true;
	}

	function openSort() {
		sortOpen = true;
	}

	function selectActivitySort(mode: ActivitySortMode) {
		activitySort = mode;
		sortOpen = false;
	}

	const sortOptions: { mode: ActivitySortMode; label: string; testid: string }[] = [
		{ mode: 'createdAt-desc', label: 'Default', testid: 'activity-sort-createdAt-desc' },
		{ mode: 'occurredOn-desc', label: 'Date (descending)', testid: 'activity-sort-occurredOn-desc' },
		{ mode: 'occurredOn-asc', label: 'Date (ascending)', testid: 'activity-sort-occurredOn-asc' },
		{ mode: 'category', label: 'Categories', testid: 'activity-sort-category' }
	];

	function applyFilters() {
		applied = { ...cloneFilters(draft), search: applied.search ?? '' };
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
			draft = cloneFilters(applied);
			filtersOpen = true;
			return;
		}
		if (draftDirty) {
			discardWarnOpen = true;
			filtersOpen = true;
			return;
		}
		filtersOpen = false;
	}

	function confirmDiscardFilters() {
		draft = cloneFilters(applied);
		filtersOpen = false;
	}

	function clearDraftFilters() {
		draft = { ...DEFAULT_ACTIVITY_FILTERS, search: applied.search ?? '' };
	}

	function updateAppliedSearch(next: string) {
		applied = { ...applied, search: next };
	}

	$effect(() => {
		if (route !== 'activity' || !xlWide.current) return;
		draft = cloneFilters(applied);
	});
</script>

<Sidebar.Root collapsible="offcanvas">
	<Sidebar.Header class="p-4">
		<div class="flex items-center gap-3">
			<img
				src="/favicon.svg"
				alt=""
				width="36"
				height="36"
				class="size-9 shrink-0 rounded-lg"
			/>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold">Pocket Ledger</p>
				<h1 class="text-muted-foreground truncate text-xs font-normal">
					{account?.name ?? 'Loading…'}
				</h1>
			</div>
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
</Sidebar.Root>

<Sidebar.Inset>
	<header
		class="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 md:px-6"
	>
		<Sidebar.Trigger data-testid="open-menu" />
		<div class="min-w-0 flex-1">
			<p class="text-base font-semibold tracking-tight md:text-lg" data-testid="page-title">
				{pageTitle}
			</p>
			<p class="text-muted-foreground truncate text-xs md:hidden">
				<span class="sr-only">Account </span>{account?.name ?? 'Loading…'}
			</p>
		</div>
		{#if route === 'home'}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				data-testid="toggle-home-amounts"
				aria-label={hideHomeAmounts ? 'Show money' : 'Hide money'}
				onclick={() => {
					hideHomeAmounts = !hideHomeAmounts;
					writeHideAmounts(hideHomeAmounts);
				}}
			>
				{#if hideHomeAmounts}
					<EyeOffIcon class="size-4" />
				{:else}
					<EyeIcon class="size-4" />
				{/if}
			</Button>
		{/if}
		<ThemeMenu preference={themePreference} onPreferenceChange={onThemePreferenceChange} />
	</header>

	<div
		class={[
			'mx-auto flex w-full flex-1 flex-col gap-4 p-4 pb-8 md:gap-4 md:p-6 md:pb-8',
			activityStageWide ? 'max-w-none' : 'max-w-3xl'
		]}
		data-testid="app-stage"
	>
		{#if route === 'home'}
			<div class="space-y-4" data-testid="home-panel">
				<section
					class="border-border/80 bg-card flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-xs"
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

				{#if goals.length > 0}
					{@const sorted = sortGoalsByNearestDeadline(goals, balanceMinor)}
					{@const top = sorted[0]}
					{@const days = daysRemaining(top.targetOn, todayOccurredOn())}
					{@const percent = goalProgressPercent(top.targetMinor, balanceMinor)}
					<button
						type="button"
						class="border-border/80 bg-card hover:bg-muted/40 flex w-full flex-col gap-0.5 rounded-xl border px-4 py-3 text-left shadow-xs transition-colors"
						data-testid="home-goal-strip"
						onclick={() => navigate('more')}
					>
						<p class="text-muted-foreground text-sm">Nearest goal</p>
						<p class="font-medium">{top.name}</p>
						<p class="text-muted-foreground text-sm">
							{percent}% · {daysLeftLabel(days)}
						</p>
					</button>
				{/if}

				{#if monthSummary}
					<MonthSummaryCard
						summary={monthSummary}
						{currencyLabel}
						hideAmounts={hideHomeAmounts}
						onPrevMonth={() => void onPrevMonth()}
						onNextMonth={() => void onNextMonth()}
					/>
				{/if}

				<Card.Root class="gap-0 py-0" data-testid="recent-card">
					<Card.Header
						class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3"
					>
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
											testid={`recent-row-${tx.id}`}
											onOpen={() => onOpenEdit(tx)}
										/>
									</li>
								{/each}
							</ul>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		{:else if route === 'activity'}
			<div
				data-testid="activity-panel"
				class={xlWide.current ? 'flex gap-4' : 'space-y-3'}
			>
				{#snippet filterFormFields()}
					<div class="space-y-1">
						<Label for="activity-filter-type">Type</Label>
						<select
							id="activity-filter-type"
							class="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
							bind:value={draft.type}
							data-testid="activity-filter-type"
						>
							<option value="all">All</option>
							<option value="income">Income</option>
							<option value="expense">Expense</option>
						</select>
					</div>
					<div class="space-y-1">
						<Label for="activity-filter-category">Category</Label>
						<select
							id="activity-filter-category"
							class="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
							bind:value={draft.categoryId}
							data-testid="activity-filter-category"
						>
							<option value="">All</option>
							<option value={UNCATEGORIZED_FILTER}>Uncategorized</option>
							{#each filterCategories as category (category.id)}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-1">
						<Label for="activity-filter-start">From</Label>
						<DateField
							id="activity-filter-start"
							value={draft.startDate ?? ''}
							aria-label="From date"
							testid="activity-filter-start"
							onValueChange={(next) => (draft.startDate = next)}
						/>
					</div>
					<div class="space-y-1">
						<Label for="activity-filter-end">To</Label>
						<DateField
							id="activity-filter-end"
							value={draft.endDate ?? ''}
							aria-label="To date"
							testid="activity-filter-end"
							onValueChange={(next) => (draft.endDate = next)}
						/>
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							bind:checked={draft.hideVoided}
							data-testid="activity-filter-hide-voided"
						/>
						Hide voided
					</label>
					<div class="space-y-1">
						<Label for="activity-filter-amount-op">Amount</Label>
						<div class="flex gap-2">
							<select
								id="activity-filter-amount-op"
								class="border-input bg-background flex h-9 min-w-0 flex-1 rounded-md border px-3 text-sm"
								bind:value={draft.amountOp}
								data-testid="activity-filter-amount-op"
							>
								<option value="none">Any</option>
								<option value="lt">Less than</option>
								<option value="gt">Greater than</option>
							</select>
							<Input
								type="text"
								inputmode="numeric"
								placeholder="Amount"
								class="min-w-0 flex-1"
								disabled={(draft.amountOp ?? 'none') === 'none'}
								bind:value={draft.amountRaw}
								data-testid="activity-filter-amount"
							/>
						</div>
					</div>
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

				<div class="min-w-0 flex-1 space-y-3">
					<div class="flex items-center gap-2">
						<div class="relative flex-1" data-testid="activity-filters">
							<SearchIcon
								class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
								aria-hidden="true"
							/>
							<Input
								id="activity-filter-search"
								type="search"
								placeholder="Note or amount"
								class="pl-9"
								value={applied.search ?? ''}
								data-testid="activity-filter-search"
								oninput={(e) => updateAppliedSearch(e.currentTarget.value)}
							/>
						</div>
						<div class="flex shrink-0 items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="icon"
								class={['shrink-0', sortActive && toolbarActiveChrome]}
								aria-label="Sort"
								aria-pressed={sortActive}
								data-testid="activity-sort-open"
								data-active={sortActive ? 'true' : undefined}
								onclick={openSort}
							>
								<ArrowUpDownIcon class="size-4" />
							</Button>
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
							Add
						</Button>
					</div>

					<Sheet.Root open={sortOpen} onOpenChange={(open) => (sortOpen = open)}>
						<Sheet.Content
							side={sortSheetSide}
							class={sortSheetClass}
							data-testid="activity-sort-sheet"
							showCloseButton={false}
						>
							<Sheet.Title class="sr-only">Sort</Sheet.Title>
							<div class="border-border flex items-center justify-between border-b px-4 py-3">
								<p class="inline-flex items-center gap-2 text-base font-semibold">
									<ArrowUpDownIcon class="size-4" aria-hidden="true" />
									Sort
								</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									data-testid="activity-sort-close"
									onclick={() => (sortOpen = false)}
								>
									Close
								</Button>
							</div>
							<ul class="grid gap-1 px-2 py-3" role="listbox" aria-label="Sort options">
								{#each sortOptions as option (option.mode)}
									<li>
										<button
											type="button"
											role="option"
											aria-selected={activitySort === option.mode}
											class={[
												'hover:bg-muted/60 flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm',
												activitySort === option.mode && 'bg-muted'
											]}
											data-testid={option.testid}
											onclick={() => selectActivitySort(option.mode)}
										>
											<span>{option.label}</span>
											{#if activitySort === option.mode}
												<CheckIcon class="size-4 shrink-0" aria-hidden="true" />
											{/if}
										</button>
									</li>
								{/each}
							</ul>
						</Sheet.Content>
					</Sheet.Root>

					{#if !xlWide.current}
						<Sheet.Root open={filtersOpen} onOpenChange={onFiltersOpenChange}>
							<Sheet.Content
								side={filtersSheetSide}
								class={filtersSheetClass}
								data-testid="activity-filters-sheet"
								showCloseButton={false}
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
						sortMode={activitySort}
						categoryMeta={categorySortMeta}
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
		{:else if route === 'categories'}
			<CategoriesPanel
				{expenseCategories}
				{incomeCategories}
				{onCreateCategory}
				{onRenameCategory}
				{onDeleteCategory}
				{onReorderCategories}
			/>
		{:else}
			<MorePanel
				{currencyLabel}
				{balanceMinor}
				{recurringRules}
				{goals}
				{expenseCategories}
				{incomeCategories}
				{lockEnabled}
				{onExport}
				{onImportFile}
				{onResetLocalData}
				{onCreateRecurring}
				{onToggleRecurring}
				{onDeleteRecurring}
				{onCreateGoal}
				{onDeleteGoal}
				{onEnableLock}
				{onDisableLock}
			/>
		{/if}
	</div>
</Sidebar.Inset>
