<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import { cn } from '$lib/utils.js';

	type Props = {
		title: string;
		/** Optional icon rendered inline before the title text. */
		titleIcon?: Snippet;
		rows: MonthSummary['expenseByCategory'];
		currencyLabel: string;
		emptyLabel: string;
		barClass?: string;
		testid: string;
		hideAmounts?: boolean;
	};

	let {
		title,
		titleIcon,
		rows,
		currencyLabel,
		emptyLabel,
		barClass = 'bg-primary/80',
		testid,
		hideAmounts = false
	}: Props = $props();

	const max = $derived(Math.max(...rows.map((c) => c.amountMinor), 1));
	let hoveredKey = $state<string | null>(null);

	function rowKey(row: MonthSummary['expenseByCategory'][number]): string {
		return row.categoryId ?? '__uncategorized__';
	}
</script>

<div class="space-y-3" data-testid={testid} aria-label={title}>
	<p class="inline-flex items-center gap-1.5 text-sm font-medium">
		{#if titleIcon}
			{@render titleIcon()}
		{/if}
		{title}
	</p>
	{#if rows.length === 0}
		<p class="text-muted-foreground text-sm">{emptyLabel}</p>
	{:else}
		<ul class="space-y-2">
			{#each rows as row (rowKey(row))}
				{@const key = rowKey(row)}
				{@const active = hoveredKey === key}
				<li
					class={cn(
						'space-y-1 rounded-md px-1 py-1 transition-colors',
						active && 'bg-muted/70'
					)}
					onmouseenter={() => (hoveredKey = key)}
					onmouseleave={() => (hoveredKey = null)}
				>
					<div class="flex justify-between gap-2 text-xs">
						{#if row.categoryId == null}
							<UncategorizedLabel class="min-w-0" />
						{:else}
							<span class="truncate">{row.label}</span>
						{/if}
						<span class="text-muted-foreground shrink-0">
							{#if hideAmounts}
								••••
							{:else}
								{formatMinor(row.amountMinor, currencyLabel)}
							{/if}
						</span>
					</div>
					<div class="bg-muted h-2.5 overflow-hidden rounded-full">
						<div
							class={cn(
								'h-full rounded-full transition-[width,opacity] duration-300',
								barClass,
								active && 'opacity-100 ring-2 ring-ring/40 ring-offset-1',
								!active && hoveredKey && 'opacity-50'
							)}
							style={`width: ${(row.amountMinor / max) * 100}%`}
						></div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
