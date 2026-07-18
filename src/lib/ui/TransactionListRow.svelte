<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import { formatMinor } from '$lib/domain/money';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';

	type Props = {
		tx: LedgerTransaction;
		currencyLabel: string;
		categoryLabel: string;
		/** When true, show UncategorizedLabel instead of categoryLabel text. */
		uncategorized?: boolean;
		hideAmount?: boolean;
		/**
		 * `date` — Home Recent (063): note then date, or date only.
		 * `note` — Activity (068): note or empty spacer; never shows date.
		 */
		secondary?: 'date' | 'note';
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
		testid,
		onOpen
	}: Props = $props();

	const voided = $derived(isVoided(tx));
	const note = $derived(tx.note?.trim() ?? '');
	const dateLabel = $derived(formatOccurredOnDisplay(tx.occurredOn));
</script>

<button
	type="button"
	class={[
		'hover:bg-muted/60 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors',
		voided && 'text-muted-foreground opacity-70'
	]}
	data-testid={testid}
	onclick={onOpen}
>
	<div class="min-w-0 flex-1">
		<p class="font-medium">
			{#if uncategorized}
				<UncategorizedLabel />
			{:else}
				{categoryLabel}
			{/if}
		</p>
		{#if secondary === 'note'}
			<p
				class="text-muted-foreground truncate text-xs"
				data-testid={note ? `${testid}-note` : `${testid}-spacer`}
			>
				{#if note}{note}{:else}&nbsp;{/if}
			</p>
		{:else if note}
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
	</div>
	<p
		class={[
			'shrink-0 font-medium tabular-nums',
			hideAmount
				? 'text-muted-foreground'
				: [
						voided && 'line-through',
						!voided &&
							(tx.type === 'expense'
								? 'text-destructive'
								: 'text-emerald-600 dark:text-emerald-400')
					]
		]}
	>
		{#if hideAmount}
			••••
		{:else}
			{tx.type === 'expense' ? '−' : '+'}
			{formatMinor(tx.amountMinor, currencyLabel)}
		{/if}
	</p>
	<ChevronRightIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
</button>
