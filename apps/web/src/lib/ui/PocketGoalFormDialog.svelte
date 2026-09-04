<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import { classifyFormFieldError, type FormFieldKey } from '$lib/domain/form-field-error';
	import { assertGoalTarget } from '$lib/domain/goals';
	import {
		amountDigitsOnly,
		formatAmountDigitsDisplay,
		isBlockedAmountKey,
		isValidOccurredOn,
		parseAmountInput,
		todayOccurredOn
	} from '$lib/domain/transaction-rules';
	import { applyGroupedAmountInput } from '$lib/ui/amount-field-caret';
	import { cn } from '$lib/utils.js';
	import { shouldIgnoreDismissForNativePicker } from '$lib/ui/native-picker-dismiss';

	export type GoalFormSnapshot = {
		description: string;
		targetMinor: number;
		targetOn: string | null;
	};

	type Props = {
		open: boolean;
		mode: 'create' | 'edit';
		currencyLabel: string;
		initial: GoalFormSnapshot | null;
		onOpenChange: (open: boolean) => void;
		onSave: (input: {
			description: string;
			targetRaw: string;
			targetOn: string | null;
		}) => void | Promise<void>;
		onDrop?: () => void | Promise<void>;
	};

	let { open, mode, currencyLabel, initial, onOpenChange, onSave, onDrop }: Props = $props();

	let description = $state('');
	let targetRaw = $state('');
	let dateEnabled = $state(false);
	let targetOn = $state('');
	let error = $state<{ key: FormFieldKey; message: string } | null>(null);
	let busy = $state(false);
	let dropConfirmOpen = $state(false);
	let baseline = $state<GoalFormSnapshot | null>(null);

	const today = $derived(todayOccurredOn());
	const targetDisplay = $derived(formatAmountDigitsDisplay(targetRaw));

	const validTarget = $derived.by(() => {
		try {
			const n = parseAmountInput(targetRaw);
			assertGoalTarget(n);
			return true;
		} catch {
			return false;
		}
	});

	const dirty = $derived.by(() => {
		if (mode === 'create' || !baseline) return validTarget;
		const nextOn = dateEnabled && targetOn.trim() ? targetOn.trim() : null;
		return (
			description.trim() !== baseline.description ||
			targetRaw !== amountDigitsOnly(String(baseline.targetMinor)) ||
			nextOn !== baseline.targetOn
		);
	});

	const canSave = $derived(!busy && validTarget && dirty);

	$effect(() => {
		if (!open) return;
		description = initial?.description ?? '';
		targetRaw = initial ? amountDigitsOnly(String(initial.targetMinor)) : '';
		dateEnabled = Boolean(initial?.targetOn);
		targetOn = initial?.targetOn ?? '';
		error = null;
		baseline = initial
			? {
					description: initial.description,
					targetMinor: initial.targetMinor,
					targetOn: initial.targetOn
				}
			: null;
	});

	function onTargetInput(el: HTMLInputElement) {
		applyGroupedAmountInput(el, (digits) => {
			targetRaw = digits;
			if (error?.key === 'goalTarget' || error?.key === 'amount') error = null;
		});
	}

	function onTargetKeydown(event: KeyboardEvent) {
		if (isBlockedAmountKey(event)) event.preventDefault();
	}

	function onTargetPaste(event: ClipboardEvent) {
		event.preventDefault();
		targetRaw = amountDigitsOnly(event.clipboardData?.getData('text') ?? '');
		if (error?.key === 'goalTarget' || error?.key === 'amount') error = null;
	}

	function handleOpenChange(next: boolean) {
		if (!next && dropConfirmOpen) return;
		onOpenChange(next);
	}

	function onInteractOutside(e: PointerEvent) {
		if (shouldIgnoreDismissForNativePicker(e)) e.preventDefault();
	}

	async function submit() {
		if (!canSave) return;
		busy = true;
		error = null;
		try {
			const nextOn = dateEnabled ? targetOn.trim() : '';
			if (dateEnabled) {
				if (!isValidOccurredOn(nextOn)) throw new Error('Goal date must be YYYY-MM-DD');
				if (nextOn < today) throw new Error('Goal date cannot be earlier than today');
			}
			await onSave({
				description,
				targetRaw,
				targetOn: dateEnabled ? nextOn : null
			});
			onOpenChange(false);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Something went wrong';
			error = { key: classifyFormFieldError(message), message };
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content
		class="sm:max-w-md"
		data-testid="pocket-goal-form-dialog"
		interactOutsideBehavior="close"
		escapeKeydownBehavior="close"
		onInteractOutside={onInteractOutside}
	>
		<Dialog.Header>
			<Dialog.Title>{mode === 'create' ? 'Add goal' : 'Edit goal'}</Dialog.Title>
			<Dialog.Description>
				{mode === 'create' ? 'Set a target for this pocket.' : 'Update this goal.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void submit();
			}}
		>
			<div class="space-y-1">
				<Label for="pocket-goal-description">Description</Label>
				<Input
					id="pocket-goal-description"
					bind:value={description}
					placeholder="Optional"
					data-testid="pocket-goal-description-input"
				/>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1">
					<Label for="pocket-goal-target">Target</Label>
					<InputGroup.Root>
						<InputGroup.Addon class="bg-muted/60 border-input border-r px-2.5">
							<InputGroup.Text>{currencyLabel}</InputGroup.Text>
						</InputGroup.Addon>
						<InputGroup.Input
							id="pocket-goal-target"
							inputmode="numeric"
							autocomplete="off"
							placeholder="15,000"
							value={targetDisplay}
							data-testid="pocket-goal-target-input"
							aria-invalid={error?.key === 'goalTarget' || error?.key === 'amount' ? true : undefined}
							onkeydown={onTargetKeydown}
							onpaste={onTargetPaste}
							oninput={(e) => onTargetInput(e.currentTarget)}
							class="!pl-2.5"
						/>
					</InputGroup.Root>
					{#if error?.key === 'goalTarget' || error?.key === 'amount'}
						<p class="text-destructive text-sm" role="alert">{error.message}</p>
					{/if}
				</div>
				<div class="space-y-1">
					<Label for="pocket-goal-date">Date</Label>
					<DateField
						id="pocket-goal-date"
						value={targetOn}
						disabled={!dateEnabled}
						min={today}
						testid="pocket-goal-date-input"
						onValueChange={(next) => {
							targetOn = next;
							if (error?.key === 'goalDate' || error?.key === 'form') error = null;
						}}
					>
						{#snippet trailing()}
							<input
								type="checkbox"
								class="size-5 accent-primary md:size-4"
								bind:checked={dateEnabled}
								aria-label="Has date"
								data-testid="pocket-goal-date-enabled"
								onchange={() => {
									if (dateEnabled && !targetOn) targetOn = today;
									if (!dateEnabled) targetOn = '';
								}}
							/>
						{/snippet}
					</DateField>
					{#if error?.key === 'goalDate' || error?.key === 'form'}
						<p class="text-destructive text-sm" role="alert">{error.message}</p>
					{/if}
				</div>
			</div>
			{#if mode === 'edit' && onDrop}
				<div class="border-border border-t pt-3">
					<Button
						type="button"
						variant="destructive"
						class="w-full"
						data-testid="pocket-goal-drop"
						onclick={() => (dropConfirmOpen = true)}
					>
						Drop goal
					</Button>
				</div>
			{/if}
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" disabled={busy} onclick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={!canSave} data-testid="pocket-goal-save">Save</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={dropConfirmOpen}
	title="Drop this goal?"
	description="Dropped dated goals move to Past. Goals without a date are hidden."
	confirmLabel="Drop"
	destructive
	dangerChrome
	confirmTestId="pocket-goal-drop-confirm"
	onOpenChange={(next) => (dropConfirmOpen = next)}
	onConfirm={async () => {
		await onDrop?.();
		onOpenChange(false);
	}}
/>
