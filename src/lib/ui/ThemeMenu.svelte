<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ThemePreference } from '$lib/shared/theme';
	import { setMode } from 'mode-watcher';

	type Props = {
		preference: ThemePreference;
		onPreferenceChange: (next: ThemePreference) => void;
	};

	let { preference, onPreferenceChange }: Props = $props();

	const order: ThemePreference[] = ['light', 'system', 'dark'];

	const label = $derived(
		preference === 'dark' ? 'Dark' : preference === 'light' ? 'Light' : 'System'
	);

	function cycle() {
		const i = order.indexOf(preference);
		const next = order[(i + 1) % order.length]!;
		setMode(next);
		onPreferenceChange(next);
	}
</script>

<Button
	type="button"
	variant="ghost"
	size="icon-sm"
	aria-label="Theme: {label}"
	data-testid="theme-cycle"
	onclick={cycle}
>
	{#if preference === 'dark'}
		<MoonIcon class="size-4" />
	{:else if preference === 'light'}
		<SunIcon class="size-4" />
	{:else}
		<MonitorIcon class="size-4" />
	{/if}
</Button>
