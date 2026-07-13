<script lang="ts">
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		summary: MonthSummary;
		currencyLabel: string;
	};

	let { summary, currencyLabel }: Props = $props();

	const max = $derived(Math.max(...summary.expenseByCategory.map((c) => c.amountMinor), 1));
</script>

<div class="space-y-3" data-testid="category-chart" aria-label="Expense breakdown">
	<p class="text-sm font-medium">Expenses by category</p>
	{#if summary.expenseByCategory.length === 0}
		<p class="text-muted-foreground text-sm">No expenses this month.</p>
	{:else}
		<ul class="space-y-2">
			{#each summary.expenseByCategory as row (row.categoryId ?? row.label)}
				<li class="space-y-1">
					<div class="flex justify-between gap-2 text-xs">
						<span class="truncate">{row.label}</span>
						<span class="text-muted-foreground shrink-0"
							>{formatMinor(row.amountMinor, currencyLabel)}</span
						>
					</div>
					<div class="bg-muted h-2.5 overflow-hidden rounded-full">
						<div
							class="bg-primary/80 h-full rounded-full transition-[width] duration-300"
							style={`width: ${(row.amountMinor / max) * 100}%`}
						></div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
