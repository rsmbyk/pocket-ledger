<script lang="ts">
	import { onDestroy } from 'svelte';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import {
		activityListSections,
		initialRevealEndIndex,
		nextRevealEndIndex,
		sortTransactions,
		type ActivitySortMode
	} from '$lib/domain/activity-filters';

	type Props = {
		transactions: LedgerTransaction[];
		totalCount: number;
		currencyLabel: string;
		categoryName: (categoryId: string | null) => string;
		sortMode: ActivitySortMode;
		onEdit: (tx: LedgerTransaction) => void;
	};

	let {
		transactions,
		totalCount,
		currencyLabel,
		categoryName,
		sortMode,
		onEdit
	}: Props = $props();

	const sorted = $derived(sortTransactions(transactions, sortMode));

	let revealEnd = $state(0);
	let sentinelEl = $state<HTMLElement | null>(null);
	let observer: IntersectionObserver | null = null;

	$effect(() => {
		const list = sorted;
		const mode = sortMode;
		revealEnd = initialRevealEndIndex(list, mode);
	});

	const visible = $derived(sorted.slice(0, revealEnd));
	const sections = $derived(activityListSections(visible, sortMode));
	const hasMore = $derived(revealEnd < sorted.length);

	$effect(() => {
		const el = sentinelEl;
		const end = revealEnd;
		const list = sorted;
		const mode = sortMode;
		const more = end < list.length;
		observer?.disconnect();
		observer = null;
		if (!el || !more) return;
		observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return;
				revealEnd = nextRevealEndIndex(list, end, mode);
			},
			{ root: null, rootMargin: '120px', threshold: 0 }
		);
		observer.observe(el);
		return () => {
			observer?.disconnect();
			observer = null;
		};
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

{#if transactions.length === 0 && totalCount === 0}
	<EmptyState
		testid="activity-empty"
		title="No transactions yet"
		description="Your ledger is empty for now."
	>
		{#snippet icon()}
			<InboxIcon class="size-5" />
		{/snippet}
	</EmptyState>
{:else if transactions.length === 0}
	<EmptyState
		testid="activity-empty-filtered"
		title="No matching transactions"
		description="Try clearing filters or search."
	>
		{#snippet icon()}
			<SearchXIcon class="size-5" />
		{/snippet}
	</EmptyState>
{:else}
	<ul
		class="border-border divide-border divide-y overflow-hidden rounded-lg border"
		data-testid="activity-list"
	>
		{#each sections as section (section.kind === 'header' ? `h-${section.occurredOn}` : section.tx.id)}
			{#if section.kind === 'header'}
				<li
					class="bg-muted/40 text-muted-foreground px-3 py-1.5 text-xs font-medium"
					data-testid={`activity-date-group-${section.occurredOn}`}
				>
					{formatOccurredOnDisplay(section.occurredOn)}
				</li>
			{:else}
				<li>
					<TransactionListRow
						tx={section.tx}
						{currencyLabel}
						categoryLabel={categoryName(section.tx.categoryId)}
						uncategorized={section.tx.categoryId == null}
						secondary="note"
						testid={`activity-row-${section.tx.id}`}
						onOpen={() => onEdit(section.tx)}
					/>
				</li>
			{/if}
		{/each}
	</ul>
	{#if hasMore}
		<div
			bind:this={sentinelEl}
			class="h-4 w-full"
			data-testid="activity-reveal-sentinel"
			aria-hidden="true"
		></div>
	{/if}
{/if}
