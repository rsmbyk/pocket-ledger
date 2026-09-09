<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { AppRoute } from '$lib/shared/router';

	type Props = {
		route: AppRoute;
		pocketDetails?: boolean;
	};

	let { route, pocketDetails = false }: Props = $props();

	const variant = $derived(pocketDetails ? 'pocket-details' : route);
</script>

{#snippet rowPulse()}
	<div class="flex items-center gap-3 px-2 py-2.5" data-testid="shell-skeleton-row">
		<Skeleton class="size-8 shrink-0 rounded-full" />
		<div class="min-w-0 flex-1 space-y-1.5">
			<Skeleton class="h-3.5 w-2/3" />
			<Skeleton class="h-3 w-1/3" />
		</div>
		<Skeleton class="h-4 w-16 shrink-0" />
	</div>
{/snippet}

{#snippet listCard(rows: number)}
	<Card.Root class="gap-0 py-0">
		<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
			<Skeleton class="h-4 w-24" />
			<Skeleton class="h-8 w-20" />
		</Card.Header>
		<Card.Content class="px-2 pb-2">
			<div class="divide-border divide-y">
				{#each Array.from({ length: rows }) as _, i (i)}
					{@render rowPulse()}
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
{/snippet}

{#snippet balanceHero()}
	<section
		class="border-border/80 bg-card flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-[var(--elev-card)]"
	>
		<Skeleton class="h-3.5 w-20" />
		<Skeleton class="h-8 w-40 md:h-9" />
	</section>
{/snippet}

{#snippet monthCard()}
	<Card.Root class="gap-0 py-0">
		<Card.Header class="flex items-center px-4 py-3">
			<div class="flex w-full items-center justify-between gap-2">
				<Skeleton class="size-8 rounded-md" />
				<div class="flex flex-col items-center gap-1">
					<Skeleton class="h-4 w-24" />
					<Skeleton class="h-3 w-16" />
				</div>
				<Skeleton class="size-8 rounded-md" />
			</div>
		</Card.Header>
		<Card.Content class="space-y-3 p-4 pt-0">
			<div class="grid grid-cols-3 gap-2">
				<Skeleton class="h-14 rounded-md" />
				<Skeleton class="h-14 rounded-md" />
				<Skeleton class="h-14 rounded-md" />
			</div>
			<Skeleton class="h-24 w-full" />
			<Skeleton class="h-24 w-full" />
			<div class="space-y-2">
				<Skeleton class="h-3.5 w-full" />
				<Skeleton class="h-3.5 w-full" />
				<Skeleton class="h-3.5 w-full" />
			</div>
		</Card.Content>
	</Card.Root>
{/snippet}

{#snippet listChrome()}
	<div class="flex flex-col gap-3">
		<div class="flex items-center gap-2">
			<Skeleton class="h-9 min-w-0 flex-1" />
			<Skeleton class="size-9 shrink-0 rounded-md" />
		</div>
		<div class="flex justify-end">
			<Skeleton class="h-8 w-32" />
		</div>
	</div>
{/snippet}

{#snippet filterCard()}
	<Card.Root class="hidden w-72 shrink-0 flex-col gap-0 py-0 xl:flex">
		<Card.Header
			class="border-border flex flex-row items-center justify-between gap-2 space-y-0 border-b px-4 py-3"
		>
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-8 w-16" />
		</Card.Header>
		<Card.Content class="grid gap-3 px-4 py-4">
			<Skeleton class="h-9 w-full" />
			<Skeleton class="h-9 w-full" />
			<Skeleton class="h-9 w-full" />
		</Card.Content>
		<Card.Footer class="border-border border-t px-4 py-3">
			<Skeleton class="h-9 w-full" />
		</Card.Footer>
	</Card.Root>
{/snippet}

{#snippet listRoute()}
	<div class="min-h-0 space-y-3 xl:flex xl:flex-1 xl:items-start xl:gap-4 xl:space-y-0">
		<div class="space-y-3 xl:flex xl:min-h-0 xl:min-w-0 xl:flex-1 xl:flex-col">
			{@render listChrome()}
			<div class="divide-border divide-y">
				{#each Array.from({ length: 8 }) as _, i (i)}
					{@render rowPulse()}
				{/each}
			</div>
		</div>
		{@render filterCard()}
	</div>
{/snippet}

{#snippet homeSkeleton()}
	<div class="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
		<div class="flex min-h-0 min-w-0 flex-col gap-4 xl:flex-1 xl:overflow-y-auto xl:p-3">
			{@render balanceHero()}
			{@render monthCard()}
		</div>
		<div class="flex min-h-0 min-w-0 flex-col gap-4 xl:flex-1 xl:overflow-y-auto xl:p-3">
			{@render listCard(5)}
		</div>
	</div>
{/snippet}

{#snippet pocketsSkeleton()}
	<div class="space-y-3">
		<div class="flex justify-end">
			<Skeleton class="h-8 w-28" />
		</div>
		{#each Array.from({ length: 4 }) as _, i (i)}
			<Card.Root class="gap-0 overflow-hidden py-0">
				<div class="flex items-stretch gap-2 px-4 py-3">
					<Skeleton class="w-6 self-stretch rounded-sm" />
					<div class="min-w-0 flex-1 space-y-1.5">
						<Skeleton class="h-4 w-28" />
						<Skeleton class="h-3 w-40" />
					</div>
					<Skeleton class="h-4 w-16 shrink-0" />
				</div>
			</Card.Root>
		{/each}
	</div>
{/snippet}

{#snippet identityCol()}
	<div class="flex flex-col gap-4">
		{@render balanceHero()}
		<Card.Root class="gap-0 py-0">
			<Card.Content class="space-y-2 px-4 py-3">
				<Skeleton class="h-3.5 w-28" />
				<Skeleton class="h-5 w-24" />
			</Card.Content>
		</Card.Root>
	</div>
{/snippet}

{#snippet activityCol()}
	<div class="flex flex-col gap-4">
		{@render monthCard()}
		{@render listCard(5)}
	</div>
{/snippet}

{#snippet listsCol()}
	<div class="flex flex-col gap-4">
		{@render listCard(3)}
		{@render listCard(3)}
	</div>
{/snippet}

{#snippet pocketDetailsSkeleton()}
	<div class="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
		<div class="min-h-0 min-w-0 xl:flex-1 xl:overflow-y-auto xl:p-3">{@render identityCol()}</div>
		<div class="min-h-0 min-w-0 xl:flex-1 xl:overflow-y-auto xl:p-3">{@render activityCol()}</div>
		<div class="min-h-0 min-w-0 xl:flex-1 xl:overflow-y-auto xl:p-3">{@render listsCol()}</div>
	</div>
{/snippet}

{#snippet categoriesSkeleton()}
	<div class="flex min-h-0 flex-1 flex-col">
		<div class="flex shrink-0 flex-col gap-3 border-b px-7 py-3 md:px-9">
			<Skeleton class="mx-auto h-9 w-full max-w-sm" />
			<Skeleton class="h-9 w-full" />
			<div class="flex justify-end gap-2">
				<Skeleton class="h-8 w-20" />
				<Skeleton class="h-8 w-20" />
			</div>
		</div>
		<div class="space-y-4 p-4">
			{#each Array.from({ length: 2 }) as _, g (g)}
				<div class="space-y-2">
					<Skeleton class="h-4 w-32" />
					<div class="flex flex-wrap gap-2">
						<Skeleton class="h-8 w-20 rounded-full" />
						<Skeleton class="h-8 w-24 rounded-full" />
						<Skeleton class="h-8 w-16 rounded-full" />
						<Skeleton class="h-8 w-28 rounded-full" />
					</div>
				</div>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet settingsSkeleton()}
	<div class="space-y-4">
		{#each Array.from({ length: 5 }) as _, i (i)}
			<Card.Root class="p-6">
				<div class="space-y-3">
					<Skeleton class="h-4 w-32" />
					<Skeleton class="h-3 w-full" />
					<Skeleton class="h-9 w-full" />
				</div>
			</Card.Root>
		{/each}
	</div>
{/snippet}

<div
	class={[
		'mx-auto flex w-full flex-1 flex-col gap-4 p-4 pb-8 md:gap-4 md:p-6 md:pb-8 max-w-3xl',
		(variant === 'categories' ||
			variant === 'transactions' ||
			variant === 'plans' ||
			variant === 'home' ||
			variant === 'pocket-details') &&
			'xl:max-w-none! xl:min-h-0 xl:flex-1 xl:overflow-hidden',
		variant === 'categories' && 'px-0! pt-0! pb-0! md:px-0! md:pt-0! md:pb-0!'
	]}
	data-testid="shell-stage-skeleton"
	data-skeleton={variant}
	role="status"
	aria-busy="true"
	aria-label="Loading"
>
	{#if variant === 'home'}
		<div data-testid="shell-skeleton-home">{@render homeSkeleton()}</div>
	{:else if variant === 'transactions'}
		<div data-testid="shell-skeleton-transactions">{@render listRoute()}</div>
	{:else if variant === 'plans'}
		<div data-testid="shell-skeleton-plans">{@render listRoute()}</div>
	{:else if variant === 'pocket-details'}
		<div data-testid="shell-skeleton-pocket-details">{@render pocketDetailsSkeleton()}</div>
	{:else if variant === 'pockets'}
		<div data-testid="shell-skeleton-pockets">{@render pocketsSkeleton()}</div>
	{:else if variant === 'categories'}
		<div data-testid="shell-skeleton-categories" class="flex min-h-0 flex-1 flex-col">
			{@render categoriesSkeleton()}
		</div>
	{:else}
		<div data-testid="shell-skeleton-settings">{@render settingsSkeleton()}</div>
	{/if}
</div>
