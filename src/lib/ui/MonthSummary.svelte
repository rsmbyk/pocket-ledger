<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CashflowChart from '$lib/ui/CashflowChart.svelte';
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

<Card.Root data-testid="month-summary">
	<Card.Header class="gap-3">
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
				<Card.Title class="text-base" data-testid="month-label"
					>{formatMonthLabel(summary.monthKey)}</Card.Title
				>
				<Card.Description>Month summary</Card.Description>
			</div>
			<Button variant="outline" size="icon-sm" aria-label="Next month" onclick={onNextMonth}>
				<ChevronRightIcon class="size-4" />
			</Button>
		</div>
	</Card.Header>
	<Card.Content class="space-y-5">
		<div class="grid grid-cols-3 gap-2 text-center text-sm">
			<div class="bg-muted/50 rounded-lg px-2 py-3">
				<p class="text-muted-foreground text-xs">Income</p>
				<p class="font-semibold text-emerald-600 dark:text-emerald-400" data-testid="month-income">
					{formatMinor(summary.incomeMinor, currencyLabel)}
				</p>
			</div>
			<div class="bg-muted/50 rounded-lg px-2 py-3">
				<p class="text-muted-foreground text-xs">Expense</p>
				<p class="text-destructive font-semibold" data-testid="month-expense">
					{formatMinor(summary.expenseMinor, currencyLabel)}
				</p>
			</div>
			<div class="bg-muted/50 rounded-lg px-2 py-3">
				<p class="text-muted-foreground text-xs">Net</p>
				<p class="font-semibold" data-testid="month-net">
					{formatMinor(summary.netMinor, currencyLabel)}
				</p>
			</div>
		</div>

		<CashflowChart {summary} {currencyLabel} />
		<CategoryBreakdownChart {summary} {currencyLabel} />
	</Card.Content>
</Card.Root>
