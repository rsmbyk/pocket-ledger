<script lang="ts">
	import HomeIcon from '@lucide/svelte/icons/house';
	import ListIcon from '@lucide/svelte/icons/list';
	import TagsIcon from '@lucide/svelte/icons/tags';
	import MoreHorizontalIcon from '@lucide/svelte/icons/ellipsis';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ThemeMenu from '$lib/ui/ThemeMenu.svelte';
	import MonthSummaryCard from '$lib/ui/MonthSummary.svelte';
	import MorePanel from '$lib/ui/MorePanel.svelte';
	import CategoriesPanel from '$lib/ui/CategoriesPanel.svelte';
	import ActivityTable from '$lib/ui/ActivityTable.svelte';
	import type { Account } from '$lib/domain/account';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { RecurringRule, RecurringFrequency } from '$lib/domain/recurring';
	import type { Goal } from '$lib/domain/goals';
	import type { NetWorthSnapshot } from '$lib/domain/net-worth';
	import type { AddableTransactionType } from '$lib/domain/transaction-rules';
	import { formatMinor } from '$lib/domain/money';
	import { isAppRoute, type AppRoute } from '$lib/shared/router';
	import {
		filterTransactions,
		type ActivityTypeFilter
	} from '$lib/domain/activity-filters';
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
		snapshots: NetWorthSnapshot[];
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
		snapshots,
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
		onNavigate,
		onOpenAdd,
		onOpenEdit
	}: Props = $props();

	const sidebar = Sidebar.useSidebar();

	const currencyLabel = $derived(account?.currencyLabel ?? 'IDR');
	const recent = $derived(transactions.slice(0, 5));

	let filterType = $state<ActivityTypeFilter>('all');
	let filterCategoryId = $state('');
	let filterStart = $state('');
	let filterEnd = $state('');
	let filterSearch = $state('');

	const filterCategories = $derived(
		[...expenseCategories, ...incomeCategories].sort((a, b) => a.name.localeCompare(b.name))
	);

	const filteredTransactions = $derived(
		filterTransactions(transactions, {
			type: filterType,
			categoryId: filterCategoryId || null,
			startDate: filterStart || null,
			endDate: filterEnd || null,
			search: filterSearch || null
		})
	);

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

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		return categoriesById[categoryId]?.name ?? 'Category';
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
		<ThemeMenu preference={themePreference} onPreferenceChange={onThemePreferenceChange} />
	</header>

	<div
		class="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pb-8 md:gap-4 md:p-6 md:pb-8"
		data-testid="app-stage"
	>
		{#if route === 'home'}
			<div class="space-y-4" data-testid="home-panel">
				<section
					class="border-border/80 bg-card flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-xs"
					data-testid="balance-hero"
				>
					<p class="text-muted-foreground text-sm">Balance</p>
					<p
						class="text-2xl font-semibold tracking-tight md:text-3xl"
						data-testid="account-balance"
					>
						{formatMinor(balanceMinor, currencyLabel)}
					</p>
				</section>

				{#if monthSummary}
					<MonthSummaryCard
						summary={monthSummary}
						{currencyLabel}
						onPrevMonth={() => void onPrevMonth()}
						onNextMonth={() => void onNextMonth()}
					/>
				{/if}

				<Card.Root class="gap-0 py-0" data-testid="recent-card">
					<Card.Header
						class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3"
					>
						<Card.Title class="text-base">Recent</Card.Title>
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
							<div class="space-y-3 px-2 pb-2" data-testid="home-empty">
								<p class="text-muted-foreground text-sm">No transactions yet.</p>
								<Button type="button" onclick={openAdd} data-testid="home-empty-add"
									>Get started</Button
								>
							</div>
						{:else}
							<ul class="divide-border divide-y" data-testid="recent-list">
								{#each recent as tx (tx.id)}
									{@const voided = isVoided(tx)}
									<li>
										<button
											type="button"
											class={[
												'hover:bg-muted/60 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors',
												voided && 'text-muted-foreground opacity-70'
											]}
											data-testid={`recent-row-${tx.id}`}
											onclick={() => onOpenEdit(tx)}
										>
											<div class="min-w-0 flex-1">
												<p class="inline-flex flex-wrap items-center gap-1.5 font-medium">
													{categoryName(tx.categoryId)}
													{#if voided}
														<span
															class="bg-muted text-muted-foreground inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium"
														>
															Void
														</span>
													{/if}
												</p>
												<p class="truncate text-xs">
													{tx.note || tx.type} · {tx.occurredOn}
												</p>
											</div>
											<p
												class={[
													'shrink-0 font-medium tabular-nums',
													voided && 'line-through',
													!voided &&
														(tx.type === 'expense'
															? 'text-destructive'
															: 'text-emerald-600 dark:text-emerald-400')
												]}
											>
												{tx.type === 'expense' ? '−' : '+'}{formatMinor(
													tx.amountMinor,
													currencyLabel
												)}
											</p>
											<ChevronRightIcon class="text-muted-foreground size-4 shrink-0" />
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		{:else if route === 'activity'}
			<div class="space-y-3" data-testid="activity-panel">
				<div
					class="border-border/80 bg-card/60 grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
					data-testid="activity-filters"
				>
					<div class="space-y-1">
						<Label for="activity-filter-type">Type</Label>
						<select
							id="activity-filter-type"
							class="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
							bind:value={filterType}
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
							bind:value={filterCategoryId}
							data-testid="activity-filter-category"
						>
							<option value="">All</option>
							{#each filterCategories as category (category.id)}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-1">
						<Label for="activity-filter-start">From</Label>
						<Input
							id="activity-filter-start"
							type="date"
							bind:value={filterStart}
							data-testid="activity-filter-start"
						/>
					</div>
					<div class="space-y-1">
						<Label for="activity-filter-end">To</Label>
						<Input
							id="activity-filter-end"
							type="date"
							bind:value={filterEnd}
							data-testid="activity-filter-end"
						/>
					</div>
					<div class="space-y-1 sm:col-span-2">
						<Label for="activity-filter-search">Search</Label>
						<Input
							id="activity-filter-search"
							type="search"
							placeholder="Note or amount"
							bind:value={filterSearch}
							data-testid="activity-filter-search"
						/>
					</div>
				</div>
				<ActivityTable
					transactions={filteredTransactions}
					{currencyLabel}
					{categoryName}
					onEdit={onOpenEdit}
					onAdd={openAdd}
				/>
			</div>
		{:else if route === 'categories'}
			<CategoriesPanel
				{expenseCategories}
				{incomeCategories}
				{onCreateCategory}
				{onRenameCategory}
				{onDeleteCategory}
			/>
		{:else}
			<MorePanel
				{currencyLabel}
				{recurringRules}
				{goals}
				{snapshots}
				{expenseCategories}
				{incomeCategories}
				{lockEnabled}
				{onExport}
				{onImportFile}
				{onCreateRecurring}
				{onToggleRecurring}
				{onDeleteRecurring}
				{onCreateGoal}
				{onUpdateGoalSaved}
				{onDeleteGoal}
				{onCaptureNetWorth}
				{onEnableLock}
				{onDisableLock}
			/>
		{/if}
	</div>
</Sidebar.Inset>
