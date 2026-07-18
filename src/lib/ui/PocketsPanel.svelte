<script lang="ts">
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import PocketLabel from '$lib/ui/PocketLabel.svelte';
	import type { Account } from '$lib/domain/account';
	import type { CreatePocketInput, UpdatePocketInput } from '$lib/application/accounts';
	import { classifyFormFieldError, type FormFieldKey } from '$lib/domain/form-field-error';
	import { assertGoalTarget, goalProgressPercent } from '$lib/domain/goals';
	import { formatRemainingUnit, largestRemainingUnit } from '$lib/domain/goal-time';
	import { formatMinor } from '$lib/domain/money';
	import { isValidOccurredOn, parseAmountInput, todayOccurredOn } from '$lib/domain/transaction-rules';

	type Props = {
		pockets: Account[];
		balances: Record<string, number>;
		currencyLabel: string;
		onCreatePocket: (input: CreatePocketInput) => void | Promise<void>;
		onUpdatePocket: (input: UpdatePocketInput) => void | Promise<void>;
		onDeletePocket: (id: string) => void | Promise<void>;
		onReorderPockets: (orderedNonMainIds: string[]) => void | Promise<void>;
		onClearGoal: (id: string) => void | Promise<void>;
	};

	type FormBaseline = {
		name: string;
		notes: string;
		openingRaw: string;
		openingAsOf: string;
		goalTargetRaw: string;
		goalTargetOn: string;
	};

	let {
		pockets,
		balances,
		currencyLabel,
		onCreatePocket,
		onUpdatePocket,
		onDeletePocket,
		onReorderPockets,
		onClearGoal
	}: Props = $props();

	const flipDurationMs = 180;

	let busy = $state(false);
	let error = $state('');

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
	let formOpeningRaw = $state('');
	let formOpeningAsOf = $state(todayOccurredOn());
	let formGoalTargetRaw = $state('');
	let formGoalTargetOn = $state('');
	let formError = $state<{ key: FormFieldKey; message: string } | null>(null);
	let formBaseline = $state<FormBaseline | null>(null);

	let deleteTarget = $state<{ id: string; name: string } | null>(null);

	const formDirty = $derived.by(() => {
		if (formMode === 'create') return formName.trim() !== '';
		if (!formBaseline) return false;
		return (
			formName !== formBaseline.name ||
			formNotes !== formBaseline.notes ||
			formOpeningRaw !== formBaseline.openingRaw ||
			formOpeningAsOf !== formBaseline.openingAsOf ||
			formGoalTargetRaw !== formBaseline.goalTargetRaw ||
			formGoalTargetOn !== formBaseline.goalTargetOn
		);
	});

	async function runAction(action: () => void | Promise<void>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong';
			throw e;
		} finally {
			busy = false;
		}
	}

	function parseSignedAmount(raw: string): number {
		const trimmed = raw.trim().replace(/[,_\s]/g, '');
		if (!trimmed) return 0;
		if (!/^-?\d+$/.test(trimmed)) {
			throw new Error('Opening balance must be a whole number');
		}
		return Number(trimmed);
	}

	function snapshotForm(): FormBaseline {
		return {
			name: formName,
			notes: formNotes,
			openingRaw: formOpeningRaw,
			openingAsOf: formOpeningAsOf,
			goalTargetRaw: formGoalTargetRaw,
			goalTargetOn: formGoalTargetOn
		};
	}

	function openCreate() {
		formMode = 'create';
		formPocketId = null;
		formName = '';
		formNotes = '';
		formOpeningRaw = '';
		formOpeningAsOf = todayOccurredOn();
		formGoalTargetRaw = '';
		formGoalTargetOn = '';
		formError = null;
		formBaseline = snapshotForm();
		formOpen = true;
	}

	function openEdit(p: Account) {
		formMode = 'edit';
		formPocketId = p.id;
		formName = p.name;
		formNotes = p.notes;
		formOpeningRaw = String(p.openingBalanceMinor);
		formOpeningAsOf = p.openingAsOf;
		formGoalTargetRaw = p.goalTargetMinor != null ? String(p.goalTargetMinor) : '';
		formGoalTargetOn = p.goalTargetOn ?? '';
		formError = null;
		formBaseline = snapshotForm();
		formOpen = true;
	}

	async function submitForm() {
		if (!formDirty || !formName.trim()) return;
		busy = true;
		formError = null;
		try {
			const openingBalanceMinor = parseSignedAmount(formOpeningRaw);
			const openingAsOf = formOpeningAsOf.trim() || todayOccurredOn();
			if (!isValidOccurredOn(openingAsOf)) {
				throw new Error('As-of date must be YYYY-MM-DD');
			}
			if (formMode === 'create') {
				await onCreatePocket({
					name: formName,
					notes: formNotes,
					openingBalanceMinor,
					openingAsOf
				});
			} else if (formPocketId) {
				const goalTargetMinor = formGoalTargetRaw.trim()
					? parseAmountInput(formGoalTargetRaw)
					: null;
				if (goalTargetMinor != null) assertGoalTarget(goalTargetMinor);
				const goalTargetOn =
					goalTargetMinor != null && formGoalTargetOn.trim() ? formGoalTargetOn.trim() : null;
				await onUpdatePocket({
					id: formPocketId,
					name: formName,
					notes: formNotes,
					openingBalanceMinor,
					openingAsOf,
					goalTargetMinor,
					goalTargetOn
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

	function requestDelete(p: Account) {
		if (p.isMain) return;
		deleteTarget = { id: p.id, name: p.name };
	}

	function handleConsider(e: CustomEvent<DndEvent<Account>>) {
		items = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent<DndEvent<Account>>) {
		const next = e.detail.items;
		items = next;
		try {
			await runAction(() => onReorderPockets(next.map((p) => p.id)));
		} catch {
			items = pockets.filter((p) => !p.isMain);
		}
	}
</script>

{#snippet pocketRow(p: Account, draggable: boolean)}
	{@const balance = balances[p.id] ?? 0}
	{@const hasGoal = p.goalTargetMinor != null}
	{@const percent = hasGoal ? goalProgressPercent(p.goalTargetMinor!, balance) : 0}
	{@const remaining =
		hasGoal && p.goalTargetOn ? largestRemainingUnit(todayOccurredOn(), p.goalTargetOn) : null}
	<div class="flex items-center gap-2 px-4 py-3">
		{#if draggable}
			<button
				type="button"
				use:dragHandle
				class="dnd-handle text-muted-foreground hover:text-foreground shrink-0 cursor-grab rounded-sm p-1 active:cursor-grabbing"
				aria-label={`Drag to reorder ${p.name}`}
			>
				<GripVerticalIcon class="size-4" aria-hidden="true" />
			</button>
		{:else}
			<span class="size-4 shrink-0" aria-hidden="true"></span>
		{/if}
		<div class="min-w-0 flex-1">
			<PocketLabel
				name={p.name}
				isMain={p.isMain}
				class="font-medium"
				iconTestid={p.isMain ? 'pocket-main-icon' : undefined}
			/>
			{#if hasGoal}
				<div class="mt-1.5 max-w-xs space-y-1">
					<p class="text-muted-foreground text-xs">
						{formatMinor(Math.max(0, balance), currencyLabel)} / {formatMinor(
							p.goalTargetMinor!,
							currencyLabel
						)} · {percent}%
					</p>
					{#if remaining}
						<p class="text-muted-foreground text-xs" data-testid="pocket-goal-remaining">
							{formatRemainingUnit(remaining)}
						</p>
					{/if}
					<div class="bg-muted h-1.5 overflow-hidden rounded-full">
						<div class="bg-primary h-full rounded-full" style={`width: ${percent}%`}></div>
					</div>
				</div>
			{/if}
		</div>
		<div class="flex shrink-0 flex-col items-end gap-1">
			<p class="font-medium tabular-nums">{formatMinor(balance, currencyLabel)}</p>
			<div class="flex gap-1">
				{#if hasGoal}
					<Button
						size="icon-sm"
						variant="ghost"
						aria-label={`Clear goal for ${p.name}`}
						data-testid="pocket-clear-goal"
						disabled={busy}
						onclick={() => void runAction(() => onClearGoal(p.id))}
					>
						<XIcon class="size-4" />
					</Button>
				{/if}
				<Button
					size="icon-sm"
					variant="outline"
					aria-label={`Edit ${p.name}`}
					data-testid="pocket-edit"
					disabled={busy}
					onclick={() => openEdit(p)}
				>
					<PencilIcon class="size-4" />
				</Button>
				{#if !p.isMain}
					<Button
						size="icon-sm"
						variant="destructive"
						aria-label={`Delete ${p.name}`}
						data-testid="pocket-delete"
						disabled={busy}
						onclick={() => requestDelete(p)}
					>
						<Trash2Icon class="size-4" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<div class="space-y-3" data-testid="pockets-panel">
	<div class="flex items-center justify-end">
		<Button
			type="button"
			size="sm"
			variant="outline"
			disabled={busy}
			data-testid="pocket-add"
			onclick={openCreate}
		>
			<PlusIcon class="size-4" />
			Add Pocket
		</Button>
	</div>
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}
	{#if mainPocket}
		<Card.Root class="gap-0 overflow-hidden py-0" data-testid={`pocket-row-${mainPocket.id}`}>
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
				<Card.Root class="gap-0 overflow-hidden py-0" data-testid={`pocket-row-${p.id}`}>
					{@render pocketRow(p, true)}
				</Card.Root>
			</div>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={formOpen}>
	<Dialog.Content class="sm:max-w-md" data-testid="pocket-form-dialog">
		<Dialog.Header>
			<Dialog.Title>{formMode === 'create' ? 'Add pocket' : 'Edit pocket'}</Dialog.Title>
			<Dialog.Description>
				{formMode === 'create'
					? 'Create a pocket to track money separately.'
					: `Update details for ${formName || 'this pocket'}.`}
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
					required
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
				<Label for="pocket-notes">Notes</Label>
				<Textarea
					id="pocket-notes"
					bind:value={formNotes}
					placeholder="Optional"
					data-testid="pocket-notes-input"
				/>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1">
					<Label for="pocket-opening">Opening balance</Label>
					<Input
						id="pocket-opening"
						bind:value={formOpeningRaw}
						inputmode="numeric"
						placeholder="0"
						data-testid="pocket-opening-input"
						aria-invalid={formError?.key === 'opening' ? true : undefined}
						oninput={() => {
							if (formError?.key === 'opening') formError = null;
						}}
					/>
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
						testid="pocket-asof-input"
						onValueChange={(next) => {
							formOpeningAsOf = next;
							if (formError?.key === 'asOf' || formError?.key === 'occurredOn') formError = null;
						}}
					/>
					{#if formError?.key === 'asOf' || formError?.key === 'occurredOn'}
						<p class="text-destructive text-sm" role="alert" data-testid="pocket-field-error-asOf">
							{formError.message}
						</p>
					{/if}
				</div>
			</div>
			{#if formMode === 'edit'}
				<div class="grid grid-cols-2 gap-2">
					<div class="space-y-1">
						<Label for="pocket-goal-target">Goal target</Label>
						<Input
							id="pocket-goal-target"
							bind:value={formGoalTargetRaw}
							inputmode="numeric"
							placeholder="No goal"
							data-testid="pocket-goal-target-input"
							aria-invalid={formError?.key === 'goalTarget' || formError?.key === 'amount'
								? true
								: undefined}
							oninput={() => {
								if (formError?.key === 'goalTarget' || formError?.key === 'amount') {
									formError = null;
								}
							}}
						/>
						{#if formError?.key === 'goalTarget' || formError?.key === 'amount'}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="pocket-field-error-goalTarget"
							>
								{formError.message}
							</p>
						{/if}
					</div>
					<div class="space-y-1">
						<Label for="pocket-goal-date">Goal date (optional)</Label>
						<DateField
							id="pocket-goal-date"
							value={formGoalTargetOn}
							testid="pocket-goal-date-input"
							onValueChange={(next) => {
								formGoalTargetOn = next;
								if (formError?.key === 'goalDate') formError = null;
							}}
						/>
						{#if formError?.key === 'goalDate'}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="pocket-field-error-goalDate"
							>
								{formError.message}
							</p>
						{/if}
					</div>
				</div>
			{/if}
			{#if formError?.key === 'form'}
				<p class="text-destructive text-sm" role="alert" data-testid="pocket-field-error-form">
					{formError.message}
				</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={busy}
					onclick={() => (formOpen = false)}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={busy || !formDirty} data-testid="pocket-save">
					{formMode === 'create' ? 'Create' : 'Save'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={deleteTarget !== null}
	title="Delete pocket?"
	description={deleteTarget
		? `Delete "${deleteTarget.name}"? This cannot be undone. Pockets with transactions must be emptied or voided first.`
		: 'This cannot be undone.'}
	confirmLabel="Delete"
	destructive
	dangerChrome
	confirmTestId="pocket-delete-confirm"
	onOpenChange={(open) => {
		if (!open) deleteTarget = null;
	}}
	onConfirm={async () => {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		await runAction(() => onDeletePocket(id));
		deleteTarget = null;
	}}
/>
