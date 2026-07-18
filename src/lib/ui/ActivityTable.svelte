<script lang="ts">
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import {
		sortTransactions,
		type ActivitySortMode,
		type CategorySortMeta
	} from '$lib/domain/activity-filters';

	type Props = {
		transactions: LedgerTransaction[];
		totalCount: number;
		currencyLabel: string;
		categoryName: (categoryId: string | null) => string;
		sortMode: ActivitySortMode;
		categoryMeta: CategorySortMeta[];
		onEdit: (tx: LedgerTransaction) => void;
	};

	let {
		transactions,
		totalCount,
		currencyLabel,
		categoryName,
		sortMode,
		categoryMeta,
		onEdit
	}: Props = $props();

	const sorted = $derived(sortTransactions(transactions, sortMode, categoryMeta));
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
		{#each sorted as tx (tx.id)}
			<li>
				<TransactionListRow
					{tx}
					{currencyLabel}
					categoryLabel={categoryName(tx.categoryId)}
					uncategorized={tx.categoryId == null}
					testid={`activity-row-${tx.id}`}
					onOpen={() => onEdit(tx)}
				/>
			</li>
		{/each}
	</ul>
{/if}
