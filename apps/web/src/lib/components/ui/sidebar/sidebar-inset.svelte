<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<main
	bind:this={ref}
	data-slot="sidebar-inset"
	class={cn(
		'bg-background sm:peer-data-[variant=inset]:m-2 sm:peer-data-[variant=inset]:ml-0 sm:peer-data-[variant=inset]:rounded-xl sm:peer-data-[variant=inset]:shadow-sm sm:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 relative flex w-full flex-1 flex-col',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</main>
