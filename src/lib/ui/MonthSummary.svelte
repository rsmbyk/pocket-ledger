<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CategoryBreakdownChart from '$lib/ui/CategoryBreakdownChart.svelte';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMonthLabel } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		summary: MonthSummary;
		currencyLabel: string;
		hideAmounts?: boolean;
		onPrevMonth: () => void;
		onNextMonth: () => void;
	};

	let { summary, currencyLabel, hideAmounts = false, onPrevMonth, onNextMonth }: Props =
		$props();

	function money(amount: number): string {
		return hideAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}
</script>

{#snippet incomeTitleIcon()}
	<TrendingUpIcon class="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
{/snippet}

{#snippet expenseTitleIcon()}
	<ShoppingBagIcon class="text-destructive size-3.5" aria-hidden="true" />
{/snippet}

<Card.Root class="gap-0 py-0" data-testid="month-summary">
	<Card.Header class="gap-2 px-4 pt-3 pb-3">
		<div class="flex items-center justify-between gap-2">
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Previous month"
				onclick={onPrevMonth}
			>
				<ChevronLeftIcon class="size-4" />
			</Button>
			<div class="text-center">
				<Card.Title class="text-sm font-semibold" data-testid="month-label"
					>{formatMonthLabel(summary.monthKey)}</Card.Title
				>
				<Card.Description class="text-xs">Month summary</Card.Description>
			</div>
			<Button variant="outline" size="icon-sm" aria-label="Next month" onclick={onNextMonth}>
				<ChevronRightIcon class="size-4" />
			</Button>
		</div>
	</Card.Header>
	<Card.Content class="p-0">
		<div class="border-border border-t px-4 py-3">
			<div class="grid grid-cols-3 gap-2 text-center text-sm">
				<div class="bg-muted/40 rounded-md px-2 py-2">
					<p class="text-muted-foreground text-[11px]">Income</p>
					<p
						class={[
							'mt-1 font-semibold',
							hideAmounts
								? 'text-muted-foreground'
								: 'text-emerald-600 dark:text-emerald-400'
						]}
						data-testid="month-income"
					>
						{money(summary.incomeMinor)}
					</p>
				</div>
				<div class="bg-muted/40 rounded-md px-2 py-2">
					<p class="text-muted-foreground text-[11px]">Expenses</p>
					<p
						class={[
							'mt-1 font-semibold',
							hideAmounts ? 'text-muted-foreground' : 'text-destructive'
						]}
						data-testid="month-expense"
					>
						{money(summary.expenseMinor)}
					</p>
				</div>
				<div class="bg-muted/40 rounded-md px-2 py-2">
					<p class="text-muted-foreground text-[11px]">Net</p>
					<p
						class={[
							'mt-1 font-semibold',
							hideAmounts && 'text-muted-foreground',
							!hideAmounts && summary.netMinor > 0 && 'text-emerald-600 dark:text-emerald-400',
							!hideAmounts && summary.netMinor < 0 && 'text-destructive',
							!hideAmounts && summary.netMinor === 0 && 'text-muted-foreground'
						]}
						data-testid="month-net"
					>
						{money(summary.netMinor)}
					</p>
				</div>
			</div>
		</div>

		<div class="border-border border-t px-4 py-3">
			<CategoryBreakdownChart
				title="Income"
				titleIcon={incomeTitleIcon}
				rows={summary.incomeByCategory}
				{currencyLabel}
				emptyLabel="No income this month."
				barClass="bg-emerald-500"
				testid="income-category-chart"
				{hideAmounts}
			/>
		</div>
		<div class="border-border border-t px-4 py-3">
			<CategoryBreakdownChart
				title="Expenses"
				titleIcon={expenseTitleIcon}
				rows={summary.expenseByCategory}
				{currencyLabel}
				emptyLabel="No expenses this month."
				barClass="bg-destructive/80"
				testid="category-chart"
				{hideAmounts}
			/>
		</div>

		<div
			class="border-border space-y-1.5 border-t px-4 py-3 text-sm"
			data-testid="month-balance-footer"
		>
			<div class="flex justify-between gap-2">
				<span class="text-muted-foreground">Opening</span>
				<span
					class={['tabular-nums', hideAmounts && 'text-muted-foreground']}
					data-testid="month-opening">{money(summary.openingMinor)}</span
				>
			</div>
			<div class="flex justify-between gap-2">
				<span class="text-muted-foreground">Net</span>
				<span
					class={[
						'tabular-nums',
						hideAmounts && 'text-muted-foreground',
						!hideAmounts && summary.netMinor > 0 && 'text-emerald-600 dark:text-emerald-400',
						!hideAmounts && summary.netMinor < 0 && 'text-destructive',
						!hideAmounts && summary.netMinor === 0 && 'text-muted-foreground'
					]}
					data-testid="month-footer-net"
					>{money(summary.netMinor)}</span
				>
			</div>
			<div class="flex justify-between gap-2 font-medium">
				<span>Ending</span>
				<span
					class={['tabular-nums', hideAmounts && 'text-muted-foreground']}
					data-testid="month-ending">{money(summary.endingMinor)}</span
				>
			</div>
		</div>
	</Card.Content>
</Card.Root>
