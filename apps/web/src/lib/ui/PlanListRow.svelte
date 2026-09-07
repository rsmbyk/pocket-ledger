<script lang="ts">
	import RepeatIcon from '@lucide/svelte/icons/repeat';
	import TransactionListRow from '$lib/ui/TransactionListRow.svelte';
	import {
		planAsListTransaction,
		repeatChipLabel,
		type LedgerPlan
	} from '$lib/domain/plan';
	import type { Account } from '$lib/domain/account';
	import type { CategoryRow } from '$lib/data/db';
	import { STOCK_ADMIN_FEE_ICON, STOCK_CUSTOM_ICON, STOCK_UNCATEGORIZED_ICON } from '$lib/domain/default-category-catalog';
	import { ADMIN_FEE_CATEGORY_ID, ADMIN_FEE_LABEL } from '$lib/domain/activity-filters';

	type Props = {
		plan: LedgerPlan;
		currencyLabel: string;
		categoriesById: Record<string, CategoryRow>;
		pockets: Account[];
		hideAmount?: boolean;
		testid: string;
		onOpen: () => void;
	};

	let {
		plan,
		currencyLabel,
		categoriesById,
		pockets,
		hideAmount = false,
		testid,
		onOpen
	}: Props = $props();

	const tx = $derived(planAsListTransaction(plan));
	const chip = $derived(repeatChipLabel(plan.frequency));
	const title = $derived(plan.description.trim());
	const pocketsById = $derived(
		Object.fromEntries(pockets.map((p) => [p.id, { name: p.name, isMain: p.isMain }]))
	);

	function categoryName(categoryId: string | null): string {
		if (!categoryId) return 'Uncategorized';
		if (categoryId === ADMIN_FEE_CATEGORY_ID) return ADMIN_FEE_LABEL;
		return categoriesById[categoryId]?.name ?? 'Category';
	}

	function categoryIconSlug(): string {
		if (tx.categoryId == null) return STOCK_UNCATEGORIZED_ICON;
		if (tx.categoryId === ADMIN_FEE_CATEGORY_ID) return STOCK_ADMIN_FEE_ICON;
		return categoriesById[tx.categoryId]?.icon || STOCK_CUSTOM_ICON;
	}
</script>

<TransactionListRow
	{tx}
	{currencyLabel}
	categoryLabel={categoryName(tx.categoryId)}
	categoryIconSlug={categoryIconSlug()}
	uncategorized={tx.categoryId == null}
	{hideAmount}
	secondary="date"
	{pocketsById}
	showPocket
	{testid}
	{onOpen}
>
	{#snippet header()}
		{#if title || chip}
			<div class="flex min-w-0 flex-col items-start gap-1" data-testid={`${testid}-header`}>
				{#if title}
					<p class="truncate text-sm font-semibold" data-testid={`${testid}-description`}>
						{title}
					</p>
				{/if}
				{#if chip}
					<span
						class="bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
						data-testid={`${testid}-repeat`}
					>
						<RepeatIcon class="size-3" aria-hidden="true" />
						{chip}
					</span>
				{/if}
			</div>
		{/if}
	{/snippet}
</TransactionListRow>
