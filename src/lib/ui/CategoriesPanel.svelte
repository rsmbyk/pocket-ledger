<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import { isCategoryInUse } from '$lib/application/categories';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import { cn } from '$lib/utils.js';

	type Props = {
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		onCreateCategory: (name: string, kind: CategoryRow['kind']) => void | Promise<void>;
		onRenameCategory: (id: string, name: string) => void | Promise<void>;
		onDeleteCategory: (id: string) => void | Promise<void>;
		onReorderCategories: (
			kind: CategoryRow['kind'],
			orderedIds: string[]
		) => void | Promise<void>;
	};

	let {
		expenseCategories,
		incomeCategories,
		onCreateCategory,
		onRenameCategory,
		onDeleteCategory,
		onReorderCategories
	}: Props = $props();

	const flipDurationMs = 180;

	let addDialogOpen = $state(false);
	let addKind = $state<CategoryRow['kind']>('expense');
	let addName = $state('');
	let busy = $state(false);
	let error = $state('');
	let nameFieldError = $state('');
	let renameErrorId = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});
	let deleteTarget = $state<{ id: string; name: string } | null>(null);
	let inUseTarget = $state<{ id: string; name: string } | null>(null);

	let incomeItems = $state<CategoryRow[]>([]);
	let expenseItems = $state<CategoryRow[]>([]);

	$effect(() => {
		incomeItems = [...incomeCategories];
	});

	$effect(() => {
		expenseItems = [...expenseCategories];
	});

	const addTitle = $derived(
		addKind === 'expense' ? 'Add expense category' : 'Add income category'
	);

	const addSubmitDisabled = $derived(busy || addName.trim() === '');

	const groups = $derived([
		{
			title: 'Income',
			kind: 'income' as const,
			listTestId: 'category-list-income',
			addTestId: 'category-add-income',
			addAriaLabel: 'Add income category',
			emptyTestId: 'category-empty-income',
			emptyTitle: 'No income categories',
			emptyDescription: 'Labels for money coming in.',
			cardClass: 'border-emerald-500/30 ring-emerald-500/20',
			headerClass: 'border-emerald-500/20 bg-emerald-500/5',
			iconClass: 'text-emerald-600 dark:text-emerald-400',
			dialogClass: 'border-emerald-500/40 ring-emerald-500/30',
			dialogHeaderClass: 'border-emerald-500/20 bg-emerald-500/5'
		},
		{
			title: 'Expense',
			kind: 'expense' as const,
			listTestId: 'category-list-expense',
			addTestId: 'category-add-expense',
			addAriaLabel: 'Add expense category',
			emptyTestId: 'category-empty-expense',
			emptyTitle: 'No expense categories',
			emptyDescription: 'Labels for money going out.',
			cardClass: 'border-destructive/30 ring-destructive/20',
			headerClass: 'border-destructive/20 bg-destructive/5',
			iconClass: 'text-destructive',
			dialogClass: 'border-destructive/40 ring-destructive/30',
			dialogHeaderClass: 'border-destructive/20 bg-destructive/5'
		}
	]);

	const activeDialogGroup = $derived(
		groups.find((group) => group.kind === addKind) ?? groups[1]
	);

	function itemsForKind(kind: CategoryRow['kind']): CategoryRow[] {
		return kind === 'income' ? incomeItems : expenseItems;
	}

	function setItemsForKind(kind: CategoryRow['kind'], items: CategoryRow[]) {
		if (kind === 'income') {
			incomeItems = items;
		} else {
			expenseItems = items;
		}
	}

	function revertItemsForKind(kind: CategoryRow['kind']) {
		if (kind === 'income') {
			incomeItems = [...incomeCategories];
		} else {
			expenseItems = [...expenseCategories];
		}
	}

	async function runAction(action: () => void | Promise<void>, opts?: { renameId?: string }) {
		busy = true;
		error = '';
		nameFieldError = '';
		renameErrorId = null;
		try {
			await action();
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Something went wrong';
			if (opts?.renameId) {
				renameErrorId = opts.renameId;
				nameFieldError = message;
			} else if (addDialogOpen) {
				nameFieldError = message;
			} else {
				error = message;
			}
			throw e;
		} finally {
			busy = false;
		}
	}

	function draftFor(cat: CategoryRow): string {
		return renameDrafts[cat.id] ?? cat.name;
	}

	function saveDisabled(cat: CategoryRow): boolean {
		return busy || draftFor(cat).trim() === cat.name || draftFor(cat).trim() === '';
	}

	function openAdd(kind: CategoryRow['kind']) {
		addKind = kind;
		addName = '';
		addDialogOpen = true;
	}

	function handleConsider(kind: CategoryRow['kind'], e: CustomEvent<DndEvent<CategoryRow>>) {
		setItemsForKind(kind, e.detail.items);
	}

	async function handleFinalize(kind: CategoryRow['kind'], e: CustomEvent<DndEvent<CategoryRow>>) {
		const items = e.detail.items;
		setItemsForKind(kind, items);
		busy = true;
		error = '';
		try {
			await onReorderCategories(
				kind,
				items.map((item) => item.id)
			);
		} catch (err) {
			revertItemsForKind(kind);
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			busy = false;
		}
	}

	async function openDeleteConfirm(id: string, name: string) {
		busy = true;
		error = '';
		try {
			if (await isCategoryInUse(id)) {
				inUseTarget = { id, name };
			} else {
				deleteTarget = { id, name };
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			busy = false;
		}
	}
</script>

<div class="space-y-4" data-testid="categories-panel">
	<div class="grid gap-4 md:grid-cols-2 md:items-start" data-testid="categories-desktop-grid">
		{#each groups as group (group.kind)}
			{@const items = itemsForKind(group.kind)}
			<Card.Root class={cn('gap-0 overflow-hidden py-0', group.cardClass)}>
				<Card.Header
					class={cn(
						'flex flex-row items-center justify-between gap-2 space-y-0 border-b px-4 pt-2 !pb-2',
						group.headerClass
					)}
				>
					<div class="flex items-center gap-2">
						{#if group.kind === 'income'}
							<TrendingUpIcon class={cn('size-5 shrink-0', group.iconClass)} aria-hidden="true" />
						{:else}
							<ShoppingBagIcon class={cn('size-5 shrink-0', group.iconClass)} aria-hidden="true" />
						{/if}
						<Card.Title class="text-base">{group.title}</Card.Title>
					</div>
					<Button
						type="button"
						size="icon-sm"
						variant="outline"
						disabled={busy}
						aria-label={group.addAriaLabel}
						data-testid={group.addTestId}
						onclick={() => openAdd(group.kind)}
					>
						<PlusIcon class="size-4" />
					</Button>
				</Card.Header>
				<Card.Content class="p-0">
					<div data-testid={group.listTestId}>
						{#if items.length === 0}
							<EmptyState
								testid={group.emptyTestId}
								title={group.emptyTitle}
								description={group.emptyDescription}
							>
								{#snippet icon()}
									{#if group.kind === 'income'}
										<TrendingUpIcon class="size-5" aria-hidden="true" />
									{:else}
										<ShoppingBagIcon class="size-5" aria-hidden="true" />
									{/if}
								{/snippet}
							</EmptyState>
						{:else}
							<div class="max-h-80 overflow-y-auto">
								<ul
									class="divide-border m-0 list-none divide-y p-0 text-sm"
									use:dragHandleZone={{
										items,
										flipDurationMs,
										type: group.kind,
										dragDisabled: busy
									}}
									onconsider={(e) => handleConsider(group.kind, e)}
									onfinalize={(e) => void handleFinalize(group.kind, e)}
									aria-label={`${group.title} categories`}
								>
									{#each items as cat (cat.id)}
										<li
											class="flex items-center gap-2 px-4 py-2.5"
											animate:flip={{ duration: flipDurationMs }}
											aria-label={draftFor(cat)}
										>
											<button
												type="button"
												use:dragHandle
												class="dnd-handle text-muted-foreground hover:text-foreground shrink-0 cursor-grab rounded-sm p-1 active:cursor-grabbing"
												aria-label={`Drag to reorder ${draftFor(cat)}`}
											>
												<GripVerticalIcon class="size-4" aria-hidden="true" />
											</button>
											<div class="min-w-0 flex-1 space-y-1">
												<Input
													class="w-full"
													aria-label={`Name for ${cat.name}`}
													aria-invalid={renameErrorId === cat.id ? true : undefined}
													value={draftFor(cat)}
													oninput={(e) => {
														renameDrafts = {
															...renameDrafts,
															[cat.id]: (e.currentTarget as HTMLInputElement).value
														};
														if (renameErrorId === cat.id) {
															renameErrorId = null;
															nameFieldError = '';
														}
													}}
												/>
												{#if renameErrorId === cat.id && nameFieldError}
													<p
														class="text-destructive text-sm"
														role="alert"
														data-testid="category-field-error-name"
													>
														{nameFieldError}
													</p>
												{/if}
											</div>
											<div class="flex shrink-0 justify-end gap-1">
												<Button
													size="icon-sm"
													variant="outline"
													aria-label={`Save name for ${cat.name}`}
													data-testid="category-save-name"
													disabled={saveDisabled(cat)}
													onclick={() =>
														void runAction(() => onRenameCategory(cat.id, draftFor(cat)), {
															renameId: cat.id
														})}
												>
													<CheckIcon class="size-4" />
												</Button>
												<Button
													size="icon-sm"
													variant="destructive"
													aria-label={`Delete ${cat.name}`}
													data-testid="category-delete"
													disabled={busy}
													onclick={() => void openDeleteConfirm(cat.id, cat.name)}
												>
													<Trash2Icon class="size-4" />
												</Button>
											</div>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={addDialogOpen}>
	<Dialog.Content
		class={cn('sm:max-w-md overflow-hidden p-0', activeDialogGroup.dialogClass)}
		showCloseButton={false}
	>
		<Dialog.Header
			class={cn('gap-1 space-y-0 border-b px-6 py-3', activeDialogGroup.dialogHeaderClass)}
		>
			<div class="flex items-center gap-2">
				{#if addKind === 'income'}
					<TrendingUpIcon
						class={cn('size-5 shrink-0', activeDialogGroup.iconClass)}
						aria-hidden="true"
					/>
				{:else}
					<ShoppingBagIcon
						class={cn('size-5 shrink-0', activeDialogGroup.iconClass)}
						aria-hidden="true"
					/>
				{/if}
				<Dialog.Title>{addTitle}</Dialog.Title>
			</div>
			<Dialog.Description>
				Custom labels for {addKind === 'expense' ? 'expenses' : 'income'}.
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4 px-6 py-4"
			onsubmit={(e) => {
				e.preventDefault();
				void runAction(async () => {
					await onCreateCategory(addName, addKind);
					addName = '';
					addDialogOpen = false;
				});
			}}
		>
			<Input
				placeholder="Name"
				bind:value={addName}
				required
				data-testid="category-name-input"
				aria-invalid={nameFieldError && addDialogOpen ? true : undefined}
				oninput={() => {
					if (nameFieldError) nameFieldError = '';
				}}
			/>
			{#if nameFieldError && addDialogOpen && !renameErrorId}
				<p class="text-destructive text-sm" role="alert" data-testid="category-field-error-name">
					{nameFieldError}
				</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={busy}
					onclick={() => (addDialogOpen = false)}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={addSubmitDisabled} data-testid="category-add">Add</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={deleteTarget !== null}
	title="Delete category?"
	description={deleteTarget
		? `Delete "${deleteTarget.name}"? This cannot be undone.`
		: 'This cannot be undone.'}
	confirmLabel="Delete"
	destructive
	dangerChrome
	confirmTestId="category-delete-confirm"
	onOpenChange={(open) => {
		if (!open) deleteTarget = null;
	}}
	onConfirm={async () => {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		await runAction(() => onDeleteCategory(id));
		deleteTarget = null;
	}}
/>

<ConfirmDialog
	open={inUseTarget !== null}
	title="Category in use"
	description="This category is still used by transactions and cannot be deleted."
	confirmLabel="Got it"
	hideCancel
	confirmTestId="category-in-use-dismiss"
	contentTestId="category-in-use-dialog"
	onOpenChange={(open) => {
		if (!open) inUseTarget = null;
	}}
	onConfirm={() => {
		inUseTarget = null;
	}}
/>
