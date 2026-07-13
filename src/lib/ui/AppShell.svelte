<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import ThemeMenu from '$lib/ui/ThemeMenu.svelte';
	import QuickAddSheet from '$lib/ui/QuickAddSheet.svelte';
	import type { Account } from '$lib/domain/account';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { ThemePreference } from '$lib/shared/theme';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		account: Account | null;
		isSinglePot: boolean;
		balanceMinor: number;
		transactions: LedgerTransaction[];
		categoriesById: Record<string, CategoryRow>;
		themePreference: ThemePreference;
		onThemePreferenceChange: (next: ThemePreference) => void;
		onRefreshLedger: () => void | Promise<void>;
		ready: boolean;
		error: string | null;
	};

	let {
		account,
		isSinglePot,
		balanceMinor,
		transactions,
		categoriesById,
		themePreference,
		onThemePreferenceChange,
		onRefreshLedger,
		ready,
		error
	}: Props = $props();

	let addOpen = $state(false);
	let tab = $state('home');

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		return categoriesById[categoryId]?.name ?? 'Category';
	}
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
					<p class="text-3xl font-semibold tracking-tight" data-testid="account-balance">
						{formatMinor(balanceMinor, account?.currencyLabel ?? 'IDR')}
					</p>
				</Card.Content>
			</Card.Root>

			<Tabs.Root bind:value={tab} class="w-full">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="home">Home</Tabs.Trigger>
					<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
					<Tabs.Trigger value="more" disabled>More</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="home" class="mt-4 space-y-3">
					<p class="text-muted-foreground text-sm">
						Tap Add to log income or spending. Charts and budgets come later.
					</p>
					{#if transactions[0]}
						<Card.Root>
							<Card.Header class="pb-2">
								<Card.Title class="text-base">Latest</Card.Title>
							</Card.Header>
							<Card.Content class="text-sm">
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class="font-medium">{categoryName(transactions[0].categoryId)}</p>
										<p class="text-muted-foreground truncate">
											{transactions[0].note || transactions[0].type}
											· {transactions[0].occurredOn}
										</p>
									</div>
									<p
										class={transactions[0].type === 'expense'
											? 'text-destructive font-medium'
											: 'font-medium text-emerald-600 dark:text-emerald-400'}
									>
										{transactions[0].type === 'expense' ? '−' : '+'}
										{formatMinor(transactions[0].amountMinor, account?.currencyLabel ?? 'IDR')}
									</p>
								</div>
							</Card.Content>
						</Card.Root>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="activity" class="mt-4">
					{#if transactions.length === 0}
						<p class="text-muted-foreground text-sm">No transactions yet. Add your first one.</p>
					{:else}
						<ul class="divide-border border-border divide-y rounded-lg border" data-testid="activity-list">
							{#each transactions as tx (tx.id)}
								<li class="flex items-start justify-between gap-3 px-3 py-3 text-sm">
									<div class="min-w-0">
										<p class="font-medium">{categoryName(tx.categoryId)}</p>
										<p class="text-muted-foreground truncate">
											{tx.note || tx.type} · {tx.occurredOn}
										</p>
									</div>
									<p
										class={tx.type === 'expense'
											? 'text-destructive shrink-0 font-medium'
											: 'shrink-0 font-medium text-emerald-600 dark:text-emerald-400'}
									>
										{tx.type === 'expense' ? '−' : '+'}
										{formatMinor(tx.amountMinor, account?.currencyLabel ?? 'IDR')}
									</p>
								</li>
							{/each}
						</ul>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</main>

	<div class="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-4 pb-4">
		<div class="pointer-events-auto mx-auto flex max-w-lg justify-end">
			<Button
				size="lg"
				class="rounded-full shadow-lg"
				disabled={!ready || !account}
				aria-label="Add transaction"
				onclick={() => (addOpen = true)}
			>
				<PlusIcon class="size-5" />
				Add
			</Button>
		</div>
	</div>
</div>

{#if account && addOpen}
	<QuickAddSheet
		open={true}
		accountId={account.id}
		currencyLabel={account.currencyLabel}
		onOpenChange={(next) => {
			if (!next) addOpen = false;
		}}
		onSaved={onRefreshLedger}
	/>
{/if}
