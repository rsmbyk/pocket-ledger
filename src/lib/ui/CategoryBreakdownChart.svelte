<script lang="ts">
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		title: string;
		rows: MonthSummary['expenseByCategory'];
		currencyLabel: string;
		emptyLabel: string;
		barClass?: string;
		testid: string;
	};

	let { title, rows, currencyLabel, emptyLabel, barClass = 'bg-primary/80', testid }: Props =
		$props();

	const max = $derived(Math.max(...rows.map((c) => c.amountMinor), 1));
</script>

<div class="space-y-3" data-testid={testid} aria-label={title}>
	<p class="text-sm font-medium">{title}</p>
	{#if rows.length === 0}
		<p class="text-muted-foreground text-sm">{emptyLabel}</p>
	{:else}
		<ul class="space-y-2">
			{#each rows as row (row.categoryId ?? row.label)}
				<li class="space-y-1">
					<div class="flex justify-between gap-2 text-xs">
						<span class="truncate">{row.label}</span>
						<span class="text-muted-foreground shrink-0"
							>{formatMinor(row.amountMinor, currencyLabel)}</span
						>
					</div>
					<div class="bg-muted h-2.5 overflow-hidden rounded-full">
						<div
							class={['h-full rounded-full transition-[width] duration-300', barClass]}
							style={`width: ${(row.amountMinor / max) * 100}%`}
						></div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
