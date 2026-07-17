<script lang="ts">
	import CircleDashedIcon from '@lucide/svelte/icons/circle-dashed';
	import { cn } from '$lib/utils.js';

	type Props = {
		/** When true, this is system Uncategorized (`categoryId == null`). */
		system?: boolean;
		label?: string;
		class?: string;
	};

	let {
		system = true,
		label = 'Uncategorized',
		class: className = ''
	}: Props = $props();
</script>

<span
	class={cn('inline-flex max-w-full items-center gap-1.5', className)}
	data-testid={system ? 'uncategorized-system' : undefined}
>
	{#if system}
		<CircleDashedIcon class="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
	{/if}
	<span class="truncate">{label}</span>
</span>
