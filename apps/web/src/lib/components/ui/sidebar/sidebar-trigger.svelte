<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import PanelLeftCloseIcon from '@lucide/svelte/icons/panel-left-close';
	import { cn } from "$lib/utils.js";
	import { crossfade } from 'svelte/transition';
	import type { ComponentProps } from "svelte";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();
	const menuOpen = $derived(sidebar.isMobile ? sidebar.openMobile : sidebar.open);
	const menuLabel = $derived(menuOpen ? 'Close menu' : 'Open menu');
	const [send, receive] = crossfade({ duration: 250 });
</script>

<Button
	bind:ref
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon-sm"
	class={cn("cn-sidebar-trigger", className)}
	type="button"
	aria-label={menuLabel}
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	{...restProps}
>
	<span class="relative inline-flex size-4 items-center justify-center">
		{#if menuOpen}
			<span
				class="absolute inset-0 inline-flex items-center justify-center"
				in:receive={{ key: 'sidebar-panel-icon' }}
				out:send={{ key: 'sidebar-panel-icon' }}
			>
				<PanelLeftCloseIcon class="size-4" />
			</span>
		{:else}
			<span
				class="absolute inset-0 inline-flex items-center justify-center"
				in:receive={{ key: 'sidebar-panel-icon' }}
				out:send={{ key: 'sidebar-panel-icon' }}
			>
				<PanelLeftIcon class="size-4" />
			</span>
		{/if}
	</span>
	<span class="sr-only">{menuLabel}</span>
</Button>
