<script lang="ts">
	import { budgetBarFillCss, budgetBarWidthPercent } from '$lib/domain/budgets';
	import { formatMinor } from '$lib/domain/money';
	import { cn } from '$lib/utils.js';

	type Props = {
		usedMinor: number;
		limitMinor: number;
		percent: number;
		currencyLabel: string;
		hideAmounts?: boolean;
		class?: string;
	};

	let {
		usedMinor,
		limitMinor,
		percent,
		currencyLabel,
		hideAmounts = false,
		class: className = ''
	}: Props = $props();

	function money(amount: number): string {
		return hideAmounts ? '••••' : formatMinor(amount, currencyLabel);
	}

	const width = $derived(budgetBarWidthPercent(percent));
</script>

<div class={cn('space-y-1', className)} data-testid="budget-progress">
	<p class="text-muted-foreground text-xs tabular-nums" data-testid="budget-progress-amounts">
		{money(usedMinor)} / {money(limitMinor)}
	</p>
	<p class="text-muted-foreground text-right text-xs tabular-nums" data-testid="budget-progress-percent">
		{percent}%
	</p>
	<div class="bg-muted h-1.5 overflow-hidden rounded-full" data-testid="budget-progress-bar">
		<div
			class="h-full rounded-full"
			style={`width: ${width}%; background-color: ${budgetBarFillCss(percent)}`}
		></div>
	</div>
</div>
