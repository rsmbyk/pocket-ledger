<script lang="ts">
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import * as Table from '$lib/components/ui/table/index.js';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import { formatMinor } from '$lib/domain/money';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';

	type Props = {
		transactions: LedgerTransaction[];
		/** Total ledger rows before filters (for empty vs filtered-empty). */
		totalCount: number;
		currencyLabel: string;
		categoryName: (categoryId: string | null) => string;
		onEdit: (tx: LedgerTransaction) => void;
	};

	let { transactions, totalCount, currencyLabel, categoryName, onEdit }: Props = $props();
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
	<div class="border-border overflow-hidden rounded-lg border" data-testid="activity-list">
		<Table.Root class="text-sm">
			<Table.Header class="bg-muted/40">
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="h-9 px-3 font-medium">Date</Table.Head>
					<Table.Head class="h-9 px-3 font-medium">Category</Table.Head>
					<Table.Head class="h-9 px-3 font-medium">Note</Table.Head>
					<Table.Head class="h-9 px-3 text-right font-medium">Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each transactions as tx (tx.id)}
					{@const voided = isVoided(tx)}
					<Table.Row
						class={[
							'hover:bg-muted/50 cursor-pointer',
							voided && 'text-muted-foreground opacity-70'
						]}
						role="button"
						tabindex={0}
						onclick={() => onEdit(tx)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onEdit(tx);
							}
						}}
						data-testid={`activity-row-${tx.id}`}
					>
						<Table.Cell class="px-3 py-2 whitespace-nowrap tabular-nums">
							{formatOccurredOnDisplay(tx.occurredOn)}
						</Table.Cell>
						<Table.Cell class="px-3 py-2 font-medium">
							{categoryName(tx.categoryId)}
						</Table.Cell>
						<Table.Cell class="max-w-[14rem] truncate px-3 py-2">
							{tx.note}
						</Table.Cell>
						<Table.Cell
							class={[
								'px-3 py-2 text-right font-medium tabular-nums',
								voided && 'line-through',
								!voided &&
									(tx.type === 'expense'
										? 'text-destructive'
										: 'text-emerald-600 dark:text-emerald-400')
							]}
						>
							{tx.type === 'expense' ? '−' : '+'}{formatMinor(tx.amountMinor, currencyLabel)}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}
