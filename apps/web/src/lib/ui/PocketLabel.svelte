<script lang="ts">
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import { cn } from '$lib/utils.js';

	type Props = {
		name: string;
		isMain: boolean;
		class?: string;
		/** Optical-align name to the Main icon (list row + pickers). */
		optical?: boolean;
		/** Optional testid for the Main icon; leave unset when it could duplicate in the DOM. */
		iconTestid?: string;
	};

	let { name, isMain, class: className = '', optical = false, iconTestid }: Props = $props();
</script>

<span class={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
	{#if isMain}
		<LandmarkIcon class="size-3.5 shrink-0" aria-hidden="true" data-testid={iconTestid} />
	{/if}
	<span class={cn('truncate', optical && 'leading-none translate-y-px')}>{name}</span>
</span>
