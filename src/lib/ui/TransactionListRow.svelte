<script lang="ts">
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import { formatMinor } from '$lib/domain/money';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';

	type PocketInfo = { name: string; isMain: boolean };

	type Props = {
		tx: LedgerTransaction;
		currencyLabel: string;
		categoryLabel: string;
		/** When true, show UncategorizedLabel instead of categoryLabel text. */
		uncategorized?: boolean;
		hideAmount?: boolean;
		/**
		 * `date` — Home Recent / Activity Default (076): note then date, or date only.
		 * `note` — Activity date sorts (076): note only; omitted entirely when empty (no spacer).
		 * `none` — no secondary line at all (tighter single-line row).
		 */
		secondary?: 'date' | 'note' | 'none';
		/** Pocket id → display info; required with `showPocket` to resolve names. */
		pocketsById?: Record<string, PocketInfo>;
		/** Show the pocket (or transfer source → dest) under the amount (077). */
		showPocket?: boolean;
		testid: string;
		onOpen: () => void;
	};

	let {
		tx,
		currencyLabel,
		categoryLabel,
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

	const hasSecondaryLine = $derived(
		secondary !== 'none' && !(secondary === 'note' && !note)
	);

	const amountText = $derived(
		isTransfer
			? formatMinor(tx.amountMinor, currencyLabel)
			: `${tx.type === 'expense' ? '−' : '+'}${formatMinor(tx.amountMinor, currencyLabel)}`
	);

	function pocketInfo(id: string | null): PocketInfo {
		if (!id) return UNKNOWN_POCKET;
		return pocketsById?.[id] ?? UNKNOWN_POCKET;
	}

	const sourcePocket = $derived(pocketInfo(tx.accountId));
	const destPocket = $derived(pocketInfo(tx.counterAccountId));
	const ownPocket = $derived(pocketInfo(tx.accountId));
</script>

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
		<p class="font-medium">
			{#if isTransfer}
				<span class="inline-flex items-center gap-1.5">
					<ArrowLeftRightIcon
						class="text-muted-foreground size-3.5 shrink-0"
						aria-hidden="true"
						data-testid={`${testid}-transfer-icon`}
					/>
					Transfer
				</span>
			{:else if uncategorized}
				<UncategorizedLabel />
			{:else}
				{categoryLabel}
			{/if}
		</p>
		{#if secondary === 'note'}
			{#if note}
				<p class="text-muted-foreground truncate text-xs" data-testid={`${testid}-note`}>
					{note}
				</p>
			{/if}
		{:else if secondary === 'date'}
			{#if note}
				<p class="text-muted-foreground truncate text-xs" data-testid={`${testid}-note`}>
					{note}
				</p>
				<p class="text-muted-foreground truncate text-xs" data-testid={`${testid}-date`}>
					{dateLabel}
				</p>
			{:else}
				<p class="text-muted-foreground truncate text-xs" data-testid={`${testid}-date`}>
					{dateLabel}
				</p>
			{/if}
		{/if}
	</div>
	<div class="flex shrink-0 flex-col items-end gap-0.5">
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
										: 'text-emerald-600 dark:text-emerald-400')
						]
			]}
		>
			{#if hideAmount}
				••••
			{:else}
				{amountText}
			{/if}
		</p>
		{#if showPocket}
			{#if isTransfer}
				<div
					class="text-muted-foreground flex items-center gap-1 text-xs"
					data-testid={`${testid}-pocket`}
				>
					<PocketLabel name={sourcePocket.name} isMain={sourcePocket.isMain} />
					<ArrowRightIcon class="size-3 shrink-0" aria-hidden="true" />
					<PocketLabel name={destPocket.name} isMain={destPocket.isMain} />
				</div>
			{:else}
				<div data-testid={`${testid}-pocket`}>
					<PocketLabel
						name={ownPocket.name}
						isMain={ownPocket.isMain}
						class="text-muted-foreground text-xs"
					/>
				</div>
			{/if}
		{/if}
	</div>
	<ChevronRightIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
</button>
