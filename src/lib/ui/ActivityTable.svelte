<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import { formatMinor } from '$lib/domain/money';

	type Props = {
		transactions: LedgerTransaction[];
		currencyLabel: string;
		categoryName: (categoryId: string | null) => string;
		onEdit: (tx: LedgerTransaction) => void;
		onAdd: () => void;
	};

	let { transactions, currencyLabel, categoryName, onEdit, onAdd }: Props = $props();
</script>

{#if transactions.length === 0}
	<div class="space-y-3" data-testid="activity-empty">
		<p class="text-muted-foreground text-sm">No transactions yet.</p>
		<Button type="button" variant="outline" size="sm" onclick={onAdd} data-testid="activity-empty-add">
			Add your first one
		</Button>
	</div>
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
							{tx.occurredOn}
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
