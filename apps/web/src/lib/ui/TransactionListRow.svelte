<script lang="ts">
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import CategoryIcon from '$lib/ui/CategoryIcon.svelte';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import { formatMinor } from '$lib/domain/money';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import { STOCK_UNCATEGORIZED_ICON } from '$lib/domain/default-category-catalog';

	type PocketInfo = { name: string; isMain: boolean };

	type Props = {
		tx: LedgerTransaction;
		currencyLabel: string;
		categoryLabel: string;
		/** Catalog icon slug for the category secondary/primary line (136). */
		categoryIconSlug?: string;
		/** When true, show UncategorizedLabel instead of categoryLabel text. */
		uncategorized?: boolean;
		hideAmount?: boolean;
		/**
		 * `date` — Home Recent (076): category primary, note then date.
		 * `category` — Transactions (136): note primary, category+icon secondary.
		 * `none` — no secondary line at all (tighter single-line row).
		 */
		secondary?: 'date' | 'category' | 'none';
		/** Pocket id → display info; required with `showPocket` to resolve names. */
		pocketsById?: Record<string, PocketInfo>;
		/** Show the pocket (or transfer source → dest) under the amount (096 / 099). */
		showPocket?: boolean;
		testid: string;
		onOpen: () => void;
	};

	let {
		tx,
		currencyLabel,
		categoryLabel,
		categoryIconSlug = STOCK_UNCATEGORIZED_ICON,
		uncategorized = false,
		hideAmount = false,
		secondary = 'date',
		pocketsById,
		showPocket = false,
		testid,
		onOpen
	}: Props = $props();

	const UNKNOWN_POCKET: PocketInfo = { name: 'Unknown', isMain: false };

	const voided = $derived(isVoided(tx));
	const note = $derived(tx.note?.trim() ?? '');
	const dateLabel = $derived(formatOccurredOnDisplay(tx.occurredOn));
	const isTransfer = $derived(tx.type === 'transfer');

	const hasCategorySecondary = $derived(secondary === 'category' && Boolean(note));
	const hasSecondaryLine = $derived(
		(secondary === 'date' && true) ||
			(secondary === 'category' && (hasCategorySecondary || showPocket)) ||
			(secondary === 'none' && showPocket)
	);

	const amountText = $derived(
		isTransfer
			? formatMinor(tx.amountMinor, currencyLabel)
			: formatMinor(tx.type === 'expense' ? -tx.amountMinor : tx.amountMinor, currencyLabel)
	);
	const feeMinor = $derived(tx.feeMinor ?? 0);
	const showFee = $derived(isTransfer && feeMinor > 0);
	const feeText = $derived(`Fee ${formatMinor(feeMinor, currencyLabel)}`);

	function pocketInfo(id: string | null): PocketInfo {
		if (!id) return UNKNOWN_POCKET;
		return pocketsById?.[id] ?? UNKNOWN_POCKET;
	}

	const sourcePocket = $derived(pocketInfo(tx.accountId));
	const destPocket = $derived(pocketInfo(tx.counterAccountId));
	const ownPocket = $derived(pocketInfo(tx.accountId));
</script>

{#snippet pocketChrome()}
	{#if isTransfer}
		<div
			class="text-muted-foreground flex min-w-0 items-center gap-1 text-xs"
			data-testid={`${testid}-pocket`}
		>
			<PocketLabel name={sourcePocket.name} isMain={sourcePocket.isMain} optical />
			<ArrowRightIcon class="size-3 shrink-0" aria-hidden="true" />
			<PocketLabel name={destPocket.name} isMain={destPocket.isMain} optical />
		</div>
	{:else}
		<div class="min-w-0" data-testid={`${testid}-pocket`}>
			<PocketLabel
				name={ownPocket.name}
				isMain={ownPocket.isMain}
				optical
				class="text-muted-foreground text-xs"
			/>
		</div>
	{/if}
{/snippet}

{#snippet transferTitle()}
	<span class="inline-flex items-center gap-1.5">
		<ArrowLeftRightIcon
			class="text-muted-foreground size-3 shrink-0"
			aria-hidden="true"
			data-testid={`${testid}-transfer-icon`}
		/>
		Transfer
	</span>
{/snippet}

{#snippet categoryTitle()}
	{#if uncategorized}
		<span class="inline-flex min-w-0 items-center gap-1.5">
			<CategoryIcon slug={STOCK_UNCATEGORIZED_ICON} class="text-muted-foreground size-3" />
			<UncategorizedLabel showIcon={false} />
		</span>
	{:else}
		<span class="inline-flex min-w-0 items-center gap-1.5">
			<CategoryIcon slug={categoryIconSlug} class="size-3" />
			<span class="truncate">{categoryLabel}</span>
		</span>
	{/if}
{/snippet}

<button
	type="button"
	class={[
		'hover:bg-muted/60 flex w-full items-center gap-3 rounded-md px-2 text-left text-sm transition-colors',
		hasSecondaryLine ? 'py-2.5' : 'py-2',
		voided && 'text-muted-foreground opacity-70'
	]}
	data-testid={testid}
	onclick={onOpen}
>
	<div class="min-w-0 flex-1">
		{#if secondary === 'category'}
			<p class="truncate font-medium" data-testid={note ? `${testid}-note` : undefined}>
				{#if note}
					{note}
				{:else if isTransfer}
					{@render transferTitle()}
				{:else}
					{@render categoryTitle()}
				{/if}
			</p>
			{#if note}
				<p
					class="text-muted-foreground flex min-w-0 items-center gap-1.5 truncate text-xs"
					data-testid={`${testid}-category`}
				>
					{#if isTransfer}
						{@render transferTitle()}
					{:else}
						{@render categoryTitle()}
					{/if}
				</p>
			{/if}
		{:else}
			<p class="font-medium">
				{#if isTransfer}
					{@render transferTitle()}
				{:else if uncategorized}
					<UncategorizedLabel />
				{:else}
					{categoryLabel}
				{/if}
			</p>
			{#if secondary === 'date'}
				{#if note}
					<p class="text-muted-foreground truncate text-xs" data-testid={`${testid}-note`}>
						{note}
					</p>
				{/if}
				<p class="text-muted-foreground truncate text-xs" data-testid={`${testid}-date`}>
					{dateLabel}
				</p>
			{/if}
		{/if}
	</div>
	<div class="flex shrink-0 flex-col items-end gap-0">
		<p
			class={[
				'font-medium tabular-nums',
				hideAmount
					? 'text-muted-foreground'
					: [
							voided && 'line-through',
							!voided &&
								(isTransfer
									? 'text-foreground'
									: tx.type === 'expense'
										? 'text-destructive'
										: 'text-income')
						]
			]}
		>
			{#if hideAmount}
				••••
			{:else}
				{amountText}
			{/if}
		</p>
		{#if showFee && !hideAmount}
			<p
				class={['text-muted-foreground text-xs tabular-nums', voided && 'line-through']}
				data-testid={`${testid}-transfer-fee`}
			>
				{feeText}
			</p>
		{/if}
		{#if showPocket}
			{@render pocketChrome()}
		{/if}
	</div>
	<ChevronRightIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
</button>
