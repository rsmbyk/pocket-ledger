<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MonthSummary } from '$lib/domain/month-summary';
	import { formatMinor } from '$lib/domain/money';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import { ADMIN_FEE_CATEGORY_ID, ADMIN_FEE_LABEL } from '$lib/domain/activity-filters';
	import { cn } from '$lib/utils.js';

	type BreakdownChartRow = MonthSummary['expenseByCategory'][number] & {
		barVar?: string;
		testid?: string;
	};

	type Props = {
		title: string;
		/** Optional icon rendered inline before the title text. */
		titleIcon?: Snippet;
		rows: BreakdownChartRow[];
		currencyLabel: string;
		emptyLabel: string;
		barClass?: string;
		/** CSS variable for Soft Brick bars (`--income` or `--destructive`). */
		barVar?: string;
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
		barVar,
		testid,
		hideAmounts = false
	}: Props = $props();

	const max = $derived(Math.max(...rows.map((c) => c.amountMinor), 1));
	let hoveredKey = $state<string | null>(null);

	function rowKey(row: BreakdownChartRow): string {
		return row.categoryId ?? '__uncategorized__';
	}

	function rowBarVar(row: BreakdownChartRow): string | undefined {
		return row.barVar ?? barVar;
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
				{@const colorVar = rowBarVar(row)}
				<li
					class={cn('space-y-1 rounded-md px-1 py-1 transition-colors', active && 'bg-muted/70')}
					onmouseenter={() => (hoveredKey = key)}
					onmouseleave={() => (hoveredKey = null)}
				>
					<div class="flex justify-between gap-2 text-xs">
						{#if row.categoryId == null}
							<UncategorizedLabel class="min-w-0" />
						{:else if row.categoryId === ADMIN_FEE_CATEGORY_ID}
							<UncategorizedLabel class="min-w-0" label={ADMIN_FEE_LABEL} />
						{:else}
							<span class="truncate">{row.label}</span>
						{/if}
						<span class="text-muted-foreground shrink-0" data-testid={row.testid}>
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
								'h-full rounded-full transition-[width,background-color] duration-300',
								!colorVar && barClass
							)}
							style={`width: ${(row.amountMinor / max) * 100}%;${
								colorVar
									? ` background-color: color-mix(in srgb, var(${colorVar}) ${active ? 100 : 50}%, var(--muted));`
									: ''
							}`}
						></div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
