<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
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
	import type { LedgerPlan, PlanFrequency } from '$lib/domain/plan';
	import { repeatOptionLabel } from '$lib/domain/plan';
	import { classifyFormFieldError, type FormFieldKey } from '$lib/domain/form-field-error';
	import {
		amountDigitsOnly,
		formatAmountDigitsDisplay,
		isBlockedAmountKey,
		todayOccurredOn,
		type AddableTransactionType
	} from '$lib/domain/transaction-rules';
	import {
		acceptPlanOccurrence,
		createPlan,
		dropPlan,
		savePlanForNext,
		skipPlanOccurrence,
		updatePlan
	} from '$lib/application/plans';
	import { getCategoriesForType } from '$lib/application/transactions';
	import { listResolvedGroups } from '$lib/application/categories';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import { applyGroupedAmountInput } from '$lib/ui/amount-field-caret';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import CategoryPicker from '$lib/ui/CategoryPicker.svelte';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import { cn } from '$lib/utils.js';
	import { shouldIgnoreDismissForNativePicker } from '$lib/ui/native-picker-dismiss';

	export type PlanSheetMode = 'create' | 'edit' | 'accept';

	type Props = {
		open: boolean;
		mode: PlanSheetMode;
		currencyLabel: string;
		accounts?: Account[];
		/** Pocket implied by pocket-details Add Plan. */
		impliedAccountId?: string;
		editing?: LedgerPlan | null;
		onOpenChange: (open: boolean) => void;
		onSaved: () => void | Promise<void>;
	};

	let {
		open,
		mode,
		currencyLabel,
		accounts = [],
		impliedAccountId = '',
		editing = null,
		onOpenChange,
		onSaved
	}: Props = $props();

	const desktop = new MediaQuery('min-width: 768px');

	let description = $state('');
	let typeTab = $state<'income' | 'expense' | 'transfer'>('expense');
	let amountRaw = $state('');
	let feeRaw = $state('');
	let categoryId = $state('');
	let note = $state('');
	let dueOn = $state(todayOccurredOn());
	let selectedAccountId = $state('');
	let transferDestId = $state('');
	let frequency = $state<PlanFrequency>('once');
	let categories = $state<CategoryRow[]>([]);
	let categoryGroups = $state<OverlayGroup[]>([]);
	let fieldError = $state<{ key: FormFieldKey; message: string } | null>(null);
	let saving = $state(false);
	let seeded = $state(false);
	let baseline = $state('');
	let dropConfirmOpen = $state(false);
	let skipConfirmOpen = $state(false);
	let discardConfirmOpen = $state(false);

	const isAccept = $derived(mode === 'accept');
	const isEdit = $derived(mode === 'edit');
	const canOfferTransfer = $derived(accounts.length >= 2);
	const defaultPocketId = $derived(
		impliedAccountId && accounts.some((a) => a.id === impliedAccountId)
			? impliedAccountId
			: (accounts.find((a) => a.isMain)?.id ?? accounts[0]?.id ?? '')
	);
	const hidePocketPicker = $derived(accounts.length < 2);
	const storedFrequency = $derived(editing?.frequency ?? 'once');
	const showSaveForNext = $derived(isAccept && storedFrequency !== 'once');

	const sheetTitle = $derived(
		isAccept ? 'Accept plan' : isEdit ? 'Edit plan' : 'Add plan'
	);
	const sheetDescription = $derived(
		isAccept
			? 'Post this occurrence to the ledger, or skip it.'
			: isEdit
				? 'Update this reminder. Save does not post money.'
				: 'A plan is not money until you accept it.'
	);
	const amountDisplay = $derived(formatAmountDigitsDisplay(amountRaw));
	const feeDisplay = $derived(formatAmountDigitsDisplay(feeRaw));
	const dateLabel = $derived(isAccept ? 'Date' : 'Due');
	const transferSamePocket = $derived(
		typeTab === 'transfer' &&
			Boolean(selectedAccountId && transferDestId && selectedAccountId === transferDestId)
	);

	const snapshot = $derived(
		JSON.stringify({
			description,
			typeTab,
			amountRaw,
			feeRaw,
			categoryId,
			note,
			dueOn,
			selectedAccountId,
			transferDestId,
			frequency
		})
	);
	const isDirty = $derived(seeded && snapshot !== baseline);

	const saveDisabled = $derived(
		saving ||
			!amountRaw ||
			!dueOn ||
			(typeTab === 'transfer' &&
				(!selectedAccountId || !transferDestId || selectedAccountId === transferDestId))
	);

	function fieldAlert(key: FormFieldKey): string | null {
		return fieldError?.key === key ? fieldError.message : null;
	}

	function clearFieldError() {
		fieldError = null;
	}

	function setCaughtError(err: unknown) {
		const message = err instanceof Error ? err.message : 'Something went wrong';
		fieldError = { key: classifyFormFieldError(message), message };
	}

	function onAmountKeydown(event: KeyboardEvent) {
		if (isBlockedAmountKey(event)) event.preventDefault();
	}

	function onAmountInput(el: HTMLInputElement) {
		applyGroupedAmountInput(el, (digits) => {
			amountRaw = digits;
			if (fieldError?.key === 'amount') clearFieldError();
		});
	}

	function onFeeInput(el: HTMLInputElement) {
		applyGroupedAmountInput(el, (digits) => {
			feeRaw = digits;
			if (fieldError?.key === 'fee') clearFieldError();
		});
	}

	function moneyInput() {
		if (typeTab === 'transfer') {
			return {
				type: 'transfer' as const,
				amountRaw,
				feeRaw,
				accountId: selectedAccountId,
				counterAccountId: transferDestId,
				note,
				dueOn
			};
		}
		return {
			type: typeTab as AddableTransactionType,
			amountRaw,
			feeRaw: typeTab === 'expense' ? feeRaw : '',
			categoryId,
			accountId: selectedAccountId,
			note,
			dueOn
		};
	}

	async function loadCategories(kind: AddableTransactionType) {
		categories = await getCategoriesForType(kind);
		categoryGroups = await listResolvedGroups();
	}

	function onTypeTabChange(next: string) {
		if (next !== 'income' && next !== 'expense' && next !== 'transfer') return;
		if (isAccept) {
			typeTab = next;
			if (next !== 'transfer') void loadCategories(next);
			return;
		}
		typeTab = next;
		if (next !== 'transfer') void loadCategories(next);
	}

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

	function onInteractOutside(e: PointerEvent) {
		if (shouldIgnoreDismissForNativePicker(e)) {
			e.preventDefault();
			return;
		}
		if (!isDirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (isDirty) discardConfirmOpen = true;
	}

	function onEscapeKeydown(e: KeyboardEvent) {
		if (!isDirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (isDirty) discardConfirmOpen = true;
	}

	function confirmDiscard() {
		discardConfirmOpen = false;
		onOpenChange(false);
	}

	$effect(() => {
		if (!open) {
			seeded = false;
			fieldError = null;
			return;
		}
		void (async () => {
			fieldError = null;
			if (editing) {
				description = editing.description;
				typeTab = editing.type;
				amountRaw = String(editing.amountMinor);
				feeRaw = editing.feeMinor > 0 ? String(editing.feeMinor) : '';
				categoryId = editing.categoryId ?? '';
				note = editing.note;
				dueOn = isAccept ? editing.dueOn : editing.dueOn;
				selectedAccountId = editing.accountId;
				transferDestId = editing.counterAccountId ?? '';
				frequency = editing.frequency;
				if (editing.type !== 'transfer') await loadCategories(editing.type);
				else categoryGroups = await listResolvedGroups();
			} else {
				description = '';
				typeTab = 'expense';
				amountRaw = '';
				feeRaw = '';
				categoryId = '';
				note = '';
				dueOn = todayOccurredOn();
				selectedAccountId = defaultPocketId;
				transferDestId = accounts.find((a) => a.id !== defaultPocketId)?.id ?? '';
				frequency = 'once';
				await loadCategories('expense');
			}
			baseline = JSON.stringify({
				description,
				typeTab,
				amountRaw,
				feeRaw,
				categoryId,
				note,
				dueOn,
				selectedAccountId,
				transferDestId,
				frequency
			});
			seeded = true;
		})();
	});

	async function saveEdit() {
		saving = true;
		clearFieldError();
		try {
			const money = moneyInput();
			if (isEdit && editing) {
				await updatePlan({
					id: editing.id,
					description,
					frequency,
					...money
				});
			} else {
				await createPlan({
					description,
					frequency,
					...money
				});
			}
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setCaughtError(err);
		} finally {
			saving = false;
		}
	}

	async function saveAccept() {
		if (!editing) return;
		saving = true;
		clearFieldError();
		try {
			await acceptPlanOccurrence({
				id: editing.id,
				occurredOn: dueOn,
				...moneyInput()
			});
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setCaughtError(err);
		} finally {
			saving = false;
		}
	}

	async function onSaveForNext() {
		if (!editing) return;
		saving = true;
		clearFieldError();
		try {
			await savePlanForNext({
				id: editing.id,
				occurredOn: dueOn,
				...moneyInput()
			});
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setCaughtError(err);
		} finally {
			saving = false;
		}
	}

	async function confirmDrop() {
		if (!editing) return;
		saving = true;
		try {
			await dropPlan(editing.id);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setCaughtError(err);
		} finally {
			saving = false;
		}
	}

	async function confirmSkip() {
		if (!editing) return;
		saving = true;
		try {
			await skipPlanOccurrence(editing.id);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setCaughtError(err);
		} finally {
			saving = false;
		}
	}
</script>

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
	hideWhenSingle = false
)}
	{#if hideWhenSingle && options.length < 2}
		<!-- Spec 192: Pocket omitted when only Main exists. -->
	{:else}
		{@const selected = accounts.find((a) => a.id === selectedId)}
		<div class="space-y-2">
			<Label>{labelText}</Label>
			{#if options.length < 2}
				<div
					class="border-input bg-background flex h-11 w-full items-center rounded-md border px-3 text-sm md:h-9"
					data-testid={testid}
					aria-label={labelText}
					aria-readonly="true"
				>
					{#if selected}
						<PocketLabel name={selected.name} isMain={selected.isMain} optical />
					{:else}
						<span class="text-muted-foreground">Choose a pocket</span>
					{/if}
				</div>
			{:else}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-9"
						disabled={saving}
						data-testid={testid}
						aria-label={labelText}
					>
						{#if selected}
							<PocketLabel name={selected.name} isMain={selected.isMain} optical />
						{:else}
							<span class="text-muted-foreground">Choose a pocket</span>
						{/if}
						<ChevronDownIcon class="size-4 opacity-50" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)">
						{#each options as pocket (pocket.id)}
							<DropdownMenu.Item onclick={() => onSelect(pocket.id)}>
								<PocketLabel name={pocket.name} isMain={pocket.isMain} optical />
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet planHeader(Title: typeof Dialog.Title, Description: typeof Dialog.Description)}
	<div class="flex items-center gap-2">
		{#if isAccept}
			<CalendarIcon class="size-4 shrink-0" aria-hidden="true" />
		{:else if isEdit}
			<PencilIcon class="size-4 shrink-0" aria-hidden="true" />
		{:else}
			<PlusIcon class="size-4 shrink-0" aria-hidden="true" />
		{/if}
		<Title>{sheetTitle}</Title>
	</div>
	<Description>{sheetDescription}</Description>
{/snippet}

{#snippet amountField(testid: string)}
	<div class="space-y-2">
		<Label>Amount</Label>
		<InputGroup.Root data-disabled={saving ? true : undefined} class={cn(saving && 'shadow-none')}>
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
				oninput={(e) => onAmountInput(e.currentTarget)}
				disabled={saving}
				class={cn('!pl-2.5', saving && 'shadow-none')}
				aria-label="Amount"
				aria-invalid={fieldAlert('amount') ? true : undefined}
				data-testid={testid}
			/>
		</InputGroup.Root>
		{@render fieldErrorAlert('amount', 'plan-field-error-amount')}
	</div>
{/snippet}

{#snippet feeField(testid: string)}
	<div class="space-y-2">
		<Label>Fee</Label>
		<InputGroup.Root data-disabled={saving ? true : undefined} class={cn(saving && 'shadow-none')}>
			<InputGroup.Addon class="bg-muted/60 border-input border-r px-2.5">
				<InputGroup.Text>{currencyLabel}</InputGroup.Text>
			</InputGroup.Addon>
			<InputGroup.Input
				name="fee"
				inputmode="numeric"
				autocomplete="off"
				placeholder="Optional"
				value={feeDisplay}
				onkeydown={onAmountKeydown}
				oninput={(e) => onFeeInput(e.currentTarget)}
				disabled={saving}
				class={cn('!pl-2.5', saving && 'shadow-none')}
				aria-label="Fee"
				data-testid={testid}
			/>
		</InputGroup.Root>
		{@render fieldErrorAlert('fee', 'plan-field-error-fee')}
	</div>
{/snippet}

{#snippet planForm()}
	<form
		class="flex min-h-0 flex-1 flex-col"
		data-testid={isAccept ? 'plan-accept-form' : 'plan-edit-form'}
		onsubmit={(e) => {
			e.preventDefault();
			void (isAccept ? saveAccept() : saveEdit());
		}}
	>
		<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
		<div class="space-y-2">
			{#if isAccept}
				<p class="text-muted-foreground text-sm">Description</p>
				<p class="text-base font-medium" data-testid="plan-description">
					{description.trim() || '—'}
				</p>
			{:else}
				<Label>Description</Label>
				<Input
					name="description"
					placeholder="Optional"
					bind:value={description}
					disabled={saving}
					aria-label="Description"
					data-testid="plan-description"
				/>
			{/if}
		</div>

		{#if isAccept && storedFrequency !== 'once'}
			<div class="space-y-2">
				<p class="text-muted-foreground text-sm">Repeat</p>
				<p class="text-base font-medium" data-testid="plan-repeat">
					{repeatOptionLabel(storedFrequency, editing?.dueOn ?? dueOn)}
				</p>
			</div>
		{/if}

		<Tabs.Root value={typeTab} onValueChange={onTypeTabChange} class="w-full" data-testid="plan-mode-tabs">
			<Tabs.List variant="default" class="w-full">
				<Tabs.Trigger
					value="income"
					disabled={saving}
					data-testid="plan-type-income"
					class="flex-1 data-active:bg-income/20 data-active:text-income dark:data-active:border-income/50 dark:data-active:bg-income/30"
				>
					Income
				</Tabs.Trigger>
				{#if canOfferTransfer}
					<Tabs.Trigger value="transfer" disabled={saving} data-testid="plan-mode-transfer" class="flex-1">
						Transfer
					</Tabs.Trigger>
				{/if}
				<Tabs.Trigger
					value="expense"
					disabled={saving}
					data-testid="plan-type-expense"
					class="flex-1 data-active:bg-destructive/20 data-active:text-destructive dark:data-active:border-destructive/50 dark:data-active:bg-destructive/35"
				>
					Expense
				</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		{#if typeTab === 'transfer'}
			{@render pocketPicker('Source', accounts, selectedAccountId, (id) => (selectedAccountId = id), 'plan-transfer-source')}
			{@render pocketPicker('Destination', accounts, transferDestId, (id) => (transferDestId = id), 'plan-transfer-dest')}
			{#if transferSamePocket}
				<p class="text-destructive text-sm" role="alert">Source and destination must be different</p>
			{/if}
			{@render amountField('plan-amount')}
			{@render feeField('plan-fee')}
		{:else}
			{@render pocketPicker(
				'Pocket',
				accounts,
				selectedAccountId,
				(id) => (selectedAccountId = id),
				'plan-pocket',
				hidePocketPicker
			)}
			{@render amountField('plan-amount')}
			{#if typeTab === 'expense'}
				{@render feeField('plan-fee')}
			{/if}
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
					disabled={saving}
					testid="plan-category"
					ariaLabel="Category"
				/>
			</div>
		{/if}

		<div class="space-y-2">
			<Label>{dateLabel}</Label>
			<DateField
				value={dueOn}
				onValueChange={(next) => {
					dueOn = next;
					if (fieldError?.key === 'occurredOn') clearFieldError();
				}}
				disabled={saving}
				aria-label={dateLabel}
				testid="plan-due"
				min={isAccept ? undefined : todayOccurredOn()}
			/>
			{@render fieldErrorAlert('occurredOn', 'plan-field-error-due')}
		</div>

		<div class="space-y-2">
			<Label>Note</Label>
			<Input name="note" placeholder="Optional" bind:value={note} disabled={saving} aria-label="Note" data-testid="plan-note" />
		</div>

		{#if !isAccept}
			<div class="space-y-2">
				<Label for="plan-repeat">Repeat</Label>
				<select
					id="plan-repeat"
					class="border-input bg-background h-11 w-full rounded-md border px-3 text-sm md:h-9"
					bind:value={frequency}
					disabled={saving}
					data-testid="plan-repeat"
					aria-label="Repeat"
				>
					<option value="once">{repeatOptionLabel('once', dueOn)}</option>
					<option value="weekly">{repeatOptionLabel('weekly', dueOn)}</option>
					<option value="monthly">{repeatOptionLabel('monthly', dueOn)}</option>
				</select>
			</div>
		{/if}

		{#if fieldAlert('form')}
			<p class="text-destructive text-sm" role="alert" data-testid="plan-field-error-form">
				{fieldAlert('form')}
			</p>
		{/if}

		{#if isEdit}
			<div class="border-border border-t pt-3">
				<Button
					type="button"
					variant="destructive"
					class="w-full"
					data-testid="plan-drop"
					onclick={() => (dropConfirmOpen = true)}
				>
					Drop plan
				</Button>
			</div>
		{/if}
		{#if isAccept}
			<div class="border-border border-t pt-3">
				<Button
					type="button"
					variant="destructive"
					class="w-full"
					data-testid="plan-skip"
					onclick={() => (skipConfirmOpen = true)}
				>
					Skip this occurrence
				</Button>
			</div>
		{/if}
		</div>

		<div
			class={cn(
				'border-border shrink-0 gap-2 border-t px-4 py-3',
				showSaveForNext ? 'grid grid-cols-1 sm:grid-cols-3' : 'grid grid-cols-2'
			)}
		>
			<Button
				type="button"
				variant="outline"
				class="w-full"
				disabled={saving}
				data-testid="plan-close"
				onclick={() => handleOpenChange(false)}
			>
				Cancel
			</Button>
			{#if showSaveForNext}
				<Button
					type="button"
					variant="outline"
					class="w-full"
					disabled={saveDisabled || !isDirty}
					data-testid="plan-save-for-next"
					onclick={() => void onSaveForNext()}
				>
					Save for next
				</Button>
			{/if}
			<Button type="submit" class="w-full" disabled={saveDisabled} data-testid="plan-save">
				{saving ? 'Saving…' : 'Save'}
			</Button>
		</div>
	</form>
{/snippet}

{#if desktop.current}
	<Dialog.Root {open} onOpenChange={handleOpenChange}>
		<Dialog.Content
			class="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0"
			data-testid="plan-dialog"
			showCloseButton={false}
			interactOutsideBehavior="close"
			escapeKeydownBehavior="close"
			{onInteractOutside}
			{onEscapeKeydown}
		>
			<Dialog.Header class="border-border shrink-0 border-b px-4 py-3 text-left">
				{@render planHeader(Dialog.Title, Dialog.Description)}
			</Dialog.Header>
			{@render planForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Sheet.Root {open} onOpenChange={handleOpenChange}>
		<Sheet.Content
			side="bottom"
			class="mx-auto flex max-h-[calc(100svh-2rem)] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
			data-testid="plan-sheet"
			showCloseButton={false}
			interactOutsideBehavior="close"
			escapeKeydownBehavior="close"
			{onInteractOutside}
			{onEscapeKeydown}
		>
			<Sheet.Header class="border-border shrink-0 border-b px-4 py-3 text-left">
				{@render planHeader(Sheet.Title, Sheet.Description)}
			</Sheet.Header>
			{@render planForm()}
		</Sheet.Content>
	</Sheet.Root>
{/if}

<ConfirmDialog
	open={discardConfirmOpen}
	title="Discard unsaved changes?"
	description="Your edits have not been saved and will be lost."
	confirmLabel="Discard"
	cancelLabel="Cancel"
	destructive
	confirmTestId="plan-discard-confirm"
	onOpenChange={(next) => (discardConfirmOpen = next)}
	onConfirm={confirmDiscard}
/>

<ConfirmDialog
	open={dropConfirmOpen}
	title="Drop this plan?"
	description="The reminder will be removed. Transactions already posted stay."
	confirmLabel="Drop"
	destructive
	dangerChrome
	confirmTestId="plan-drop-confirm"
	onOpenChange={(next) => (dropConfirmOpen = next)}
	onConfirm={confirmDrop}
/>

<ConfirmDialog
	open={skipConfirmOpen}
	title="Skip this occurrence?"
	description="No transaction will be posted. A one-shot plan is removed; a repeating plan moves to the next due date."
	confirmLabel="Skip this occurrence"
	destructive
	confirmTestId="plan-skip-confirm"
	onOpenChange={(next) => (skipConfirmOpen = next)}
	onConfirm={confirmSkip}
/>
