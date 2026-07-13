<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { ThemePreference } from '$lib/shared/theme';
	import { mode, setMode } from 'mode-watcher';

	type Props = {
		preference: ThemePreference;
		onPreferenceChange: (next: ThemePreference) => void;
	};

	let { preference, onPreferenceChange }: Props = $props();

	function choose(next: ThemePreference) {
		setMode(next);
		onPreferenceChange(next);
	}

	const label = $derived(
		preference === 'dark' ? 'Dark' : preference === 'light' ? 'Light' : 'System'
	);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" aria-label="Theme: {label}" {...props}>
				{#if preference === 'dark' || (preference === 'system' && mode.current === 'dark')}
					<MoonIcon class="size-4" />
				{:else if preference === 'light' || (preference === 'system' && mode.current === 'light')}
					<SunIcon class="size-4" />
				{:else}
					<MonitorIcon class="size-4" />
				{/if}
				<span class="ml-1.5 hidden sm:inline">{label}</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="min-w-40">
		<DropdownMenu.Item onSelect={() => choose('system')}>
			<MonitorIcon class="size-4" />
			System
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={() => choose('light')}>
			<SunIcon class="size-4" />
			Light
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={() => choose('dark')}>
			<MoonIcon class="size-4" />
			Dark
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
