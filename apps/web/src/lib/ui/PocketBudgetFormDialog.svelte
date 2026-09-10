<script lang="ts">
	import { untrack } from 'svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DateField from '$lib/ui/DateField.svelte';
	import { classifyFormFieldError, type FormFieldKey } from '$lib/domain/form-field-error';
	import {
		assertBudgetLimit,
		assertBudgetStartOn,
		groupSelectionState,
		hydrateBudgetScope,
		isAllSelectable,
		resolveAppliesTo,
		withGroupToggled,
		type BudgetPeriod,
		type PocketBudget
	} from '$lib/domain/budgets';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import {
		amountDigitsOnly,
		formatAmountDigitsDisplay,
		isBlockedAmountKey,
		isValidOccurredOn,
		parseAmountInput,
		todayOccurredOn
	} from '$lib/domain/transaction-rules';
	import { filterCatalogGroups } from '$lib/domain/category-catalog-filter';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import { applyGroupedAmountInput } from '$lib/ui/amount-field-caret';
	import { shouldIgnoreDismissForNativePicker } from '$lib/ui/native-picker-dismiss';
	import {
		BUDGET_CREATE_BASELINE,
		isBudgetFormDirty,
		type BudgetFormBaseline
	} from '$lib/application/budget-form-dirty';
	import { cn } from '$lib/utils.js';

	type Props = {
		open: boolean;
		mode: 'create' | 'edit';
		currencyLabel: string;
		categories: CategoryRow[];
		groups: OverlayGroup[];
		initial: PocketBudget | null;
		initialStartOn: string;
		onOpenChange: (open: boolean) => void;
		onSave: (input: {
			selectedIds: string[];
			allSelectableIds: string[];
			limitRaw: string;
			startOn: string;
			period: BudgetPeriod;
			hardLimit: boolean;
		}) => void | Promise<void>;
		onDrop?: () => void | Promise<void>;
		onRestart?: () => void | Promise<void>;
	};

	let {
		open,
		mode,
		currencyLabel,
		categories,
		groups,
		initial,
		initialStartOn,
		onOpenChange,
		onSave,
		onDrop,
		onRestart
	}: Props = $props();

	let selectedIds = $state<string[]>([]);
	let limitRaw = $state('');
	let startOn = $state('');
	let period = $state<BudgetPeriod>('ongoing');
	let hardLimit = $state(false);
	let collapsed = $state<Record<string, boolean>>({});
	let appliesQuery = $state('');
	let error = $state<{ key: FormFieldKey; message: string } | null>(null);
	let busy = $state(false);
	let dropConfirmOpen = $state(false);
	let restartConfirmOpen = $state(false);
	let discardConfirmOpen = $state(false);
	let baseline = $state<BudgetFormBaseline>(BUDGET_CREATE_BASELINE(todayOccurredOn()));

	const today = $derived(todayOccurredOn());
	const expenseGroups = $derived(groups.filter((g) => g.kind === 'expense'));
	const expenseCats = $derived(categories.filter((c) => c.kind === 'expense'));
	const allSelectableIds = $derived(expenseCats.map((c) => c.id));
	const selectedSet = $derived(new Set(selectedIds));
	const allSelected = $derived(isAllSelectable(selectedSet, allSelectableIds));
	const filteredApplies = $derived(filterCatalogGroups(expenseGroups, expenseCats, appliesQuery));
	const appliesCatalog = $derived({
		groups: expenseGroups.map((g) => ({ id: g.id, name: g.name, kind: g.kind })),
		categories: expenseCats.map((c) => ({ id: c.id, name: c.name, groupId: c.groupId }))
	});
	const limitDisplay = $derived(formatAmountDigitsDisplay(limitRaw));

	const validLimit = $derived.by(() => {
		try {
			assertBudgetLimit(parseAmountInput(limitRaw));
			return true;
		} catch {
			return false;
		}
	});
	const validStart = $derived(isValidOccurredOn(startOn) && startOn <= today);
	const scopeOk = $derived(
		resolveAppliesTo(selectedIds, allSelectableIds, appliesCatalog).appliesTo === 'pocket' ||
			selectedIds.length > 0
	);
	const dirty = $derived(
		isBudgetFormDirty(
			{ selectedIds, limitRaw, startOn, period, hardLimit },
			baseline,
			allSelectableIds,
			appliesCatalog
		)
	);
	const canSave = $derived(!busy && validLimit && validStart && scopeOk && dirty);

	function selectedForBudget(row: PocketBudget | null): string[] {
		if (!row) return [];
		const scoped = hydrateBudgetScope(row, appliesCatalog);
		if (scoped.appliesTo === 'pocket') return [...allSelectableIds];
		const ids = new Set(scoped.categoryIds);
		const sticky = new Set(scoped.groupIds);
		for (const cat of expenseCats) {
			if (sticky.has(cat.groupId)) ids.add(cat.id);
		}
		return [...ids];
	}

	$effect(() => {
		if (!open) return;
		initial;
		initialStartOn;
		const ids = untrack(() => selectedForBudget(initial));
		const selectable = untrack(() => allSelectableIds);
		selectedIds = ids;
		limitRaw = initial ? amountDigitsOnly(String(initial.limitMinor)) : '';
		startOn = initial ? initialStartOn : today;
		period = initial?.period ?? 'ongoing';
		hardLimit = initial?.hardLimit === true;
		collapsed = {};
		appliesQuery = '';
		error = null;
		discardConfirmOpen = false;
		const resolved = resolveAppliesTo(ids, selectable, untrack(() => appliesCatalog));
		baseline = initial
			? {
					appliesTo: resolved.appliesTo,
					categoryIds: resolved.categoryIds,
					groupIds: resolved.groupIds,
					limitRaw: amountDigitsOnly(String(initial.limitMinor)),
					startOn: initialStartOn,
					period: initial.period,
					hardLimit: initial.hardLimit
				}
			: BUDGET_CREATE_BASELINE(today);
	});

	function catsInGroup(groupId: string): CategoryRow[] {
		return expenseCats.filter((c) => c.groupId === groupId);
	}

	function clearAppliesError() {
		if (error?.key === 'category') error = null;
	}

	function toggleGroup(groupId: string, check: boolean) {
		selectedIds = withGroupToggled(
			catsInGroup(groupId).map((c) => c.id),
			selectedSet,
			check
		);
		clearAppliesError();
	}

	function toggleCat(id: string, check: boolean) {
		const next = new Set(selectedSet);
		if (check) next.add(id);
		else next.delete(id);
		selectedIds = [...next];
		clearAppliesError();
	}

	function selectAll() {
		selectedIds = [...allSelectableIds];
		clearAppliesError();
	}

	function onLimitInput(el: HTMLInputElement) {
		applyGroupedAmountInput(el, (digits) => {
			limitRaw = digits;
			if (error?.key === 'amount') error = null;
		});
	}

	function requestDiscard() {
		if (dropConfirmOpen || restartConfirmOpen) return;
		if (!dirty) {
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
		if (dropConfirmOpen || restartConfirmOpen) return;
		requestDiscard();
	}

	function onInteractOutside(e: PointerEvent) {
		if (shouldIgnoreDismissForNativePicker(e)) {
			e.preventDefault();
			return;
		}
		if (dropConfirmOpen || restartConfirmOpen) return;
		if (!dirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (dirty) discardConfirmOpen = true;
	}

	function onEscapeKeydown(e: KeyboardEvent) {
		if (dropConfirmOpen || restartConfirmOpen) return;
		if (!dirty && !discardConfirmOpen) return;
		e.preventDefault();
		if (dirty) discardConfirmOpen = true;
	}

	async function submit() {
		if (!canSave) return;
		busy = true;
		error = null;
		try {
			assertBudgetStartOn(startOn, today);
			await onSave({
				selectedIds,
				allSelectableIds,
				limitRaw,
				startOn,
				period,
				hardLimit
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
		data-testid="pocket-budget-form-dialog"
		interactOutsideBehavior="close"
		escapeKeydownBehavior="close"
		onInteractOutside={onInteractOutside}
		onEscapeKeydown={onEscapeKeydown}
	>
		<Dialog.Header>
			<Dialog.Title>{mode === 'create' ? 'Add budget' : 'Edit budget'}</Dialog.Title>
			<Dialog.Description>
				{mode === 'create' ? 'Set a spending cap for this pocket.' : 'Update this budget.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void submit();
			}}
		>
			<div class="space-y-2">
				<div class="flex items-center justify-between gap-2">
					<Label>Applies to</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						data-testid="pocket-budget-select-all"
						disabled={allSelected}
						onclick={selectAll}
					>
						Select all
					</Button>
				</div>
				<div class="relative">
					<SearchIcon
						class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
						aria-hidden="true"
					/>
					<Input
						type="search"
						placeholder="Search categories or groups"
						class="pl-9"
						bind:value={appliesQuery}
						data-testid="pocket-budget-applies-search"
						aria-label="Search categories or groups"
					/>
				</div>
				<div
					class="border-border max-h-48 space-y-1 overflow-y-auto rounded-md border p-2"
					data-testid="pocket-budget-applies-to"
				>
					{#if filteredApplies.length === 0}
						<EmptyState
							class="py-4"
							testid="pocket-budget-applies-search-empty"
							title="No matches"
							description="Try a different category or group name."
						>
							{#snippet icon()}
								<SearchXIcon class="size-5" />
							{/snippet}
						</EmptyState>
					{:else}
						{#each filteredApplies as row (row.group.id)}
							{@const kids = row.categories}
							{#if kids.length > 0}
								{@const allKids = catsInGroup(row.group.id)}
								{@const state = groupSelectionState(
									allKids.map((c) => c.id),
									selectedSet
								)}
								{@const groupCollapsed = appliesQuery.trim() ? false : collapsed[row.group.id]}
								<div>
									<div class="flex items-center gap-1">
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
											aria-expanded={!groupCollapsed}
											onclick={() => (collapsed[row.group.id] = !collapsed[row.group.id])}
										>
											{#if groupCollapsed}
												<ChevronRightIcon class="size-4" />
											{:else}
												<ChevronDownIcon class="size-4" />
											{/if}
										</button>
										<label class="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-sm font-medium">
											<input
												type="checkbox"
												class="size-4 accent-primary"
												checked={state === 'all'}
												indeterminate={state === 'some'}
												data-testid={`pocket-budget-group-${row.group.id}`}
												onchange={(e) => toggleGroup(row.group.id, e.currentTarget.checked)}
											/>
											<span class="truncate">{row.group.name}</span>
										</label>
									</div>
									{#if !groupCollapsed}
										<ul class="ml-7 space-y-0.5">
											{#each kids as cat (cat.id)}
												<li>
													<label
														class={cn(
															'flex items-center gap-2 py-0.5 text-sm',
															cat.hidden && 'text-muted-foreground opacity-70'
														)}
													>
														<input
															type="checkbox"
															class="size-4 accent-primary"
															checked={selectedSet.has(cat.id)}
															data-testid={`pocket-budget-cat-${cat.id}`}
															onchange={(e) => toggleCat(cat.id, e.currentTarget.checked)}
														/>
														<span class="truncate">{cat.name}</span>
													</label>
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							{/if}
						{/each}
					{/if}
				</div>
				{#if error?.key === 'category'}
					<p class="text-destructive text-sm" role="alert" data-testid="pocket-budget-applies-error">
						{error.message}
					</p>
				{/if}
			</div>

			<div class="space-y-1">
				<Label for="pocket-budget-limit">Amount</Label>
				<InputGroup.Root>
					<InputGroup.Addon class="bg-muted/60 border-input border-r px-2.5">
						<InputGroup.Text>{currencyLabel}</InputGroup.Text>
					</InputGroup.Addon>
					<InputGroup.Input
						id="pocket-budget-limit"
						inputmode="numeric"
						autocomplete="off"
						placeholder="15,000"
						value={limitDisplay}
						data-testid="pocket-budget-limit-input"
						aria-invalid={error?.key === 'amount' ? true : undefined}
						onkeydown={(e) => {
							if (isBlockedAmountKey(e)) e.preventDefault();
						}}
						onpaste={(e) => {
							e.preventDefault();
							limitRaw = amountDigitsOnly(e.clipboardData?.getData('text') ?? '');
							if (error?.key === 'amount') error = null;
						}}
						oninput={(e) => onLimitInput(e.currentTarget)}
						class="!pl-2.5"
					/>
				</InputGroup.Root>
				{#if error?.key === 'amount'}
					<p class="text-destructive text-sm" role="alert">{error.message}</p>
				{/if}
			</div>

			<div class="space-y-1">
				<Label for="pocket-budget-start">Start date</Label>
				<DateField
					id="pocket-budget-start"
					value={startOn}
					max={today}
					testid="pocket-budget-start-input"
					onValueChange={(next) => {
						startOn = next;
						if (error?.key === 'occurredOn' || error?.key === 'form') error = null;
					}}
				/>
				{#if error?.key === 'occurredOn'}
					<p class="text-destructive text-sm" role="alert">{error.message}</p>
				{/if}
			</div>

			<fieldset class="space-y-2">
				<legend class="text-sm font-medium">Period</legend>
				<div class="flex gap-4">
					<label class="flex items-center gap-2 text-sm">
						<input
							type="radio"
							name="pocket-budget-period"
							class="accent-primary"
							checked={period === 'ongoing'}
							data-testid="pocket-budget-period-ongoing"
							onchange={() => (period = 'ongoing')}
						/>
						Ongoing
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="radio"
							name="pocket-budget-period"
							class="accent-primary"
							checked={period === 'monthly'}
							data-testid="pocket-budget-period-monthly"
							onchange={() => (period = 'monthly')}
						/>
						Monthly
					</label>
				</div>
			</fieldset>

			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					class="size-4 accent-primary"
					bind:checked={hardLimit}
					data-testid="pocket-budget-hard-limit"
				/>
				Hard limit
			</label>

			{#if mode === 'edit' && onRestart}
				<Button
					type="button"
					variant="outline"
					class="w-full"
					data-testid="pocket-budget-restart"
					disabled={initialStartOn === today}
					onclick={() => (restartConfirmOpen = true)}
				>
					Restart
				</Button>
			{/if}
			{#if mode === 'edit' && onDrop}
				<div class="border-border border-t pt-3">
					<Button
						type="button"
						variant="destructive"
						class="w-full"
						data-testid="pocket-budget-drop"
						onclick={() => (dropConfirmOpen = true)}
					>
						Drop budget
					</Button>
				</div>
			{/if}
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" disabled={busy} onclick={() => requestDiscard()}>
					Cancel
				</Button>
				<Button type="submit" disabled={!canSave} data-testid="pocket-budget-save">Save</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={restartConfirmOpen}
	title="Restart this budget?"
	description="The start date becomes today. Spending from before today will no longer count toward the used amount. Unsaved edits on this form will be discarded."
	confirmLabel="Restart"
	confirmTestId="pocket-budget-restart-confirm"
	onOpenChange={(next) => (restartConfirmOpen = next)}
	onConfirm={async () => {
		await onRestart?.();
		onOpenChange(false);
	}}
/>

<ConfirmDialog
	open={dropConfirmOpen}
	title="Drop this budget?"
	description="This budget will be removed from the list. Transactions are not changed."
	confirmLabel="Drop"
	destructive
	dangerChrome
	confirmTestId="pocket-budget-drop-confirm"
	onOpenChange={(next) => (dropConfirmOpen = next)}
	onConfirm={async () => {
		await onDrop?.();
		onOpenChange(false);
	}}
/>

<ConfirmDialog
	open={discardConfirmOpen}
	title="Discard unsaved changes?"
	description="Your edits will be lost if you leave without saving."
	confirmLabel="Discard"
	destructive
	confirmTestId="pocket-budget-discard-confirm"
	onOpenChange={(next) => (discardConfirmOpen = next)}
	onConfirm={() => {
		discardConfirmOpen = false;
		onOpenChange(false);
	}}
/>
