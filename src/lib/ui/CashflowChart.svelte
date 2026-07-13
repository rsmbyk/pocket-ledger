<script lang="ts">
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		summary: MonthSummary;
		currencyLabel: string;
	};

	let { summary, currencyLabel }: Props = $props();

	const max = $derived(Math.max(summary.incomeMinor, summary.expenseMinor, 1));
	const incomePct = $derived((summary.incomeMinor / max) * 100);
	const expensePct = $derived((summary.expenseMinor / max) * 100);
</script>

<div class="space-y-3" data-testid="cashflow-chart" aria-label="Cashflow chart">
	<p class="text-sm font-medium">Cashflow</p>
	<div class="space-y-2">
		<div class="space-y-1">
			<div class="text-muted-foreground flex justify-between text-xs">
				<span>Income</span>
				<span>{formatMinor(summary.incomeMinor, currencyLabel)}</span>
			</div>
			<div class="bg-muted h-3 overflow-hidden rounded-full">
				<div
					class="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
					style={`width: ${incomePct}%`}
				></div>
			</div>
		</div>
		<div class="space-y-1">
			<div class="text-muted-foreground flex justify-between text-xs">
				<span>Expense</span>
				<span>{formatMinor(summary.expenseMinor, currencyLabel)}</span>
			</div>
			<div class="bg-muted h-3 overflow-hidden rounded-full">
				<div
					class="bg-destructive h-full rounded-full transition-[width] duration-300"
					style={`width: ${expensePct}%`}
				></div>
			</div>
		</div>
	</div>
</div>
