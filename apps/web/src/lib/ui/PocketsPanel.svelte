<script lang="ts">
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import GoalProgressChrome from '$lib/ui/GoalProgressChrome.svelte';
	import type { Account } from '$lib/domain/account';
	import { DEFAULT_ACCOUNT_NAME, isUnsetMainName, pocketDisplayName } from '$lib/domain/account';
	import {
		pocketDeleteBlockers,
		type CreatePocketInput,
		type UpdatePocketInput
	} from '$lib/application/accounts';
	import { pocketDetailsPath } from '$lib/shared/router';
	import { classifyFormFieldError, type FormFieldKey } from '$lib/domain/form-field-error';
	import { goalProgressPercent, previewGoal, type PocketGoal } from '$lib/domain/goals';
	import { formatMinor } from '$lib/domain/money';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import {
		amountDigitsOnly,
		formatAmountDigitsDisplay,
		isBlockedAmountKey,
		isValidOccurredOn,
		parseNonNegativeAmountInput,
		todayOccurredOn
	} from '$lib/domain/transaction-rules';
	import { applyGroupedAmountInput } from '$lib/ui/amount-field-caret';
	import { cn } from '$lib/utils.js';
	import { shouldIgnoreDismissForNativePicker } from '$lib/ui/native-picker-dismiss';
	import { Popover } from 'bits-ui';

	type Props = {
		pockets: Account[];
		balances: Record<string, number>;
		currencyLabel: string;
		goals: PocketGoal[];
		onCreatePocket: (input: CreatePocketInput) => void | Promise<void>;
		onUpdatePocket: (input: UpdatePocketInput) => void | Promise<void>;
		onDeletePocket: (id: string) => void | Promise<void>;
		onReorderPockets: (orderedNonMainIds: string[]) => void | Promise<void>;
		/** When set, open the existing edit dialog for this pocket (spec 148). */
		requestEdit?: Account | null;
		onRequestEditConsumed?: () => void;
		/** Hide the list; keep dialogs mounted (details page). */
		hideList?: boolean;
	};

	type FormBaseline = {
		name: string;
		notes: string;
		openingEnabled: boolean;
		openingRaw: string;
		openingAsOf: string;
	};

	let {
		pockets,
		balances,
		currencyLabel,
		goals,
		onCreatePocket,
		onUpdatePocket,
		onDeletePocket,
		onReorderPockets,
		requestEdit = null,
		onRequestEditConsumed,
		hideList = false
	}: Props = $props();

	const flipDurationMs = 180;

	let busy = $state(false);
	let dragging = $state(false);

	let items = $state<Account[]>([]);
	$effect(() => {
		items = pockets.filter((p) => !p.isMain);
	});

	const mainPocket = $derived(pockets.find((p) => p.isMain) ?? null);

	let formOpen = $state(false);
	let formMode = $state<'create' | 'edit'>('create');
	let formPocketId = $state<string | null>(null);
	let formName = $state('');
	let formNotes = $state('');
	let formOpeningEnabled = $state(false);
	let formOpeningRaw = $state('0');
	let formOpeningAsOf = $state(todayOccurredOn());
	let formError = $state<{ key: FormFieldKey; message: string } | null>(null);
	let formBaseline = $state<FormBaseline | null>(null);
	let formTitleName = $state('');
	let discardConfirmOpen = $state(false);
	let deleteConfirmOpen = $state(false);
	let deleteBlockedOpen = $state(false);
	let deleteBlockers = $state<string[]>([]);

	const formCreationDate = $derived(
		formMode === 'edit' && formPocketId
			? (pockets.find((p) => p.id === formPocketId)?.createdAt.slice(0, 10) ?? todayOccurredOn())
			: todayOccurredOn()
	);
	const formPocket = $derived(
		formMode === 'edit' && formPocketId ? (pockets.find((p) => p.id === formPocketId) ?? null) : null
	);
	const showDelete = $derived(Boolean(formPocket && !formPocket.isMain));
	const formNameRequired = $derived(formMode === 'create' || Boolean(formPocket && !formPocket.isMain));

	const formDirty = $derived.by(() => {
		if (formMode === 'create') {
			return formName.trim() !== '' || formNotes.trim() !== '' || formOpeningEnabled;
		}
		if (!formBaseline) return false;
		return (
			formName !== formBaseline.name ||
			formNotes !== formBaseline.notes ||
			formOpeningEnabled !== formBaseline.openingEnabled ||
			formOpeningRaw !== formBaseline.openingRaw ||
			formOpeningAsOf !== formBaseline.openingAsOf
		);
	});
	const canSavePocket = $derived(formDirty && (!formNameRequired || formName.trim() !== ''));

	const formOpeningDisplay = $derived(formatAmountDigitsDisplay(formOpeningRaw));

	async function runAction(action: () => void | Promise<void>) {
		busy = true;
		try {
			await action();
		} finally {
			busy = false;
		}
	}

	function onOpeningInput(el: HTMLInputElement) {
		applyGroupedAmountInput(el, (digits) => {
			formOpeningRaw = digits;
			if (formError?.key === 'opening') formError = null;
		});
	}

	function onOpeningKeydown(event: KeyboardEvent) {
		if (isBlockedAmountKey(event)) event.preventDefault();
	}

	function onOpeningPaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text') ?? '';
		formOpeningRaw = amountDigitsOnly(text);
		if (formError?.key === 'opening') formError = null;
	}

	function snapshotForm(): FormBaseline {
		return {
			name: formName,
			notes: formNotes,
			openingEnabled: formOpeningEnabled,
			openingRaw: formOpeningRaw,
			openingAsOf: formOpeningAsOf
		};
	}

	function openCreate() {
		formMode = 'create';
		formPocketId = null;
		formName = '';
		formNotes = '';
		formOpeningEnabled = false;
		formOpeningRaw = '0';
		formOpeningAsOf = todayOccurredOn();
		formError = null;
		formTitleName = '';
		formBaseline = snapshotForm();
		formOpen = true;
	}

	function openEdit(p: Account) {
		formMode = 'edit';
		formPocketId = p.id;
		formName = isUnsetMainName(p) ? '' : p.name;
		formNotes = p.notes;
		formOpeningEnabled = p.openingEnabled;
		formOpeningRaw = String(Math.max(0, p.openingBalanceMinor));
		formOpeningAsOf = p.openingAsOf;
		formError = null;
		formTitleName = pocketDisplayName(p);
		formBaseline = snapshotForm();
		formOpen = true;
	}

	function requestFormDiscard() {
		if (!formDirty) {
			formOpen = false;
			return;
		}
		discardConfirmOpen = true;
	}

	function handleFormOpenChange(next: boolean) {
		if (next) {
			formOpen = true;
			return;
		}
		requestFormDiscard();
	}

	function onFormInteractOutside(e: PointerEvent) {
		if (shouldIgnoreDismissForNativePicker(e)) {
			e.preventDefault();
			return;
		}
		if (!formDirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (formDirty) discardConfirmOpen = true;
	}

	function onFormEscapeKeydown(e: KeyboardEvent) {
		if (!formDirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (formDirty) discardConfirmOpen = true;
	}

	function confirmFormDiscard() {
		discardConfirmOpen = false;
		formOpen = false;
	}

	async function submitForm() {
		if (!canSavePocket) return;
		busy = true;
		formError = null;
		try {
			const openingBalanceMinor = formOpeningEnabled
				? parseNonNegativeAmountInput(formOpeningRaw)
				: 0;
			const openingAsOf = formOpeningEnabled
				? formOpeningAsOf.trim() || formCreationDate
				: formCreationDate;
			if (formOpeningEnabled && !isValidOccurredOn(openingAsOf)) {
				throw new Error('As-of date must be YYYY-MM-DD');
			}
			if (formMode === 'create') {
				await onCreatePocket({
					name: formName,
					notes: formNotes,
					openingEnabled: formOpeningEnabled,
					openingBalanceMinor,
					openingAsOf
				});
			} else if (formPocketId) {
				await onUpdatePocket({
					id: formPocketId,
					name: formName,
					notes: formNotes,
					openingEnabled: formOpeningEnabled,
					openingBalanceMinor,
					openingAsOf
				});
			}
			formOpen = false;
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Something went wrong';
			formError = { key: classifyFormFieldError(message), message };
		} finally {
			busy = false;
		}
	}

	function handleConsider(e: CustomEvent<DndEvent<Account>>) {
		dragging = true;
		items = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent<DndEvent<Account>>) {
		dragging = false;
		const next = e.detail.items;
		items = next;
		try {
			await runAction(() => onReorderPockets(next.map((p) => p.id)));
		} catch {
			items = pockets.filter((p) => !p.isMain);
		}
	}

	async function onDeletePocketClick() {
		if (!formPocketId) return;
		const reasons = await pocketDeleteBlockers(formPocketId);
		if (reasons.length > 0) {
			deleteBlockers = reasons;
			deleteBlockedOpen = true;
			return;
		}
		deleteBlockedOpen = false;
		deleteConfirmOpen = true;
	}

	async function confirmDeletePocket() {
		if (!formPocketId) return;
		await onDeletePocket(formPocketId);
		formOpen = false;
	}

	$effect(() => {
		const target = requestEdit;
		if (!target) return;
		openEdit(target);
		onRequestEditConsumed?.();
	});
</script>

{#snippet pocketRow(p: Account, draggable: boolean)}
	{@const balance = balances[p.id] ?? 0}
	{@const preview = previewGoal(
		goals.filter((g) => g.accountId === p.id),
		todayOccurredOn()
	)}
	{@const href = pocketDetailsPath(p.id)}
	{@const description = p.notes.trim()}
	<a
		href={href}
		class="absolute inset-0 z-0"
		aria-label={`Open ${pocketDisplayName(p)}`}
	></a>
	<div class="pointer-events-none relative z-10 flex items-stretch gap-2 px-4 py-3">
		{#if draggable}
			<span
				use:dragHandle
				class="dnd-handle text-muted-foreground hover:text-foreground pointer-events-auto -my-3 flex shrink-0 cursor-grab items-center self-stretch rounded-sm p-1 active:cursor-grabbing"
				aria-label={`Drag to reorder ${pocketDisplayName(p)}`}
			>
				<GripVerticalIcon class="size-4" aria-hidden="true" />
			</span>
		{:else}
			<span class="-my-3 w-6 shrink-0 self-stretch" aria-hidden="true"></span>
		{/if}
		<div class="min-w-0 flex-1 self-start">
			<PocketLabel
				name={p.name}
				isMain={p.isMain}
				class="font-medium"
				iconTestid={p.isMain ? 'pocket-main-icon' : undefined}
			/>
			{#if description}
				<p class="text-muted-foreground truncate text-xs" data-testid="pocket-description">
					{description}
				</p>
			{/if}
			{#if preview}
				<GoalProgressChrome
					class="mt-1.5 max-w-xs"
					currentMinor={balance}
					targetMinor={preview.targetMinor}
					percent={goalProgressPercent(preview.targetMinor, balance)}
					targetOn={preview.targetOn}
					{currencyLabel}
				/>
			{/if}
		</div>
		<p class="shrink-0 self-start font-medium tabular-nums">
			{formatMinor(balance, currencyLabel)}
		</p>
	</div>
{/snippet}

<div class={['space-y-3', hideList && 'hidden']} data-testid="pockets-panel">
	<div class="flex items-center justify-end">
		<Button
			type="button"
			size="sm"
			disabled={busy}
			data-testid="pocket-add"
			onclick={openCreate}
		>
			<PlusIcon class="size-4" />
			Add Pocket
		</Button>
	</div>
	{#if mainPocket}
		<Card.Root
			class={cn(
				'relative gap-0 overflow-hidden py-0',
				dragging && 'opacity-60',
				!dragging &&
					'hover:bg-accent/70 hover:ring-foreground/20 focus-within:bg-accent/70 focus-within:ring-foreground/20'
			)}
			data-testid={`pocket-row-${mainPocket.id}`}
			data-dnd-locked={dragging ? 'true' : undefined}
		>
			{@render pocketRow(mainPocket, false)}
		</Card.Root>
	{/if}
	<div
		class="space-y-3"
		use:dragHandleZone={{ items, flipDurationMs, type: 'pockets', dragDisabled: busy }}
		onconsider={handleConsider}
		onfinalize={(e) => void handleFinalize(e)}
		aria-label="Non-Main pockets"
	>
		{#each items as p (p.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				<Card.Root
					class={cn(
						'relative gap-0 overflow-hidden py-0',
						!dragging &&
							'hover:bg-accent/70 hover:ring-foreground/20 focus-within:bg-accent/70 focus-within:ring-foreground/20'
					)}
					data-testid={`pocket-row-${p.id}`}
				>
					{@render pocketRow(p, true)}
				</Card.Root>
			</div>
		{/each}
	</div>
</div>

<Dialog.Root open={formOpen} onOpenChange={handleFormOpenChange}>
	<Dialog.Content
		class="sm:max-w-md"
		data-testid="pocket-form-dialog"
		interactOutsideBehavior="close"
		escapeKeydownBehavior="close"
		onInteractOutside={onFormInteractOutside}
		onEscapeKeydown={onFormEscapeKeydown}
	>
		<Dialog.Header>
			<Dialog.Title>{formMode === 'create' ? 'Add pocket' : 'Edit pocket'}</Dialog.Title>
			<Dialog.Description>
				{formMode === 'create'
					? 'Create a pocket to track money separately.'
					: `Update details for ${formTitleName || 'this pocket'}.`}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void submitForm();
			}}
		>
			<div class="space-y-1">
				<Label for="pocket-name">Name</Label>
				<Input
					id="pocket-name"
					bind:value={formName}
					required={formNameRequired}
					placeholder={formPocket?.isMain ? DEFAULT_ACCOUNT_NAME : undefined}
					data-testid="pocket-name-input"
					aria-invalid={formError?.key === 'name' ? true : undefined}
					oninput={() => {
						if (formError?.key === 'name') formError = null;
					}}
				/>
				{#if formError?.key === 'name'}
					<p class="text-destructive text-sm" role="alert" data-testid="pocket-field-error-name">
						{formError.message}
					</p>
				{/if}
			</div>
			<div class="space-y-1">
				<Label for="pocket-notes">Description</Label>
				<Input
					id="pocket-notes"
					bind:value={formNotes}
					placeholder="Optional"
					data-testid="pocket-description-input"
				/>
			</div>
			<div class="space-y-2">
				<label class="flex items-center gap-2 text-sm font-medium">
					<input
						type="checkbox"
						class="size-5 accent-primary md:size-4"
						bind:checked={formOpeningEnabled}
						data-testid="pocket-opening-enabled"
						onchange={() => {
							if (!formOpeningEnabled) {
								formOpeningRaw = '0';
								formOpeningAsOf = formCreationDate;
							}
						}}
					/>
					Set opening balance
				</label>
				<div class="grid grid-cols-2 gap-2">
					<div class="space-y-1">
						<Label for="pocket-opening">Opening balance</Label>
						<InputGroup.Root
							data-disabled={!formOpeningEnabled ? true : undefined}
							class={cn(!formOpeningEnabled && 'shadow-none')}
						>
							<InputGroup.Addon class="bg-muted/60 border-input border-r px-2.5">
								<InputGroup.Text>{currencyLabel}</InputGroup.Text>
							</InputGroup.Addon>
							<InputGroup.Input
								id="pocket-opening"
								inputmode="numeric"
								autocomplete="off"
								placeholder="15,000"
								value={formOpeningDisplay}
								disabled={!formOpeningEnabled}
								data-testid="pocket-opening-input"
								aria-invalid={formError?.key === 'opening' ? true : undefined}
								onkeydown={onOpeningKeydown}
								onpaste={onOpeningPaste}
								oninput={(e) => onOpeningInput(e.currentTarget)}
								class={cn('!pl-2.5', !formOpeningEnabled && 'shadow-none')}
							/>
						</InputGroup.Root>
						{#if formError?.key === 'opening'}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="pocket-field-error-opening"
							>
								{formError.message}
							</p>
						{/if}
					</div>
					<div class="space-y-1">
						<Label for="pocket-asof">As of</Label>
						<DateField
							id="pocket-asof"
							value={formOpeningAsOf}
							disabled={!formOpeningEnabled}
							testid="pocket-asof-input"
							onValueChange={(next) => {
								formOpeningAsOf = next;
								if (formError?.key === 'asOf' || formError?.key === 'occurredOn') formError = null;
							}}
						/>
						{#if formError?.key === 'asOf' || formError?.key === 'occurredOn'}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="pocket-field-error-asOf"
							>
								{formError.message}
							</p>
						{/if}
					</div>
				</div>
				{#if !formOpeningEnabled}
					<p class="text-muted-foreground text-xs" data-testid="pocket-opening-helper">
						Will be set to {formatMinor(0, currencyLabel)} as of {formatOccurredOnDisplay(
							formCreationDate
						)} (pocket creation date).
					</p>
				{/if}
			</div>
			{#if formError?.key === 'form'}
				<p class="text-destructive text-sm" role="alert" data-testid="pocket-field-error-form">
					{formError.message}
				</p>
			{/if}
			{#if showDelete}
				<div class="border-destructive/30 space-y-2 border-t pt-3">
					<Popover.Root bind:open={deleteBlockedOpen}>
						<Popover.Trigger
							type="button"
							class="ring-offset-background focus-visible:ring-ring inline-flex h-9 w-full items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-2 focus-visible:outline-none"
							data-testid="pocket-delete"
							onclick={(e) => {
								e.preventDefault();
								void onDeletePocketClick();
							}}
						>
							Delete pocket
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Content
								class="bg-popover text-popover-foreground z-[70] w-72 rounded-md border p-3 text-sm shadow-md"
								side="top"
								sideOffset={8}
								data-testid="pocket-delete-blocked"
							>
								<ul class="space-y-2">
									{#each deleteBlockers as reason}
										<li>{reason}</li>
									{/each}
								</ul>
							</Popover.Content>
						</Popover.Portal>
					</Popover.Root>
				</div>
			{/if}
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={busy}
					onclick={() => requestFormDiscard()}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={busy || !canSavePocket} data-testid="pocket-save">
					Save
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={discardConfirmOpen}
	title="Discard unsaved changes?"
	description="Your edits will be lost if you leave without saving."
	confirmLabel="Discard"
	destructive
	confirmTestId="pocket-discard-confirm"
	onOpenChange={(next) => (discardConfirmOpen = next)}
	onConfirm={confirmFormDiscard}
/>

<ConfirmDialog
	open={deleteConfirmOpen}
	title="Delete this pocket?"
	description="This cannot be undone. Opening balance, notes, and past goals on this pocket go away with it."
	confirmLabel="Delete"
	destructive
	dangerChrome
	confirmTestId="pocket-delete-confirm"
	onOpenChange={(next) => (deleteConfirmOpen = next)}
	onConfirm={confirmDeletePocket}
/>
