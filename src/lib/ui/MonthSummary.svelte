<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CategoryBreakdownChart from '$lib/ui/CategoryBreakdownChart.svelte';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMonthLabel } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		summary: MonthSummary;
		currencyLabel: string;
		onPrevMonth: () => void;
		onNextMonth: () => void;
	};

	let { summary, currencyLabel, onPrevMonth, onNextMonth }: Props = $props();
</script>

<Card.Root class="gap-0 py-0" data-testid="month-summary">
	<Card.Header class="gap-2 px-4 py-3">
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
						class="mt-1 font-semibold text-emerald-600 dark:text-emerald-400"
						data-testid="month-income"
					>
						{formatMinor(summary.incomeMinor, currencyLabel)}
					</p>
				</div>
				<div class="bg-muted/40 rounded-md px-2 py-2">
					<p class="text-muted-foreground text-[11px]">Expense</p>
					<p class="text-destructive mt-1 font-semibold" data-testid="month-expense">
						{formatMinor(summary.expenseMinor, currencyLabel)}
					</p>
				</div>
				<div class="bg-muted/40 rounded-md px-2 py-2">
					<p class="text-muted-foreground text-[11px]">Net</p>
					<p
						class={[
							'mt-1 font-semibold',
							summary.netMinor > 0 && 'text-emerald-600 dark:text-emerald-400',
							summary.netMinor < 0 && 'text-destructive',
							summary.netMinor === 0 && 'text-muted-foreground'
						]}
						data-testid="month-net"
					>
						{formatMinor(summary.netMinor, currencyLabel)}
					</p>
				</div>
			</div>
		</div>

		<div class="border-border border-t px-4 py-3">
			<CategoryBreakdownChart
				title="Income by category"
				rows={summary.incomeByCategory}
				{currencyLabel}
				emptyLabel="No income this month."
				barClass="bg-emerald-500"
				testid="income-category-chart"
			/>
		</div>
		<div class="border-border border-t px-4 py-3">
			<CategoryBreakdownChart
				title="Expenses by category"
				rows={summary.expenseByCategory}
				{currencyLabel}
				emptyLabel="No expenses this month."
				barClass="bg-destructive/80"
				testid="category-chart"
			/>
		</div>

		<div
			class="border-border space-y-1.5 border-t px-4 py-3 text-sm"
			data-testid="month-balance-footer"
		>
			<div class="flex justify-between gap-2">
				<span class="text-muted-foreground">Opening</span>
				<span class="tabular-nums" data-testid="month-opening"
					>{formatMinor(summary.openingMinor, currencyLabel)}</span
				>
			</div>
			<div class="flex justify-between gap-2">
				<span class="text-muted-foreground">Net</span>
				<span
					class={[
						'tabular-nums',
						summary.netMinor > 0 && 'text-emerald-600 dark:text-emerald-400',
						summary.netMinor < 0 && 'text-destructive',
						summary.netMinor === 0 && 'text-muted-foreground'
					]}
					data-testid="month-footer-net"
					>{formatMinor(summary.netMinor, currencyLabel)}</span
				>
			</div>
			<div class="flex justify-between gap-2 font-medium">
				<span>Ending</span>
				<span class="tabular-nums" data-testid="month-ending"
					>{formatMinor(summary.endingMinor, currencyLabel)}</span
				>
			</div>
		</div>
	</Card.Content>
</Card.Root>
