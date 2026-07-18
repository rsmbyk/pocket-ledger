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
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
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
		openingEnabled: boolean;
		openingRaw: string;
		openingAsOf: string;
		goalEnabled: boolean;
		goalTargetRaw: string;
		goalDateEnabled: boolean;
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
	let formOpeningEnabled = $state(false);
	let formOpeningRaw = $state('0');
	let formOpeningAsOf = $state(todayOccurredOn());
	let formGoalEnabled = $state(false);
	let formGoalTargetRaw = $state('');
	let formGoalDateEnabled = $state(false);
	let formGoalTargetOn = $state('');
	let formError = $state<{ key: FormFieldKey; message: string } | null>(null);
	let formBaseline = $state<FormBaseline | null>(null);

	let deleteTarget = $state<{ id: string; name: string } | null>(null);

	const formCreationDate = $derived(
		formMode === 'edit' && formPocketId
			? (pockets.find((p) => p.id === formPocketId)?.createdAt.slice(0, 10) ??
					todayOccurredOn())
			: todayOccurredOn()
	);

	const formDirty = $derived.by(() => {
		if (formMode === 'create') {
			return (
				formName.trim() !== '' ||
				formNotes.trim() !== '' ||
				formOpeningEnabled ||
				formGoalEnabled
			);
		}
		if (!formBaseline) return false;
		return (
			formName !== formBaseline.name ||
			formNotes !== formBaseline.notes ||
			formOpeningEnabled !== formBaseline.openingEnabled ||
			formOpeningRaw !== formBaseline.openingRaw ||
			formOpeningAsOf !== formBaseline.openingAsOf ||
			formGoalEnabled !== formBaseline.goalEnabled ||
			formGoalTargetRaw !== formBaseline.goalTargetRaw ||
			formGoalDateEnabled !== formBaseline.goalDateEnabled ||
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
			openingEnabled: formOpeningEnabled,
			openingRaw: formOpeningRaw,
			openingAsOf: formOpeningAsOf,
			goalEnabled: formGoalEnabled,
			goalTargetRaw: formGoalTargetRaw,
			goalDateEnabled: formGoalDateEnabled,
			goalTargetOn: formGoalTargetOn
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
		formGoalEnabled = false;
		formGoalTargetRaw = '';
		formGoalDateEnabled = false;
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
		formOpeningEnabled = p.openingEnabled;
		formOpeningRaw = String(p.openingBalanceMinor);
		formOpeningAsOf = p.openingAsOf;
		formGoalEnabled = p.goalEnabled;
		formGoalTargetRaw = p.goalTargetMinor != null ? String(p.goalTargetMinor) : '';
		formGoalDateEnabled = p.goalTargetOn != null;
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
			const openingBalanceMinor = formOpeningEnabled
				? parseSignedAmount(formOpeningRaw)
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
				let goalTargetMinor: number | null = null;
				let goalTargetOn: string | null = null;
				if (formGoalEnabled) {
					goalTargetMinor = formGoalTargetRaw.trim()
						? parseAmountInput(formGoalTargetRaw)
						: null;
					if (goalTargetMinor == null) throw new Error('Goal target is required');
					assertGoalTarget(goalTargetMinor);
					if (formGoalDateEnabled) {
						goalTargetOn = formGoalTargetOn.trim() || null;
						if (goalTargetOn && !isValidOccurredOn(goalTargetOn)) {
							throw new Error('Goal date must be YYYY-MM-DD');
						}
					}
				}
				await onUpdatePocket({
					id: formPocketId,
					name: formName,
					notes: formNotes,
					openingEnabled: formOpeningEnabled,
					openingBalanceMinor,
					openingAsOf,
					goalEnabled: formGoalEnabled,
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
	{@const hasGoal = p.goalEnabled && p.goalTargetMinor != null}
	{@const percent = hasGoal ? goalProgressPercent(p.goalTargetMinor!, balance) : 0}
	{@const remaining =
		hasGoal && p.goalTargetOn ? largestRemainingUnit(todayOccurredOn(), p.goalTargetOn) : null}
	<div class="flex items-stretch gap-2 px-4 py-3">
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
		<div class="flex shrink-0 flex-col items-end justify-between self-stretch gap-1">
			<p class="font-medium tabular-nums">{formatMinor(balance, currencyLabel)}</p>
			<div class="mt-auto flex gap-1">
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
	{#if p.notes.trim()}
		<div
			class="border-border text-muted-foreground border-t px-4 py-2 text-xs"
			data-testid="pocket-description"
		>
			{p.notes.trim()}
		</div>
	{/if}
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
				<Label for="pocket-notes">Description</Label>
				<Textarea
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
						class="size-4 accent-primary"
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
						<Input
							id="pocket-opening"
							bind:value={formOpeningRaw}
							inputmode="numeric"
							placeholder="0"
							disabled={!formOpeningEnabled}
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
							disabled={!formOpeningEnabled}
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
				{#if !formOpeningEnabled}
					<p class="text-muted-foreground text-xs" data-testid="pocket-opening-helper">
						Will be set to {formatMinor(0, currencyLabel)} as of {formatOccurredOnDisplay(
							formCreationDate
						)} (pocket creation date).
					</p>
				{/if}
			</div>
			{#if formMode === 'edit'}
				<div class="space-y-2">
					<label class="flex items-center gap-2 text-sm font-medium">
						<input
							type="checkbox"
							class="size-4 accent-primary"
							bind:checked={formGoalEnabled}
							data-testid="pocket-goal-enabled"
							onchange={() => {
								if (!formGoalEnabled) {
									formGoalTargetRaw = '';
									formGoalDateEnabled = false;
									formGoalTargetOn = '';
								}
							}}
						/>
						Set goal
					</label>
					<div class="grid grid-cols-2 gap-2">
						<div class="space-y-1">
							<Label for="pocket-goal-target">Goal target</Label>
							<Input
								id="pocket-goal-target"
								bind:value={formGoalTargetRaw}
								inputmode="numeric"
								placeholder="Target"
								disabled={!formGoalEnabled}
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
							<Label for="pocket-goal-date">Goal date</Label>
							<DateField
								id="pocket-goal-date"
								value={formGoalTargetOn}
								disabled={!formGoalEnabled || !formGoalDateEnabled}
								testid="pocket-goal-date-input"
								onValueChange={(next) => {
									formGoalTargetOn = next;
									if (formError?.key === 'goalDate') formError = null;
								}}
							>
								{#snippet trailing()}
									<input
										type="checkbox"
										class="size-3.5 accent-primary"
										bind:checked={formGoalDateEnabled}
										disabled={!formGoalEnabled}
										aria-label="Has date"
										data-testid="pocket-goal-date-enabled"
										onchange={() => {
											if (!formGoalDateEnabled) formGoalTargetOn = '';
										}}
									/>
								{/snippet}
							</DateField>
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
					{#if !formGoalEnabled}
						<p class="text-muted-foreground text-xs" data-testid="pocket-goal-helper">
							No goal will be saved for this pocket.
						</p>
					{/if}
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
