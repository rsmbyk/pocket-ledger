<script lang="ts">
	import { goalBarFillCss } from '$lib/domain/goals';
	import { formatRemainingUnit, largestRemainingUnit } from '$lib/domain/goal-time';
	import { formatMinor } from '$lib/domain/money';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import { todayOccurredOn } from '$lib/domain/transaction-rules';
	import { cn } from '$lib/utils.js';

	type Props = {
		currentMinor: number;
		targetMinor: number;
		percent: number;
		targetOn: string | null;
		currencyLabel: string;
		hideAmounts?: boolean;
		class?: string;
	};

	let {
		currentMinor,
		targetMinor,
		percent,
		targetOn,
		currencyLabel,
		hideAmounts = false,
		class: className = ''
	}: Props = $props();

	const remaining = $derived(
		targetOn ? largestRemainingUnit(todayOccurredOn(), targetOn) : null
	);

	function money(amount: number): string {
		return hideAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}
</script>

<div class={cn('space-y-1', className)} data-testid="goal-progress">
	<p class="text-muted-foreground text-xs tabular-nums" data-testid="goal-progress-amounts">
		{money(Math.max(0, currentMinor))} / {money(targetMinor)}
	</p>
	{#if remaining && targetOn}
		<p class="text-muted-foreground text-xs" data-testid="goal-progress-date">
			{formatOccurredOnDisplay(targetOn)} ({formatRemainingUnit(remaining)})
		</p>
	{/if}
	<p class="text-muted-foreground text-right text-xs tabular-nums" data-testid="goal-progress-percent">
		{percent}%
	</p>
	<div class="bg-muted h-1.5 overflow-hidden rounded-full" data-testid="goal-progress-bar">
		<div
			class="h-full rounded-full"
			style={`width: ${percent}%; background-color: ${goalBarFillCss(percent)}`}
		></div>
	</div>
</div>
