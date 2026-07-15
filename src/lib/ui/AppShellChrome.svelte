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
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { ThemePreference } from '$lib/shared/theme';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import type { RecurringRule, RecurringFrequency } from '$lib/domain/recurring';
	import type { Goal } from '$lib/domain/goals';
	import type { NetWorthSnapshot } from '$lib/domain/net-worth';
	import type { AddableTransactionType } from '$lib/domain/transaction-rules';
	import { formatMinor } from '$lib/domain/money';
	import { isAppRoute, type AppRoute } from '$lib/shared/router';

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
		<Sidebar.Trigger data-testid="open-menu" aria-label="Open menu" />
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
									<li>
										<button
											type="button"
											class="hover:bg-muted/60 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors"
											data-testid={`recent-row-${tx.id}`}
											onclick={() => onOpenEdit(tx)}
										>
											<div class="min-w-0 flex-1">
												<p class="font-medium">{categoryName(tx.categoryId)}</p>
												<p class="text-muted-foreground truncate text-xs">
													{tx.note || tx.type} · {tx.occurredOn}
												</p>
											</div>
											<p
												class={[
													'shrink-0 font-medium tabular-nums',
													tx.type === 'expense'
														? 'text-destructive'
														: 'text-emerald-600 dark:text-emerald-400'
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
			<div class="space-y-3">
				<div
					class="border-border/80 bg-card/60 flex items-baseline justify-between gap-3 rounded-lg border px-4 py-3"
					data-testid="balance-compact"
				>
					<p class="text-muted-foreground text-sm">Balance</p>
					<p class="text-xl font-semibold tracking-tight" data-testid="account-balance">
						{formatMinor(balanceMinor, currencyLabel)}
					</p>
				</div>
				<ActivityTable
					{transactions}
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
