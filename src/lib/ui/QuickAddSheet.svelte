<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import BanIcon from '@lucide/svelte/icons/ban';
	import type { CategoryRow } from '$lib/data/db';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import {
		addTransaction,
		getCategoriesForType,
		updateTransaction,
		voidTransaction
	} from '$lib/application/transactions';
	import { formatOccurredOnDisplay, todayYmd } from '$lib/domain/occurred-on-display';
	import {
		amountDigitsOnly,
		formatAmountDigitsDisplay,
		isCreateTxDirty,
		isEditTxDirty,
		todayOccurredOn,
		type AddableTransactionType,
		type TxFormBaseline
	} from '$lib/domain/transaction-rules';
	import { cn } from '$lib/utils.js';

	type Props = {
		open: boolean;
		accountId: string;
		currencyLabel: string;
		editing?: LedgerTransaction | null;
		onOpenChange: (open: boolean) => void;
		onSaved: () => void | Promise<void>;
	};

	let { open, accountId, currencyLabel, editing = null, onOpenChange, onSaved }: Props = $props();

	/** Matches Tailwind `md` — desktop shell uses a centered dialog. */
	const desktop = new MediaQuery('min-width: 768px');

	let type = $state<AddableTransactionType>('expense');
	let amountRaw = $state('');
	let categoryId = $state('');
	let note = $state('');
	let occurredOn = $state(todayOccurredOn());
	let categories = $state<CategoryRow[]>([]);
	let error = $state<string | null>(null);
	let saving = $state(false);
	let seeded = $state(false);
	let createBaseline = $state<TxFormBaseline | null>(null);
	let editBaseline = $state<Omit<TxFormBaseline, 'type'> | null>(null);
	let panelEmphasize = $state(false);

	const isEdit = $derived(Boolean(editing));
	const isVoidedView = $derived(Boolean(editing && isVoided(editing)));
	const sheetTitle = $derived(
		isVoidedView ? 'Voided transaction' : isEdit ? 'Edit transaction' : 'Add transaction'
	);
	const sheetDescription = $derived(
		isVoidedView
			? 'This transaction was voided and cannot be edited.'
			: isEdit
				? 'Update or void this entry.'
				: 'Add an income or expense to this account.'
	);
	const amountDisplay = $derived(formatAmountDigitsDisplay(amountRaw));
	const occurredOnDisplay = $derived(
		formatOccurredOnDisplay(occurredOn, todayYmd(), { year: 'always' })
	);

	const isDirty = $derived(
		isEdit
			? editBaseline !== null &&
				isEditTxDirty(
					{ amountDigits: amountRaw, categoryId, note, occurredOn },
					editBaseline
				)
			: createBaseline !== null &&
				isCreateTxDirty(
					{ type, amountDigits: amountRaw, categoryId, note, occurredOn },
					createBaseline
				)
	);

	const saveDisabled = $derived(
		saving ||
			(isEdit
				? editBaseline === null ||
					!isEditTxDirty(
						{ amountDigits: amountRaw, categoryId, note, occurredOn },
						editBaseline
					)
				: !amountRaw)
	);

	$effect(() => {
		if (!open) {
			seeded = false;
			createBaseline = null;
			editBaseline = null;
		}
	});

	$effect(() => {
		void open;
		void editing;
		if (!open) return;
		void (async () => {
			error = null;
			if (editing) {
				type = editing.type === 'income' ? 'income' : 'expense';
				amountRaw = String(editing.amountMinor);
				note = editing.note;
				occurredOn = editing.occurredOn;
				categories = await getCategoriesForType(type);
				categoryId = editing.categoryId ?? '';
				editBaseline = {
					amountDigits: String(editing.amountMinor),
					categoryId: editing.categoryId ?? '',
					note: editing.note,
					occurredOn: editing.occurredOn
				};
			} else if (!seeded) {
				type = 'expense';
				amountRaw = '';
				note = '';
				occurredOn = todayOccurredOn();
				categoryId = '';
				categories = await getCategoriesForType('expense');
				seeded = true;
				createBaseline = {
					type: 'expense',
					amountDigits: '',
					categoryId: '',
					note: '',
					occurredOn
				};
			}
		})();
	});

	function handleOpenChange(next: boolean) {
		if (next) {
			onOpenChange(true);
			return;
		}
		if (isDirty && !confirm('Discard unsaved changes?')) {
			return;
		}
		onOpenChange(false);
	}

	function onAmountInput(value: string) {
		amountRaw = amountDigitsOnly(value);
	}

	function emphasizePanel() {
		panelEmphasize = true;
		setTimeout(() => {
			panelEmphasize = false;
		}, 450);
	}

	function onInteractOutside(e: Event) {
		e.preventDefault();
		emphasizePanel();
	}

	async function onTypeChange(next: AddableTransactionType) {
		if (isEdit || isVoidedView) return;
		type = next;
		error = null;
		categories = await getCategoriesForType(next);
		categoryId = '';
	}

	async function save() {
		if (isVoidedView || saveDisabled) return;
		saving = true;
		error = null;
		try {
			if (editing) {
				await updateTransaction({
					id: editing.id,
					accountId,
					type,
					amountRaw,
					categoryId,
					note,
					occurredOn
				});
			} else {
				await addTransaction({
					accountId,
					type,
					amountRaw,
					categoryId,
					note,
					occurredOn
				});
			}
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not save transaction';
		} finally {
			saving = false;
		}
	}

	async function onVoid() {
		if (!editing || isVoidedView) return;
		if (!confirm('Void this transaction permanently? This cannot be undone.')) return;
		saving = true;
		error = null;
		try {
			await voidTransaction(editing.id);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not void transaction';
		} finally {
			saving = false;
		}
	}
</script>

{#snippet txHeader(Title: typeof Dialog.Title, Description: typeof Dialog.Description)}
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<Title>{sheetTitle}</Title>
			<Description>{sheetDescription}</Description>
		</div>
		{#if isEdit && !isVoidedView}
			<Button
				type="button"
				variant="destructive"
				size="icon-sm"
				class="shrink-0"
				disabled={saving}
				data-testid="tx-void"
				aria-label="Void transaction"
				onclick={() => void onVoid()}
			>
				<BanIcon />
			</Button>
		{/if}
	</div>
{/snippet}

{#snippet txForm()}
	<form
		class="flex flex-col gap-4 overflow-y-auto px-4 py-4"
		onsubmit={(e) => {
			e.preventDefault();
			void save();
		}}
	>
		{#if isEdit || isVoidedView}
			<div class="grid grid-cols-2 gap-2" aria-readonly="true">
				<div
					class={cn(
						'flex h-12 items-center justify-center rounded-md border text-sm font-semibold',
						type === 'expense'
							? 'border-destructive/40 bg-destructive/15 text-destructive'
							: 'border-border bg-muted/20 text-muted-foreground opacity-50'
					)}
					aria-current={type === 'expense' ? 'true' : undefined}
				>
					Expense
				</div>
				<div
					class={cn(
						'flex h-12 items-center justify-center rounded-md border text-sm font-semibold',
						type === 'income'
							? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
							: 'border-border bg-muted/20 text-muted-foreground opacity-50'
					)}
					aria-current={type === 'income' ? 'true' : undefined}
				>
					Income
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-2">
				<Button
					type="button"
					size="lg"
					class={cn(
						'h-12 w-full border font-semibold',
						type === 'expense'
							? 'border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/20'
							: 'border-border bg-background text-muted-foreground hover:bg-muted/50'
					)}
					disabled={saving}
					aria-pressed={type === 'expense'}
					onclick={() => void onTypeChange('expense')}
				>
					Expense
				</Button>
				<Button
					type="button"
					size="lg"
					class={cn(
						'h-12 w-full border font-semibold',
						type === 'income'
							? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
							: 'border-border bg-background text-muted-foreground hover:bg-muted/50'
					)}
					disabled={saving}
					aria-pressed={type === 'income'}
					onclick={() => void onTypeChange('income')}
				>
					Income
				</Button>
			</div>
		{/if}

		<div class="space-y-2">
			<Label for="amount">Amount ({currencyLabel})</Label>
			<Input
				id="amount"
				name="amount"
				inputmode="numeric"
				autocomplete="off"
				placeholder="15,000"
				value={amountDisplay}
				oninput={(e) => onAmountInput(e.currentTarget.value)}
				disabled={isVoidedView || saving}
				aria-invalid={error ? true : undefined}
			/>
		</div>

		<div class="space-y-2">
			<Label for="category">Category</Label>
			<select
				id="category"
				class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={categoryId}
				disabled={isVoidedView || saving}
			>
				{#each categories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
				<option disabled>────────</option>
				<option value="">Uncategorized</option>
			</select>
		</div>

		<div class="space-y-2">
			<Label for="occurredOn">Date</Label>
			<Input
				id="occurredOn"
				name="occurredOn"
				type="date"
				bind:value={occurredOn}
				disabled={isVoidedView || saving}
			/>
			<p class="text-muted-foreground text-xs" data-testid="tx-occurred-on-display">
				{occurredOnDisplay}
			</p>
		</div>

		<div class="space-y-2">
			<Label for="note">Note</Label>
			<Input
				id="note"
				name="note"
				placeholder="Optional"
				bind:value={note}
				disabled={isVoidedView || saving}
			/>
		</div>

		{#if error}
			<p class="text-destructive text-sm" role="alert">{error}</p>
		{/if}

		<div class="flex flex-col gap-2 pt-2">
			{#if !isVoidedView}
				<Button
					type="submit"
					class="w-full"
					disabled={saveDisabled}
					data-testid="tx-save"
				>
					{saving ? 'Saving…' : 'Save'}
				</Button>
			{/if}
			<Button
				type="button"
				variant="outline"
				class="w-full"
				disabled={saving}
				data-testid="tx-close"
				onclick={() => handleOpenChange(false)}
			>
				Close
			</Button>
		</div>
	</form>
{/snippet}

{#if desktop.current}
	<Dialog.Root {open} onOpenChange={handleOpenChange}>
		<Dialog.Content
			class={cn('gap-0 p-0', panelEmphasize && 'panel-emphasize')}
			data-testid="tx-dialog"
			showCloseButton={false}
			onInteractOutside={onInteractOutside}
		>
			<Dialog.Header class="border-border border-b px-4 py-3 text-left">
				{@render txHeader(Dialog.Title, Dialog.Description)}
			</Dialog.Header>
			{@render txForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Sheet.Root {open} onOpenChange={handleOpenChange}>
		<Sheet.Content
			side="bottom"
			class={cn(
				'mx-auto max-h-[90svh] w-full max-w-lg gap-0 rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
				panelEmphasize && 'panel-emphasize'
			)}
			data-testid="tx-sheet"
			showCloseButton={false}
			onInteractOutside={onInteractOutside}
		>
			<Sheet.Header class="border-border border-b px-4 py-3 text-left">
				{@render txHeader(Sheet.Title, Sheet.Description)}
			</Sheet.Header>
			{@render txForm()}
		</Sheet.Content>
	</Sheet.Root>
{/if}

<style>
	:global(.panel-emphasize) {
		animation: panel-emphasize 0.45s ease;
	}

	@keyframes panel-emphasize {
		0%,
		100% {
			box-shadow: 0 0 0 0 color-mix(in oklch, var(--ring) 0%, transparent);
		}
		50% {
			box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 55%, transparent);
		}
	}
</style>
