<script lang="ts">
	import { onMount } from 'svelte';
	import { ModeWatcher, mode, setMode, userPrefersMode } from 'mode-watcher';
	import AppShell from '$lib/ui/AppShell.svelte';
	import { getAccountsOverview } from '$lib/application/accounts';
	import type { Account } from '$lib/domain/account';
	import {
		parseThemePreference,
		THEME_STORAGE_KEY,
		type ThemePreference
	} from '$lib/shared/theme';

	let account = $state<Account | null>(null);
	let isSinglePot = $state(true);
	let ready = $state(false);
	let error = $state<string | null>(null);
	let themePreference = $state<ThemePreference>('system');

	onMount(() => {
		themePreference = parseThemePreference(userPrefersMode.current);

		void (async () => {
			try {
				const overview = await getAccountsOverview();
				account = overview.accounts[0] ?? null;
				isSinglePot = overview.isSinglePot;
				ready = true;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to open local database';
				ready = true;
			}
		})();
	});

	function onThemePreferenceChange(next: ThemePreference) {
		themePreference = next;
		setMode(next);
	}

	// Keep local preference label synced if mode-watcher changes elsewhere.
	$effect(() => {
		themePreference = parseThemePreference(userPrefersMode.current);
		void mode.current;
	});
</script>

<ModeWatcher
	defaultMode="system"
	modeStorageKey={THEME_STORAGE_KEY}
	themeColors={{ dark: '#0a0a0a', light: '#ffffff' }}
/>

<AppShell
	{account}
	{isSinglePot}
	{themePreference}
	{onThemePreferenceChange}
	{ready}
	{error}
/>
