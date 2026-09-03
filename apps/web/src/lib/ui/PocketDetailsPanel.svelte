<script lang="ts">
	import AlignLeftIcon from '@lucide/svelte/icons/align-left';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TargetIcon from '@lucide/svelte/icons/target';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import MonthSummaryCard from '$lib/ui/MonthSummary.svelte';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import PocketGoalFormDialog from '$lib/ui/PocketGoalFormDialog.svelte';
	import type { Account } from '$lib/domain/account';
	import type { CategoryRow } from '$lib/data/db';
	import { latestPocketTransactions } from '$lib/domain/activity-filters';
	import {
		goalProgressPercent,
		isActive,
		pastGoalBadge,
		sortActiveGoals,
		sortPastGoals,
		type PocketGoal
	} from '$lib/domain/goals';
	import { formatRemainingUnit, largestRemainingUnit } from '$lib/domain/goal-time';
	import { formatMinor } from '$lib/domain/money';
	import {
		buildMonthSummary,
		canShiftMonth,
		clampMonthKey,
		currentMonthKey,
		resolveMonthBounds,
		shiftMonth,
		type CategoryMeta
	} from '$lib/domain/month-summary';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import { todayOccurredOn } from '$lib/domain/transaction-rules';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import { goalEndOfDayBalance } from '$lib/domain/pocket-balance';
	import { createPocketGoal, dropPocketGoal, updatePocketGoal } from '$lib/application/goals';

	type Props = {
		pocket: Account;
		balance: number;
		currencyLabel: string;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		pockets: Account[];
		goals: PocketGoal[];
		hideAmounts?: boolean;
		onAdd: () => void;
		onSeeMore: () => void;
		onOpenTx: (tx: LedgerTransaction) => void;
		onRefresh: () => void | Promise<void>;
	};

	let {
		pocket,
		balance,
		currencyLabel,
		transactions,
		categoriesById,
		pockets,
		goals,
		hideAmounts = false,
		onAdd,
		onSeeMore,
		onOpenTx,
		onRefresh
	}: Props = $props();

	let requestedMonth = $state(currentMonthKey());
	let goalFormOpen = $state(false);
	let goalFormMode = $state<'create' | 'edit'>('create');
	let editingGoal = $state<PocketGoal | null>(null);
	let pastOpen = $state(false);

	$effect(() => {
		pocket.id;
		requestedMonth = currentMonthKey();
	});

	const touching = $derived(
		transactions.filter((tx) => tx.accountId === pocket.id || tx.counterAccountId === pocket.id)
	);
	const bounds = $derived(resolveMonthBounds(touching, [pocket.openingAsOf]));
	const monthKey = $derived(clampMonthKey(requestedMonth, bounds));
	const categoryMeta = $derived(
		Object.fromEntries(
			Object.values(categoriesById).map((c) => [c.id, { name: c.name, sortOrder: c.sortOrder }])
		) as Record<string, CategoryMeta>
	);
	const summary = $derived(
		buildMonthSummary(transactions, monthKey, categoryMeta, pockets, { pocketId: pocket.id })
	);
	const canPrev = $derived(canShiftMonth(monthKey, -1, bounds));
	const canNext = $derived(canShiftMonth(monthKey, 1, bounds));

	const latest = $derived(latestPocketTransactions(transactions, pocket.id, 10));
	const pocketsById = $derived(
		Object.fromEntries(pockets.map((p) => [p.id, { name: p.name, isMain: p.isMain }]))
	);
	const today = $derived(todayOccurredOn());
	const pocketGoals = $derived(goals.filter((g) => g.accountId === pocket.id));
	const activeGoals = $derived(sortActiveGoals(pocketGoals, today));
	const pastGoals = $derived(sortPastGoals(pocketGoals, today));
	const notes = $derived(pocket.notes.trim());

	function money(amount: number): string {
		return hideAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		return categoriesById[categoryId]?.name ?? 'Category';
	}

	function onPrevMonth() {
		if (!canPrev) return;
		requestedMonth = shiftMonth(monthKey, -1);
	}

	function onNextMonth() {
		if (!canNext) return;
		requestedMonth = shiftMonth(monthKey, 1);
	}

	function openCreateGoal() {
		editingGoal = null;
		goalFormMode = 'create';
		goalFormOpen = true;
	}

	function openEditGoal(goal: PocketGoal) {
		if (!isActive(goal, today)) return;
		editingGoal = goal;
		goalFormMode = 'edit';
		goalFormOpen = true;
	}

	function badgeClass(badge: string): string {
		if (badge === 'Achieved') return 'bg-income/15 text-income';
		if (badge === 'Missed') return 'bg-destructive/15 text-destructive';
		return 'bg-muted text-muted-foreground';
	}
</script>

<div class="space-y-4" data-testid="pocket-details-panel">
	{#if notes}
		<section
			class="border-border/80 bg-card flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-[var(--elev-card)]"
			data-testid="pocket-details-identity"
		>
			<p class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
				<AlignLeftIcon class="size-3.5" aria-hidden="true" />
				Descriptions
			</p>
			<p class="text-base font-medium" data-testid="pocket-details-description">
				{notes}
			</p>
		</section>
	{/if}

	<section
		class="border-border/80 bg-card flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-[var(--elev-card)]"
		data-testid="pocket-details-balance-hero"
	>
		<p class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
			<WalletIcon class="size-3.5" aria-hidden="true" />
			Balance
		</p>
		<p class="text-2xl font-semibold tracking-tight md:text-3xl" data-testid="pocket-details-balance">
			{money(balance)}
		</p>
	</section>

	{#if pocket.openingEnabled}
		<section
			class="border-border/80 bg-card flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-[var(--elev-card)]"
			data-testid="pocket-details-opening"
		>
			<p class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
				<BanknoteIcon class="size-3.5" aria-hidden="true" />
				Opening balance
			</p>
			<div class="flex flex-col gap-0.5">
				<p class="text-sm font-semibold tabular-nums">
					{money(pocket.openingBalanceMinor)}
				</p>
				<p class="text-muted-foreground text-sm" data-testid="pocket-details-opening-asof">
					As of {formatOccurredOnDisplay(pocket.openingAsOf)}
				</p>
			</div>
		</section>
	{/if}

	<Card.Root class="gap-0 py-0" data-testid="pocket-details-goals-card">
		<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
			<Card.Title class="inline-flex items-center gap-1.5 text-base">
				<TargetIcon class="size-4" aria-hidden="true" />
				Goals
			</Card.Title>
			<Button type="button" size="sm" onclick={openCreateGoal} data-testid="pocket-details-add-goal">
				<PlusIcon class="size-4" />
				Add Goal
			</Button>
		</Card.Header>
		<Card.Content class="px-2 pb-2">
			{#if activeGoals.length === 0}
				<EmptyState
					testid="pocket-details-goals-empty"
					title="No goals"
					description="Goals you add will show up here."
					class="px-2 pb-2"
				>
					{#snippet icon()}
						<TargetIcon class="size-5" />
					{/snippet}
				</EmptyState>
			{:else}
				<ul class="divide-border divide-y" data-testid="pocket-details-goals-list">
					{#each activeGoals as goal (goal.id)}
						{@const percent = goalProgressPercent(goal.targetMinor, balance)}
						{@const remaining = goal.targetOn
							? largestRemainingUnit(today, goal.targetOn)
							: null}
						{@const title = goal.description.trim()}
						<li>
							<button
								type="button"
								class="hover:bg-accent/70 w-full rounded-md px-2 py-2.5 text-left"
								data-testid={`pocket-details-goal-row-${goal.id}`}
								onclick={() => openEditGoal(goal)}
							>
								{#if title}
									<p class="text-sm font-medium">{title}</p>
								{/if}
								<p class="text-muted-foreground text-xs tabular-nums">
									{money(Math.max(0, balance))} / {money(goal.targetMinor)} · {percent}%
								</p>
								{#if remaining && goal.targetOn}
									<p class="text-muted-foreground text-xs">
										{formatOccurredOnDisplay(goal.targetOn)} ({formatRemainingUnit(remaining)})
									</p>
								{/if}
								<div class="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
									<div class="bg-primary h-full rounded-full" style={`width: ${percent}%`}></div>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			{#if pastGoals.length > 0}
				<Button
					type="button"
					variant="ghost"
					class="text-muted-foreground hover:text-foreground mt-1 w-full justify-center text-sm"
					data-testid="pocket-details-see-past-goals"
					onclick={() => (pastOpen = true)}
				>
					See past goals
				</Button>
			{/if}
		</Card.Content>
	</Card.Root>

	<MonthSummaryCard
		summary={summary}
		{currencyLabel}
		{hideAmounts}
		canPrev={canPrev}
		canNext={canNext}
		onPrevMonth={onPrevMonth}
		onNextMonth={onNextMonth}
	/>

	<Card.Root class="gap-0 py-0" data-testid="pocket-details-recent-card">
		<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
			<Card.Title class="inline-flex items-center gap-1.5 text-base">
				<HistoryIcon class="size-4" aria-hidden="true" />
				Recent
			</Card.Title>
			<Button type="button" size="sm" onclick={onAdd} data-testid="pocket-details-add">
				<PlusIcon class="size-4" />
				Add Transaction
			</Button>
		</Card.Header>
		<Card.Content class="px-2 pb-2">
			{#if latest.length === 0}
				<EmptyState
					testid="pocket-details-recent-empty"
					title="No recent activity"
					description="Transactions you add will show up here."
					class="px-2 pb-2"
				>
					{#snippet icon()}
						<InboxIcon class="size-5" />
					{/snippet}
				</EmptyState>
			{:else}
				<ul class="divide-border divide-y" data-testid="pocket-details-recent-list">
					{#each latest as tx (tx.id)}
						<li>
							<TransactionListRow
								{tx}
								{currencyLabel}
								categoryLabel={categoryName(tx.categoryId)}
								uncategorized={tx.categoryId == null}
								hideAmount={hideAmounts}
								secondary="date"
								{pocketsById}
								showPocket
								testid={`pocket-details-row-${tx.id}`}
								onOpen={() => onOpenTx(tx)}
							/>
						</li>
					{/each}
				</ul>
			{/if}
			<Button
				type="button"
				variant="ghost"
				class="text-muted-foreground hover:text-foreground mt-1 w-full justify-center text-sm"
				data-testid="pocket-details-see-more"
				onclick={onSeeMore}
			>
				See more in Transactions
			</Button>
		</Card.Content>
	</Card.Root>
</div>

<PocketGoalFormDialog
	open={goalFormOpen}
	mode={goalFormMode}
	{currencyLabel}
	initial={editingGoal
		? {
				description: editingGoal.description,
				targetMinor: editingGoal.targetMinor,
				targetOn: editingGoal.targetOn
			}
		: null}
	onOpenChange={(next) => {
		goalFormOpen = next;
		if (!next) editingGoal = null;
	}}
	onSave={async (input) => {
		if (goalFormMode === 'create') {
			await createPocketGoal({
				accountId: pocket.id,
				description: input.description,
				targetRaw: input.targetRaw,
				targetOn: input.targetOn
			});
		} else if (editingGoal) {
			await updatePocketGoal({
				id: editingGoal.id,
				description: input.description,
				targetRaw: input.targetRaw,
				targetOn: input.targetOn
			});
		}
		await onRefresh();
	}}
	onDrop={editingGoal
		? async () => {
				await dropPocketGoal(editingGoal!.id);
				await onRefresh();
			}
		: undefined}
/>

<Dialog.Root open={pastOpen} onOpenChange={(next) => (pastOpen = next)}>
	<Dialog.Content class="sm:max-w-md" data-testid="pocket-past-goals-dialog">
		<Dialog.Header>
			<Dialog.Title>Past goals</Dialog.Title>
			<Dialog.Description>Goals that have ended or been dropped.</Dialog.Description>
		</Dialog.Header>
		<ul class="divide-border max-h-[60vh] divide-y overflow-y-auto">
			{#each pastGoals as goal (goal.id)}
				{@const endBalance = goal.targetOn
					? goalEndOfDayBalance(pocket, goal.targetOn, transactions)
					: 0}
				{@const badge = pastGoalBadge(goal, endBalance)}
				{@const title = goal.description.trim()}
				<li class="space-y-1 py-3" data-testid={`pocket-past-goal-${goal.id}`}>
					{#if title}
						<p class="text-sm font-medium">{title}</p>
					{/if}
					<p class="text-muted-foreground text-xs tabular-nums">
						{money(goal.targetMinor)}
						{#if goal.targetOn}
							· {formatOccurredOnDisplay(goal.targetOn)}
						{/if}
					</p>
					<span
						class={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass(badge)}`}
					>
						{badge}
					</span>
				</li>
			{/each}
		</ul>
	</Dialog.Content>
</Dialog.Root>

