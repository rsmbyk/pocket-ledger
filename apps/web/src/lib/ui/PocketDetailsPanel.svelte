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
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import MonthSummaryCard from '$lib/ui/MonthSummary.svelte';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import type { Account } from '$lib/domain/account';
	import type { CategoryRow } from '$lib/data/db';
	import { latestPocketTransactions } from '$lib/domain/activity-filters';
	import { goalProgressPercent } from '$lib/domain/goals';
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

	type Props = {
		pocket: Account;
		balance: number;
		currencyLabel: string;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		pockets: Account[];
		hideAmounts?: boolean;
		onAdd: () => void;
		onSeeMore: () => void;
		onOpenTx: (tx: LedgerTransaction) => void;
	};

	let {
		pocket,
		balance,
		currencyLabel,
		transactions,
		categoriesById,
		pockets,
		hideAmounts = false,
		onAdd,
		onSeeMore,
		onOpenTx
	}: Props = $props();

	let requestedMonth = $state(currentMonthKey());

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
	const hasGoal = $derived(pocket.goalEnabled && pocket.goalTargetMinor != null);
	const goalPercent = $derived(
		hasGoal ? goalProgressPercent(pocket.goalTargetMinor!, balance) : 0
	);
	const remaining = $derived(
		hasGoal && pocket.goalTargetOn
			? largestRemainingUnit(todayOccurredOn(), pocket.goalTargetOn)
			: null
	);
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

	{#if hasGoal}
		<section
			class="border-border/80 bg-card flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-[var(--elev-card)]"
			data-testid="pocket-details-goal"
		>
			<p class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
				<TargetIcon class="size-3.5" aria-hidden="true" />
				Goal
			</p>
			<div class="flex flex-col gap-0.5">
				<p class="text-sm font-semibold tabular-nums">
					{money(Math.max(0, balance))} / {money(pocket.goalTargetMinor!)}
				</p>
				{#if remaining && pocket.goalTargetOn}
					<p class="text-muted-foreground text-sm" data-testid="pocket-goal-remaining">
						{formatOccurredOnDisplay(pocket.goalTargetOn)} ({formatRemainingUnit(remaining)})
					</p>
				{/if}
			</div>
			<div class="space-y-1">
				<p
					class="text-muted-foreground text-right text-sm tabular-nums"
					data-testid="pocket-details-goal-percent"
				>
					{goalPercent}%
				</p>
				<div class="bg-muted h-1.5 overflow-hidden rounded-full">
					<div class="bg-primary h-full rounded-full" style={`width: ${goalPercent}%`}></div>
				</div>
			</div>
		</section>
	{/if}

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
