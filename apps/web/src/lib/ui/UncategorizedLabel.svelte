<script lang="ts">
	import CircleDashedIcon from '@lucide/svelte/icons/circle-dashed';
	import { cn } from '$lib/utils.js';

	type Props = {
		/** When true, this is a system bucket (Uncategorized / Admin Fee). */
		system?: boolean;
		label?: string;
		class?: string;
		/** Override default system test id. */
		testid?: string;
		showIcon?: boolean;
	};

	let {
		system = true,
		label = 'Uncategorized',
		class: className = '',
		testid,
		showIcon = true
	}: Props = $props();

	const systemTestId = $derived(
		testid ?? (label === 'Admin Fee' ? 'admin-fee-system' : 'uncategorized-system')
	);
</script>

<span
	class={cn('inline-flex max-w-full items-center gap-1.5', className)}
	data-testid={system ? systemTestId : undefined}
>
	{#if system && showIcon}
		<CircleDashedIcon class="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
	{/if}
	<span class="truncate">{label}</span>
</span>
