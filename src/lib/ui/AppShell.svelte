<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import ThemeMenu from '$lib/ui/ThemeMenu.svelte';
	import type { Account } from '$lib/domain/account';
	import type { ThemePreference } from '$lib/shared/theme';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		account: Account | null;
		isSinglePot: boolean;
		themePreference: ThemePreference;
		onThemePreferenceChange: (next: ThemePreference) => void;
		ready: boolean;
		error: string | null;
	};

	let {
		account,
		isSinglePot,
		themePreference,
		onThemePreferenceChange,
		ready,
		error
	}: Props = $props();
</script>

<div class="bg-background text-foreground flex min-h-svh flex-col">
	<header
		class="border-border/80 bg-background/90 sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur"
	>
		<div class="min-w-0">
			<p class="text-muted-foreground text-xs tracking-wide uppercase">Pocket Ledger</p>
			<h1 class="truncate text-lg font-semibold">{account?.name ?? 'Loading…'}</h1>
		</div>
		<ThemeMenu preference={themePreference} onPreferenceChange={onThemePreferenceChange} />
	</header>

	<main class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-4 pb-28">
		{#if error}
			<Card.Root class="border-destructive/40">
				<Card.Header>
					<Card.Title>Something went wrong</Card.Title>
					<Card.Description>{error}</Card.Description>
				</Card.Header>
			</Card.Root>
		{:else if !ready}
			<Card.Root>
				<Card.Header>
					<Card.Title>Starting up</Card.Title>
					<Card.Description>Preparing your local ledger…</Card.Description>
				</Card.Header>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Header>
					<Card.Title>Balance</Card.Title>
					<Card.Description>
						{#if isSinglePot}
							Single-pot mode · {account?.currencyLabel}
						{:else}
							Multi-account · {account?.currencyLabel}
						{/if}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<p class="text-3xl font-semibold tracking-tight">
						{formatMinor(0, account?.currencyLabel ?? 'IDR')}
					</p>
					<p class="text-muted-foreground mt-2 text-sm">
						Scaffold shell — transactions come next.
					</p>
				</Card.Content>
			</Card.Root>

			<Tabs.Root value="home" class="w-full">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="home">Home</Tabs.Trigger>
					<Tabs.Trigger value="activity" disabled>Activity</Tabs.Trigger>
					<Tabs.Trigger value="more" disabled>More</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="home" class="mt-4">
					<p class="text-muted-foreground text-sm">
						Mobile-first home. Quick-add, charts, recurring, goals, and net worth land in later
						specs.
					</p>
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</main>

	<div class="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-4 pb-4">
		<div class="pointer-events-auto mx-auto flex max-w-lg justify-end">
			<Button size="lg" class="rounded-full shadow-lg" disabled aria-label="Add transaction (coming soon)">
				<PlusIcon class="size-5" />
				Add
			</Button>
		</div>
	</div>
</div>
