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
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import type { Account } from '$lib/domain/account';
	import { classifyFormFieldError, type FormFieldKey } from '$lib/domain/form-field-error';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import {
		addTransaction,
		addTransfer,
		getCategoriesForType,
		updateTransaction,
		updateTransfer,
		voidTransaction
	} from '$lib/application/transactions';
	import { listResolvedGroups } from '$lib/application/categories';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
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
	import {
		clearTxCreateDraft,
		readTxCreateDraft,
		writeTxCreateDraft,
		type TxCreateDraft
	} from '$lib/shared/create-form-drafts';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import CategoryPicker from '$lib/ui/CategoryPicker.svelte';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import { cn } from '$lib/utils.js';
	import { SyncConflictError } from '$lib/application/sync';

	type AddMode = 'normal' | 'transfer';

	type TransferEditBaseline = {
		amountDigits: string;
		feeDigits: string;
		sourceId: string;
		destId: string;
		note: string;
		occurredOn: string;
	};

	type Props = {
		open: boolean;
		accountId: string;
		/** Preferred pocket for Normal create (Activity filter or Main). */
		preferredAccountId?: string;
		currencyLabel: string;
		accounts?: Account[];
		editing?: LedgerTransaction | null;
		onOpenChange: (open: boolean) => void;
		onSaved: () => void | Promise<void>;
		onPushTransaction?: (id: string, deleted?: boolean) => void | Promise<void>;
		onSyncConflict?: () => void | Promise<void>;
	};

	let {
		open,
		accountId,
		preferredAccountId = '',
		currencyLabel,
		accounts = [],
		editing = null,
		onOpenChange,
		onSaved,
		onPushTransaction,
		onSyncConflict
	}: Props = $props();

	const desktop = new MediaQuery('min-width: 768px');

	let mode = $state<AddMode>('normal');
	let type = $state<AddableTransactionType>('expense');
	let amountRaw = $state('');
	let categoryId = $state('');
	let note = $state('');
	let occurredOn = $state(todayOccurredOn());
	let selectedAccountId = $state('');
	let categories = $state<CategoryRow[]>([]);
	let categoryGroups = $state<OverlayGroup[]>([]);
	let fieldError = $state<{ key: FormFieldKey; message: string } | null>(null);
	let saving = $state(false);
	let seeded = $state(false);
	let createBaseline = $state<(TxFormBaseline & { accountId: string }) | null>(null);
	let transferCreateBaseline = $state<{
		sourceId: string;
		destId: string;
		occurredOn: string;
	} | null>(null);
	let editBaseline = $state<(Omit<TxFormBaseline, 'type'> & { accountId: string }) | null>(null);
	let transferEditBaseline = $state<TransferEditBaseline | null>(null);
	let voidConfirmOpen = $state(false);
	let discardConfirmOpen = $state(false);

	let transferSourceId = $state('');
	let transferDestId = $state('');
	let transferAmountRaw = $state('');
	let transferFeeRaw = $state('');
	let transferNote = $state('');
	let transferOccurredOn = $state(todayOccurredOn());

	const isEdit = $derived(Boolean(editing));
	const isVoidedView = $derived(Boolean(editing && isVoided(editing)));
	const isTransferEdit = $derived(Boolean(editing && editing.type === 'transfer'));
	const canOfferTransfer = $derived(accounts.length >= 2);
	const defaultPocketId = $derived(
		preferredAccountId && accounts.some((a) => a.id === preferredAccountId)
			? preferredAccountId
			: accountId
	);

	const sheetTitle = $derived(
		isVoidedView ? 'Voided transaction' : isEdit ? 'Edit transaction' : 'Add transaction'
	);
	const sheetDescription = $derived(
		isVoidedView
			? 'This transaction was voided and cannot be edited.'
			: isEdit
				? 'Update or void this entry.'
				: 'Add money in or out, or move money between pockets.'
	);
	const amountDisplay = $derived(formatAmountDigitsDisplay(amountRaw));

	const transferSourceOptions = $derived(accounts);
	const transferDestOptions = $derived(accounts);
	const transferSamePocket = $derived(
		Boolean(transferSourceId && transferDestId && transferSourceId === transferDestId)
	);

	const isDirty = $derived(
		isTransferEdit
			? transferEditBaseline !== null &&
					(transferAmountRaw !== transferEditBaseline.amountDigits ||
						transferFeeRaw !== transferEditBaseline.feeDigits ||
						transferSourceId !== transferEditBaseline.sourceId ||
						transferDestId !== transferEditBaseline.destId ||
						transferNote !== transferEditBaseline.note ||
						transferOccurredOn !== transferEditBaseline.occurredOn)
			: isEdit
				? editBaseline !== null &&
					(isEditTxDirty({ amountDigits: amountRaw, categoryId, note, occurredOn }, editBaseline) ||
						selectedAccountId !== editBaseline.accountId)
				: mode === 'transfer'
					? transferCreateBaseline !== null &&
						(transferAmountRaw !== '' ||
							transferFeeRaw !== '' ||
							transferNote.trim() !== '' ||
							transferOccurredOn !== transferCreateBaseline.occurredOn ||
							transferSourceId !== transferCreateBaseline.sourceId ||
							transferDestId !== transferCreateBaseline.destId)
					: createBaseline !== null &&
						(isCreateTxDirty(
							{ type, amountDigits: amountRaw, categoryId, note, occurredOn },
							createBaseline
						) ||
							selectedAccountId !== createBaseline.accountId)
	);

	const saveDisabled = $derived(
		saving ||
			(isTransferEdit
				? transferEditBaseline === null ||
					!transferAmountRaw ||
					!transferSourceId ||
					!transferDestId ||
					transferSourceId === transferDestId ||
					!(
						transferAmountRaw !== transferEditBaseline.amountDigits ||
						transferFeeRaw !== transferEditBaseline.feeDigits ||
						transferSourceId !== transferEditBaseline.sourceId ||
						transferDestId !== transferEditBaseline.destId ||
						transferNote !== transferEditBaseline.note ||
						transferOccurredOn !== transferEditBaseline.occurredOn
					)
				: isEdit
					? editBaseline === null ||
						!(
							isEditTxDirty(
								{ amountDigits: amountRaw, categoryId, note, occurredOn },
								editBaseline
							) || selectedAccountId !== editBaseline.accountId
						)
					: mode === 'transfer'
						? !transferAmountRaw ||
							!transferSourceId ||
							!transferDestId ||
							transferSourceId === transferDestId
						: !amountRaw || !selectedAccountId)
	);

	function clearFieldError() {
		fieldError = null;
	}

	function setCaughtError(err: unknown) {
		const message = err instanceof Error ? err.message : 'Could not save transaction';
		fieldError = { key: classifyFormFieldError(message), message };
	}

	function fieldAlert(key: FormFieldKey) {
		return fieldError?.key === key ? fieldError.message : null;
	}

	function requestDiscard() {
		if (!isDirty) {
			onOpenChange(false);
			return;
		}
		discardConfirmOpen = true;
	}

	function handleOpenChange(next: boolean) {
		if (next) {
			onOpenChange(true);
			return;
		}
		requestDiscard();
	}

	/** Keep host open when dirty / discard open; bits-ui `ignore` skips these callbacks. */
	function onInteractOutside(e: PointerEvent) {
		if (!isDirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (isDirty) discardConfirmOpen = true;
	}

	function onEscapeKeydown(e: KeyboardEvent) {
		if (!isDirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (isDirty) discardConfirmOpen = true;
	}

	function snapshotTxCreateDraft(): TxCreateDraft {
		return {
			mode,
			type,
			amountDigits: amountRaw,
			categoryId,
			note,
			occurredOn,
			accountId: selectedAccountId,
			transferSourceId,
			transferDestId,
			transferAmountDigits: transferAmountRaw,
			transferFeeDigits: transferFeeRaw,
			transferNote,
			transferOccurredOn
		};
	}

	function confirmDiscard() {
		if (!isEdit) clearTxCreateDraft();
		discardConfirmOpen = false;
		onOpenChange(false);
	}

	function saveCreateDraft() {
		writeTxCreateDraft(snapshotTxCreateDraft());
		discardConfirmOpen = false;
		onOpenChange(false);
	}

	$effect(() => {
		if (!open) {
			seeded = false;
			createBaseline = null;
			transferCreateBaseline = null;
			editBaseline = null;
			transferEditBaseline = null;
			fieldError = null;
		}
	});

	$effect(() => {
		void open;
		void editing;
		if (!open) return;
		void (async () => {
			fieldError = null;
			if (editing) {
				if (editing.type === 'transfer') {
					mode = 'transfer';
					transferSourceId = editing.accountId;
					transferDestId = editing.counterAccountId ?? '';
					transferAmountRaw = String(editing.amountMinor);
					transferFeeRaw = editing.feeMinor > 0 ? String(editing.feeMinor) : '';
					transferNote = editing.note;
					transferOccurredOn = editing.occurredOn;
					transferEditBaseline = {
						amountDigits: String(editing.amountMinor),
						feeDigits: editing.feeMinor > 0 ? String(editing.feeMinor) : '',
						sourceId: editing.accountId,
						destId: editing.counterAccountId ?? '',
						note: editing.note,
						occurredOn: editing.occurredOn
					};
					editBaseline = null;
					createBaseline = null;
					transferCreateBaseline = null;
				} else {
					mode = 'normal';
					type = editing.type === 'income' ? 'income' : 'expense';
					amountRaw = String(editing.amountMinor);
					note = editing.note;
					occurredOn = editing.occurredOn;
					selectedAccountId = editing.accountId;
					categories = await getCategoriesForType(type);
					categoryGroups = await listResolvedGroups();
					categoryId = editing.categoryId ?? '';
					editBaseline = {
						amountDigits: String(editing.amountMinor),
						categoryId: editing.categoryId ?? '',
						note: editing.note,
						occurredOn: editing.occurredOn,
						accountId: editing.accountId
					};
					transferEditBaseline = null;
					createBaseline = null;
					transferCreateBaseline = null;
				}
			} else if (!seeded) {
				const today = todayOccurredOn();
				const pocket = defaultPocketId;
				const destDefault = accounts.find((a) => a.id !== pocket)?.id ?? '';
				mode = 'normal';
				type = 'expense';
				amountRaw = '';
				note = '';
				occurredOn = today;
				categoryId = '';
				selectedAccountId = pocket;
				categories = await getCategoriesForType('expense');
				categoryGroups = await listResolvedGroups();
				transferSourceId = pocket;
				transferDestId = destDefault;
				transferAmountRaw = '';
				transferFeeRaw = '';
				transferNote = '';
				transferOccurredOn = today;
				createBaseline = {
					type: 'expense',
					amountDigits: '',
					categoryId: '',
					note: '',
					occurredOn: today,
					accountId: pocket
				};
				transferCreateBaseline = {
					sourceId: pocket,
					destId: destDefault,
					occurredOn: today
				};

				const draft = readTxCreateDraft();
				if (draft) {
					mode = draft.mode;
					type = draft.type;
					amountRaw = draft.amountDigits;
					categoryId = draft.categoryId;
					note = draft.note;
					occurredOn = draft.occurredOn || today;
					selectedAccountId = draft.accountId || pocket;
					transferSourceId = draft.transferSourceId || pocket;
					transferDestId = draft.transferDestId || destDefault;
					transferAmountRaw = draft.transferAmountDigits;
					transferFeeRaw = draft.transferFeeDigits;
					transferNote = draft.transferNote;
					transferOccurredOn = draft.transferOccurredOn || today;
					if (draft.mode === 'normal') {
						categories = await getCategoriesForType(draft.type);
						categoryGroups = await listResolvedGroups();
					}
				}
				seeded = true;
			}
		})();
	});

	function onAmountInput(value: string) {
		amountRaw = amountDigitsOnly(value);
		if (fieldError?.key === 'amount') clearFieldError();
	}

	function onAmountPaste(event: ClipboardEvent) {
		event.preventDefault();
		onAmountInput(event.clipboardData?.getData('text') ?? '');
	}

	function onAmountKeydown(event: KeyboardEvent) {
		if (isBlockedAmountKey(event)) event.preventDefault();
	}

	function onTransferAmountInput(value: string) {
		transferAmountRaw = amountDigitsOnly(value);
		if (fieldError?.key === 'amount') clearFieldError();
	}

	function onTransferAmountPaste(event: ClipboardEvent) {
		event.preventDefault();
		onTransferAmountInput(event.clipboardData?.getData('text') ?? '');
	}

	function onTransferFeeInput(value: string) {
		transferFeeRaw = amountDigitsOnly(value);
		if (fieldError?.key === 'fee') clearFieldError();
	}

	function onTransferFeePaste(event: ClipboardEvent) {
		event.preventDefault();
		onTransferFeeInput(event.clipboardData?.getData('text') ?? '');
	}

	async function onTypeChange(next: AddableTransactionType) {
		if (isEdit || isVoidedView) return;
		type = next;
		clearFieldError();
		categories = await getCategoriesForType(next);
		categoryGroups = await listResolvedGroups();
		categoryId = '';
	}

	function selectMode(next: AddMode) {
		if (isEdit || isVoidedView) return;
		mode = next;
		clearFieldError();
	}

	async function save() {
		if (isVoidedView || saveDisabled) return;
		saving = true;
		clearFieldError();
		try {
			let savedId: string | null = null;
			if (editing && editing.type === 'transfer') {
				await updateTransfer({
					id: editing.id,
					sourceAccountId: transferSourceId,
					destAccountId: transferDestId,
					amountRaw: transferAmountRaw,
					feeRaw: transferFeeRaw,
					note: transferNote,
					occurredOn: transferOccurredOn
				});
				savedId = editing.id;
			} else if (editing) {
				await updateTransaction({
					id: editing.id,
					accountId: selectedAccountId,
					type,
					amountRaw,
					categoryId,
					note,
					occurredOn
				});
				savedId = editing.id;
			} else if (mode === 'transfer') {
				const tx = await addTransfer({
					sourceAccountId: transferSourceId,
					destAccountId: transferDestId,
					amountRaw: transferAmountRaw,
					feeRaw: transferFeeRaw,
					note: transferNote,
					occurredOn: transferOccurredOn
				});
				clearTxCreateDraft();
				savedId = tx.id;
			} else {
				const tx = await addTransaction({
					accountId: selectedAccountId,
					type,
					amountRaw,
					categoryId,
					note,
					occurredOn
				});
				clearTxCreateDraft();
				savedId = tx.id;
			}
			if (savedId && onPushTransaction) await onPushTransaction(savedId);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			if (err instanceof SyncConflictError) {
				onOpenChange(false);
				await onSyncConflict?.();
				return;
			}
			setCaughtError(err);
		} finally {
			saving = false;
		}
	}

	async function confirmVoid() {
		if (!editing || isVoidedView) return;
		saving = true;
		clearFieldError();
		try {
			await voidTransaction(editing.id);
			if (onPushTransaction) await onPushTransaction(editing.id, true);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			if (err instanceof SyncConflictError) {
				onOpenChange(false);
				await onSyncConflict?.();
				return;
			}
			setCaughtError(err);
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
					<PencilIcon
						class="size-4 shrink-0"
						data-testid="tx-header-icon-edit"
						aria-hidden="true"
					/>
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

{#snippet fieldErrorAlert(key: FormFieldKey, testid: string)}
	{#if fieldAlert(key)}
		<p class="text-destructive text-sm" role="alert" data-testid={testid}>{fieldAlert(key)}</p>
	{/if}
{/snippet}

{#snippet pocketPicker(
	labelText: string,
	options: Account[],
	selectedId: string,
	onSelect: (id: string) => void,
	testid: string,
	errorKey: FormFieldKey | null = null
)}
	{@const selected = accounts.find((a) => a.id === selectedId)}
	<div class="space-y-2">
		<Label>{labelText}</Label>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-9"
				disabled={isVoidedView || saving}
				data-testid={testid}
				aria-label={labelText}
				aria-invalid={errorKey && fieldAlert(errorKey) ? true : undefined}
			>
				{#if selected}
					<PocketLabel name={selected.name} isMain={selected.isMain} />
				{:else}
					<span class="text-muted-foreground">Choose a pocket</span>
				{/if}
				<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="max-h-60 w-(--bits-dropdown-menu-anchor-width)">
				{#each options as pocket (pocket.id)}
					<DropdownMenu.Item
						data-testid={`${testid}-option-${pocket.id}`}
						onclick={() => {
							onSelect(pocket.id);
							if (errorKey && fieldError?.key === errorKey) clearFieldError();
						}}
					>
						<PocketLabel name={pocket.name} isMain={pocket.isMain} />
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		{#if errorKey}
			{@render fieldErrorAlert(errorKey, `tx-field-error-${errorKey}`)}
		{/if}
	</div>
{/snippet}

{#snippet txForm()}
	<form
		class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
		onsubmit={(e) => {
			e.preventDefault();
			void save();
		}}
	>
		{#if isEdit || isVoidedView}
			{#if isTransferEdit}
				<span
					class="mx-auto inline-flex w-fit rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
					data-testid="tx-type-badge-transfer"
				>
					Transfer
				</span>
			{:else}
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
			{/if}
		{:else if canOfferTransfer}
			<Tabs.Root
				value={mode}
				onValueChange={(v) => {
					if (v === 'normal' || v === 'transfer') selectMode(v);
				}}
				class="w-full"
				data-testid="tx-mode-tabs"
			>
				<Tabs.List variant="default" class="w-full">
					<Tabs.Trigger
						value="normal"
						disabled={saving}
						data-testid="tx-mode-normal"
						class="flex-1"
					>
						Normal
					</Tabs.Trigger>
					<Tabs.Trigger
						value="transfer"
						disabled={saving}
						data-testid="tx-mode-transfer"
						class="flex-1"
					>
						Transfer
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		{/if}

		{#if (mode === 'transfer' && !isEdit) || isTransferEdit}
			{@render pocketPicker(
				'Source',
				transferSourceOptions,
				transferSourceId,
				(id) => (transferSourceId = id),
				'tx-transfer-source',
				'source'
			)}
			{@render pocketPicker(
				'Destination',
				transferDestOptions,
				transferDestId,
				(id) => (transferDestId = id),
				'tx-transfer-dest',
				'dest'
			)}
			{#if transferSamePocket}
				<p class="text-destructive text-sm" role="alert" data-testid="tx-transfer-same-pocket-warn">
					Source and destination must be different
				</p>
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
						name="transfer-amount"
						inputmode="numeric"
						autocomplete="off"
						placeholder="15,000"
						value={formatAmountDigitsDisplay(transferAmountRaw)}
						onkeydown={onAmountKeydown}
						onpaste={onTransferAmountPaste}
						oninput={(e) => onTransferAmountInput(e.currentTarget.value)}
						disabled={isVoidedView || saving}
						class={cn('!pl-2.5', (isVoidedView || saving) && 'shadow-none')}
						aria-label="Amount"
						aria-invalid={fieldAlert('amount') ? true : undefined}
						data-testid="tx-transfer-amount"
					/>
				</InputGroup.Root>
				{@render fieldErrorAlert('amount', 'tx-field-error-amount')}
			</div>

			<div class="space-y-2">
				<Label>Fee</Label>
				<InputGroup.Root
					data-disabled={isVoidedView || saving ? true : undefined}
					class={cn((isVoidedView || saving) && 'shadow-none')}
				>
					<InputGroup.Addon class="bg-muted/60 border-input border-r px-2.5">
						<InputGroup.Text>{currencyLabel}</InputGroup.Text>
					</InputGroup.Addon>
					<InputGroup.Input
						name="transfer-fee"
						inputmode="numeric"
						autocomplete="off"
						placeholder="Optional"
						value={formatAmountDigitsDisplay(transferFeeRaw)}
						onkeydown={onAmountKeydown}
						onpaste={onTransferFeePaste}
						oninput={(e) => onTransferFeeInput(e.currentTarget.value)}
						disabled={isVoidedView || saving}
						class={cn('!pl-2.5', (isVoidedView || saving) && 'shadow-none')}
						aria-label="Fee"
						aria-invalid={fieldAlert('fee') ? true : undefined}
						data-testid="tx-transfer-fee"
					/>
				</InputGroup.Root>
				{@render fieldErrorAlert('fee', 'tx-field-error-fee')}
			</div>

			<div class="space-y-2">
				<Label>Date</Label>
				<DateField
					value={transferOccurredOn}
					onValueChange={(next) => {
						transferOccurredOn = next;
						if (fieldError?.key === 'occurredOn') clearFieldError();
					}}
					disabled={isVoidedView || saving}
					aria-label="Date"
					testid="tx-transfer-occurred-on"
				/>
				{@render fieldErrorAlert('occurredOn', 'tx-field-error-occurredOn')}
			</div>

			<div class="space-y-2">
				<Label>Note</Label>
				<Input
					name="transfer-note"
					placeholder="Optional"
					bind:value={transferNote}
					disabled={isVoidedView || saving}
					aria-label="Note"
					data-testid="tx-transfer-note"
				/>
			</div>
		{:else}
			{#if !isEdit}
				<div class="grid grid-cols-2 gap-2">
					<Button
						type="button"
						class={cn(
							'h-11 w-full border font-semibold md:h-9',
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
							'h-11 w-full border font-semibold md:h-9',
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

			{@render pocketPicker(
				'Pocket',
				accounts,
				selectedAccountId,
				(id) => {
					selectedAccountId = id;
					if (fieldError?.key === 'pocket') clearFieldError();
				},
				'tx-pocket',
				'pocket'
			)}

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
						aria-invalid={fieldAlert('amount') ? true : undefined}
						data-testid="tx-amount"
					/>
				</InputGroup.Root>
				{@render fieldErrorAlert('amount', 'tx-field-error-amount')}
			</div>

			<div class="space-y-2">
				<Label>Category</Label>
				<CategoryPicker
					value={categoryId}
					onValueChange={(next) => {
						categoryId = next;
						if (fieldError?.key === 'category') clearFieldError();
					}}
					{categories}
					groups={categoryGroups}
					showUncategorized
					emptyMeans="uncategorized"
					disabled={isVoidedView || saving}
					testid="tx-category"
					ariaLabel="Category"
					ariaInvalid={fieldAlert('category') ? true : undefined}
				/>
				{@render fieldErrorAlert('category', 'tx-field-error-category')}
			</div>

			<div class="space-y-2">
				<Label>Date</Label>
				<DateField
					value={occurredOn}
					onValueChange={(next) => {
						occurredOn = next;
						if (fieldError?.key === 'occurredOn') clearFieldError();
					}}
					disabled={isVoidedView || saving}
					aria-label="Date"
					testid="tx-occurred-on"
				/>
				{@render fieldErrorAlert('occurredOn', 'tx-field-error-occurredOn')}
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
		{/if}

		{#if fieldAlert('form')}
			<p class="text-destructive text-sm" role="alert" data-testid="tx-field-error-form">
				{fieldAlert('form')}
			</p>
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
		<Dialog.Content
			class="flex max-h-[100svh] flex-col gap-0 overflow-hidden p-0"
			data-testid="tx-dialog"
			showCloseButton={false}
			interactOutsideBehavior="close"
			escapeKeydownBehavior="close"
			{onInteractOutside}
			{onEscapeKeydown}
		>
			<Dialog.Header class="border-border shrink-0 border-b px-4 py-3 text-left">
				{@render txHeader(Dialog.Title, Dialog.Description)}
			</Dialog.Header>
			{@render txForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Sheet.Root {open} onOpenChange={handleOpenChange}>
		<Sheet.Content
			side="bottom"
			class="mx-auto flex max-h-[100svh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
			data-testid="tx-sheet"
			showCloseButton={false}
			interactOutsideBehavior="close"
			escapeKeydownBehavior="close"
			{onInteractOutside}
			{onEscapeKeydown}
		>
			<Sheet.Header class="border-border shrink-0 border-b px-4 py-3 text-left">
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
	description={isEdit
		? 'Your edits will be lost if you leave without saving.'
		: 'Discard permanently, or save a draft to continue later.'}
	confirmLabel="Discard"
	destructive
	confirmTestId="tx-discard-confirm"
	secondaryLabel={isEdit ? undefined : 'Save draft'}
	secondaryTestId="tx-discard-save-draft"
	onOpenChange={(next) => (discardConfirmOpen = next)}
	onConfirm={confirmDiscard}
	onSecondary={isEdit ? undefined : saveCreateDraft}
/>
