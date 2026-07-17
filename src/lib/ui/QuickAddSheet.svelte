<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import {
		addTransaction,
		getCategoriesForType,
		updateTransaction,
		voidTransaction
	} from '$lib/application/transactions';
	import {
		amountDigitsOnly,
		formatAmountDigitsDisplay,
		isBlockedAmountKey,
		isCreateTxDirty,
		isEditTxDirty,
		todayOccurredOn,
		type AddableTransactionType,
		type TxFormBaseline
	} from '$lib/domain/transaction-rules';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
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
	let voidConfirmOpen = $state(false);
	let discardConfirmOpen = $state(false);

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
	const selectedCategoryLabel = $derived(
		categoryId
			? (categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorized')
			: 'Uncategorized'
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
		if (isDirty) {
			discardConfirmOpen = true;
			return;
		}
		onOpenChange(false);
	}

	function confirmDiscard() {
		onOpenChange(false);
	}

	function onAmountInput(value: string) {
		amountRaw = amountDigitsOnly(value);
	}

	function onAmountPaste(event: ClipboardEvent) {
		event.preventDefault();
		amountRaw = amountDigitsOnly(event.clipboardData?.getData('text') ?? '');
	}

	function onAmountKeydown(event: KeyboardEvent) {
		if (isBlockedAmountKey(event)) {
			event.preventDefault();
		}
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

	async function confirmVoid() {
		if (!editing || isVoidedView) return;
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
	<div class="flex items-center justify-between gap-3">
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				{#if isVoidedView}
					<BanIcon class="size-4 shrink-0" data-testid="tx-header-icon-voided" aria-hidden="true" />
				{:else if isEdit}
					<PencilIcon class="size-4 shrink-0" data-testid="tx-header-icon-edit" aria-hidden="true" />
				{:else}
					<PlusIcon class="size-4 shrink-0" data-testid="tx-header-icon-add" aria-hidden="true" />
				{/if}
				<Title>{sheetTitle}</Title>
			</div>
			<Description>{sheetDescription}</Description>
		</div>
		{#if isEdit && !isVoidedView}
			<Button
				type="button"
				variant="destructive"
				size="sm"
				class="shrink-0 gap-1.5"
				disabled={saving}
				data-testid="tx-void"
				onclick={() => (voidConfirmOpen = true)}
			>
				<BanIcon class="size-4" />
				Void
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
			<span
				class={cn(
					'mx-auto inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-medium',
					type === 'expense'
						? 'bg-destructive/10 text-destructive'
						: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
				)}
			>
				{type === 'expense' ? 'Expense' : 'Income'}
			</span>
		{:else}
			<div class="grid grid-cols-2 gap-2">
				<Button
					type="button"
					class={cn(
						'h-9 w-full border font-semibold',
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
				<Button
					type="button"
					class={cn(
						'h-9 w-full border font-semibold',
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
			</div>
		{/if}

		<div class="space-y-2">
			<Label>Amount</Label>
			<InputGroup.Root
				data-disabled={isVoidedView || saving ? true : undefined}
				class={cn((isVoidedView || saving) && 'shadow-none')}
			>
				<InputGroup.Addon class="bg-muted/60 border-input border-r px-2.5">
					<InputGroup.Text>{currencyLabel}</InputGroup.Text>
				</InputGroup.Addon>
				<InputGroup.Input
					name="amount"
					inputmode="numeric"
					autocomplete="off"
					placeholder="15,000"
					value={amountDisplay}
					onkeydown={onAmountKeydown}
					onpaste={onAmountPaste}
					oninput={(e) => onAmountInput(e.currentTarget.value)}
					disabled={isVoidedView || saving}
					class={cn('!pl-2.5', (isVoidedView || saving) && 'shadow-none')}
					aria-label="Amount"
					aria-invalid={error ? true : undefined}
				/>
			</InputGroup.Root>
		</div>

		<div class="space-y-2">
			<Label>Category</Label>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					disabled={isVoidedView || saving}
					data-testid="tx-category"
					aria-label="Category"
				>
					{#if categoryId}
						<span class="truncate">{selectedCategoryLabel}</span>
					{:else}
						<UncategorizedLabel system />
					{/if}
					<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="max-h-60 w-(--bits-dropdown-menu-anchor-width)">
					{#each categories as category (category.id)}
						<DropdownMenu.Item onclick={() => (categoryId = category.id)}>
							{category.name}
						</DropdownMenu.Item>
					{/each}
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => (categoryId = '')}>
						<UncategorizedLabel system />
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<div class="space-y-2">
			<Label>Date</Label>
			<DateField
				value={occurredOn}
				onValueChange={(next) => (occurredOn = next)}
				disabled={isVoidedView || saving}
				aria-label="Date"
				testid="tx-occurred-on"
			/>
		</div>

		<div class="space-y-2">
			<Label>Note</Label>
			<Input
				name="note"
				placeholder="Optional"
				bind:value={note}
				disabled={isVoidedView || saving}
				aria-label="Note"
			/>
		</div>

		{#if error}
			<p class="text-destructive text-sm" role="alert">{error}</p>
		{/if}

		<div class="flex flex-col gap-2 pt-2">
			{#if !isVoidedView}
				<Button type="submit" class="w-full" disabled={saveDisabled} data-testid="tx-save">
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
		<Dialog.Content class="gap-0 p-0" data-testid="tx-dialog" showCloseButton={false}>
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
			class="mx-auto max-h-[90svh] w-full max-w-lg gap-0 rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
			data-testid="tx-sheet"
			showCloseButton={false}
		>
			<Sheet.Header class="border-border border-b px-4 py-3 text-left">
				{@render txHeader(Sheet.Title, Sheet.Description)}
			</Sheet.Header>
			{@render txForm()}
		</Sheet.Content>
	</Sheet.Root>
{/if}

<ConfirmDialog
	open={voidConfirmOpen}
	title="Void transaction?"
	description="This action is permanent and cannot be undone. The transaction will remain visible but will no longer affect your balance."
	confirmLabel="Void"
	destructive
	dangerChrome
	confirmTestId="tx-void-confirm"
	onOpenChange={(next) => (voidConfirmOpen = next)}
	onConfirm={confirmVoid}
/>

<ConfirmDialog
	open={discardConfirmOpen}
	title="Discard unsaved changes?"
	description="Your edits will be lost if you leave without saving."
	confirmLabel="Discard"
	destructive
	confirmTestId="tx-discard-confirm"
	onOpenChange={(next) => (discardConfirmOpen = next)}
	onConfirm={confirmDiscard}
/>
