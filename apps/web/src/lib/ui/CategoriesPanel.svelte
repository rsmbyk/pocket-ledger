<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import {
		createCategory,
		createCategoryGroup,
		hideCategory,
		renameCategory,
		saveCategoryGroupOrder,
		showCategory
	} from '$lib/application/categories';
	import {
		clearCategoryCreateDraft,
		readCategoryCreateDraft,
		writeCategoryCreateDraft
	} from '$lib/shared/create-form-drafts';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import CategoryIcon from '$lib/ui/CategoryIcon.svelte';
	import { STOCK_CUSTOM_ICON } from '$lib/domain/default-category-catalog';
	import { cn } from '$lib/utils.js';

	type Props = {
		categories: CategoryRow[];
		groups: OverlayGroup[];
		onRefresh: () => void | Promise<void>;
		reorderDirty?: boolean;
		onReorderDirtyChange?: (dirty: boolean) => void;
	};

	let {
		categories,
		groups,
		onRefresh,
		reorderDirty = $bindable(false),
		onReorderDirtyChange
	}: Props = $props();

	const flipDurationMs = 180;
	type Mode = 'view' | 'edit' | 'reorder';
	let mode = $state<Mode>('view');

	let addDialogOpen = $state(false);
	let addKind = $state<CategoryRow['kind']>('expense');
	let addGroupId = $state('');
	let addName = $state('');
	let addGroupDialogOpen = $state(false);
	let addGroupKind = $state<CategoryRow['kind']>('expense');
	let addGroupName = $state('');
	let discardConfirmOpen = $state(false);
	let leaveReorderOpen = $state(false);
	let busy = $state(false);
	let error = $state('');
	let nameFieldError = $state('');
	let renameErrorId = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});

	let incomeGroupItems = $state<OverlayGroup[]>([]);
	let expenseGroupItems = $state<OverlayGroup[]>([]);
	let savedIncomeOrder = $state<string[]>([]);
	let savedExpenseOrder = $state<string[]>([]);

	const viewIncomeGroups = $derived(groups.filter((g) => g.kind === 'income'));
	const viewExpenseGroups = $derived(groups.filter((g) => g.kind === 'expense'));

	const addDirty = $derived(addName.trim() !== '');
	const addGroupDirty = $derived(addGroupName.trim() !== '');

	function setDirty(next: boolean) {
		reorderDirty = next;
		onReorderDirtyChange?.(next);
	}

	function catsInGroup(groupId: string): CategoryRow[] {
		return categories.filter((c) => c.groupId === groupId);
	}

	function draftFor(cat: CategoryRow): string {
		return renameDrafts[cat.id] ?? cat.name;
	}

	async function runAction(action: () => unknown | Promise<unknown>, opts?: { renameId?: string }) {
		busy = true;
		error = '';
		nameFieldError = '';
		renameErrorId = null;
		try {
			await action();
			await onRefresh();
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Something went wrong';
			if (opts?.renameId) {
				renameErrorId = opts.renameId;
				nameFieldError = message;
			} else if (addDialogOpen || addGroupDialogOpen) {
				nameFieldError = message;
			} else {
				error = message;
			}
			throw e;
		} finally {
			busy = false;
		}
	}

	function openAdd(kind: CategoryRow['kind'], groupId: string) {
		addKind = kind;
		addGroupId = groupId;
		addName = '';
		nameFieldError = '';
		const draft = readCategoryCreateDraft(kind);
		if (draft) addName = draft.name;
		addDialogOpen = true;
	}

	function requestAddDiscard() {
		if (!addDirty) {
			addDialogOpen = false;
			return;
		}
		discardConfirmOpen = true;
	}

	function enterReorder() {
		mode = 'reorder';
		incomeGroupItems = [...viewIncomeGroups];
		expenseGroupItems = [...viewExpenseGroups];
		savedIncomeOrder = incomeGroupItems.map((g) => g.id);
		savedExpenseOrder = expenseGroupItems.map((g) => g.id);
		setDirty(false);
	}

	function currentDirty(): boolean {
		const incomeIds = incomeGroupItems.map((g) => g.id).join(',');
		const expenseIds = expenseGroupItems.map((g) => g.id).join(',');
		return incomeIds !== savedIncomeOrder.join(',') || expenseIds !== savedExpenseOrder.join(',');
	}

	function handleConsider(kind: CategoryRow['kind'], e: CustomEvent<DndEvent<OverlayGroup>>) {
		if (kind === 'income') incomeGroupItems = e.detail.items;
		else expenseGroupItems = e.detail.items;
		setDirty(currentDirty());
	}

	function handleFinalize(kind: CategoryRow['kind'], e: CustomEvent<DndEvent<OverlayGroup>>) {
		handleConsider(kind, e);
	}

	async function saveReorder() {
		await runAction(async () => {
			await saveCategoryGroupOrder(
				'income',
				incomeGroupItems.map((g) => g.id)
			);
			await saveCategoryGroupOrder(
				'expense',
				expenseGroupItems.map((g) => g.id)
			);
		});
		savedIncomeOrder = incomeGroupItems.map((g) => g.id);
		savedExpenseOrder = expenseGroupItems.map((g) => g.id);
		setDirty(false);
		mode = 'view';
	}

	function discardReorder() {
		incomeGroupItems = savedIncomeOrder
			.map((id) => groups.find((g) => g.id === id))
			.filter((g): g is OverlayGroup => Boolean(g));
		expenseGroupItems = savedExpenseOrder
			.map((id) => groups.find((g) => g.id === id))
			.filter((g): g is OverlayGroup => Boolean(g));
		setDirty(false);
	}

	function resetReorder() {
		incomeGroupItems = groups
			.filter((g) => g.kind === 'income' && g.source === 'stock')
			.concat(groups.filter((g) => g.kind === 'income' && g.source === 'custom'));
		expenseGroupItems = groups
			.filter((g) => g.kind === 'expense' && g.source === 'stock')
			.concat(groups.filter((g) => g.kind === 'expense' && g.source === 'custom'));
		setDirty(currentDirty());
	}

	function requestLeaveReorder() {
		if (!reorderDirty) {
			mode = 'view';
			return;
		}
		leaveReorderOpen = true;
	}

	const kindMeta = {
		income: {
			title: 'Income',
			listTestId: 'category-list-income',
			iconClass: 'text-emerald-600 dark:text-emerald-400',
			cardClass: 'border-emerald-500/30 ring-emerald-500/20',
			headerClass: 'border-emerald-500/20 bg-emerald-500/5'
		},
		expense: {
			title: 'Expense',
			listTestId: 'category-list-expense',
			iconClass: 'text-destructive',
			cardClass: 'border-destructive/30 ring-destructive/20',
			headerClass: 'border-destructive/20 bg-destructive/5'
		}
	} as const;
</script>

<div class="flex min-h-0 flex-1 flex-col gap-3" data-testid="categories-panel">
	<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
		{#if mode === 'reorder'}
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={busy}
				data-testid="category-reorder-reset"
				onclick={resetReorder}
			>
				Reset
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={busy}
				data-testid="category-reorder-discard"
				onclick={discardReorder}
			>
				Discard
			</Button>
			<Button
				type="button"
				size="sm"
				disabled={busy || !reorderDirty}
				data-testid="category-reorder-save"
				onclick={() => void saveReorder()}
			>
				Save
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				disabled={busy}
				onclick={requestLeaveReorder}
			>
				Done
			</Button>
		{:else}
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={busy}
				data-testid="category-add-group"
				onclick={() => {
					addGroupName = '';
					nameFieldError = '';
					addGroupDialogOpen = true;
				}}
			>
				Add group
			</Button>
			<Button
				type="button"
				variant={mode === 'edit' ? 'default' : 'outline'}
				size="sm"
				disabled={busy}
				data-testid="category-edit-mode"
				onclick={() => (mode = mode === 'edit' ? 'view' : 'edit')}
			>
				{mode === 'edit' ? 'Done' : 'Edit'}
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={busy}
				data-testid="category-reorder"
				onclick={enterReorder}
			>
				Reorder
			</Button>
		{/if}
	</div>

	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}

	<div
		class="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain md:grid-cols-2 md:grid-rows-1 md:overflow-hidden"
		data-testid="categories-desktop-grid"
	>
		{#each (['income', 'expense'] as const) as kind (kind)}
			{@const meta = kindMeta[kind]}
			{@const kindGroups =
				mode === 'reorder'
					? kind === 'income'
						? incomeGroupItems
						: expenseGroupItems
					: groups.filter((g) => g.kind === kind)}
			<Card.Root class={cn('flex max-h-full min-h-0 flex-col gap-0 overflow-hidden py-0 md:h-full', meta.cardClass)}>
				<Card.Header
					class={cn(
						'flex shrink-0 flex-row items-center justify-between gap-2 space-y-0 border-b px-4 pt-2 !pb-2',
						meta.headerClass
					)}
				>
					<div class="flex items-center gap-2">
						{#if kind === 'income'}
							<TrendingUpIcon class={cn('size-5 shrink-0', meta.iconClass)} aria-hidden="true" />
						{:else}
							<ShoppingBagIcon class={cn('size-5 shrink-0', meta.iconClass)} aria-hidden="true" />
						{/if}
						<Card.Title class="text-base">{meta.title}</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0">
					<div data-testid={meta.listTestId} data-kind={kind}>
						{#if mode === 'reorder'}
							<ul
								class="divide-border m-0 list-none divide-y p-0"
								use:dragHandleZone={{
									items: kindGroups,
									flipDurationMs,
									type: kind,
									dragDisabled: busy
								}}
								onconsider={(e) => handleConsider(kind, e)}
								onfinalize={(e) => handleFinalize(kind, e)}
								aria-label={`${meta.title} groups`}
							>
								{#each kindGroups as group (group.id)}
									<li
										class="flex items-center gap-2 px-4 py-2.5"
										animate:flip={{ duration: flipDurationMs }}
										data-testid={`category-group-row-${group.id}`}
									>
										<button
											type="button"
											use:dragHandle
											class="dnd-handle text-muted-foreground hover:text-foreground shrink-0 cursor-grab rounded-sm p-1 active:cursor-grabbing"
											aria-label={`Drag to reorder ${group.name}`}
										>
											<GripVerticalIcon class="size-4" aria-hidden="true" />
										</button>
										<span class="text-sm font-medium">{group.name}</span>
									</li>
								{/each}
							</ul>
						{:else}
							<div class="space-y-3 p-3">
								{#each kindGroups as group (group.id)}
									{@const items = catsInGroup(group.id)}
									<section data-testid={`category-group-${group.id}`}>
										<h3 class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide">
											{group.name}
										</h3>
										<ul class="m-0 flex list-none flex-col gap-1 p-0">
											{#each items as cat (cat.id)}
												<li
													class={cn(
														'border-border flex items-center gap-2 rounded-md border px-2 py-1',
														cat.hidden && 'opacity-60'
													)}
													data-testid="category-chip"
													data-name={cat.name}
													aria-label={cat.name}
												>
													<CategoryIcon slug={cat.icon} />
													{#if mode === 'edit' && cat.source === 'custom'}
														<div class="min-w-0 flex-1 space-y-1">
															<Input
																class="h-8"
																aria-label={`Name for ${cat.name}`}
																aria-invalid={renameErrorId === cat.id ? true : undefined}
																value={draftFor(cat)}
																oninput={(e) => {
																	renameDrafts = {
																		...renameDrafts,
																		[cat.id]: (e.currentTarget as HTMLInputElement).value
																	};
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
														<Button
															size="icon-sm"
															variant="outline"
															aria-label={`Save name for ${cat.name}`}
															data-testid="category-save-name"
															disabled={busy ||
																draftFor(cat).trim() === cat.name ||
																draftFor(cat).trim() === ''}
															onclick={() =>
																void runAction(async () => {
																	await renameCategory(cat.id, draftFor(cat));
																}, {
																	renameId: cat.id
																})}
														>
															<CheckIcon class="size-4" />
														</Button>
													{:else}
														<span class="min-w-0 flex-1 truncate text-sm">{cat.name}</span>
													{/if}
													{#if mode === 'edit'}
														<Button
															size="icon-sm"
															variant="outline"
															aria-label={cat.hidden ? `Show ${cat.name}` : `Hide ${cat.name}`}
															data-testid={cat.hidden ? 'category-show' : 'category-hide'}
															disabled={busy}
															onclick={() =>
																void runAction(() =>
																	cat.hidden ? showCategory(cat.id) : hideCategory(cat.id)
																)}
														>
															{#if cat.hidden}
																<EyeIcon class="size-4" />
															{:else}
																<EyeOffIcon class="size-4" />
															{/if}
														</Button>
													{/if}
												</li>
											{/each}
											<li>
												<Button
													type="button"
													variant="outline"
													class="w-full justify-start gap-2"
													data-testid="category-add-in-group"
													aria-label={`Add category to ${group.name}`}
													disabled={busy}
													onclick={() => openAdd(kind, group.id)}
												>
													<CategoryIcon slug={STOCK_CUSTOM_ICON} />
													Add
												</Button>
											</li>
										</ul>
									</section>
								{/each}
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root
	open={addDialogOpen}
	onOpenChange={(next) => {
		if (next) addDialogOpen = true;
		else requestAddDiscard();
	}}
>
	<Dialog.Content class="sm:max-w-md" showCloseButton={false} data-testid="category-add-dialog">
		<Dialog.Header>
			<Dialog.Title>Add category</Dialog.Title>
			<Dialog.Description>Custom labels use the tag icon.</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void runAction(async () => {
					await createCategory(addName, addKind, addGroupId);
					clearCategoryCreateDraft(addKind);
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
			/>
			{#if nameFieldError && addDialogOpen && !renameErrorId}
				<p class="text-destructive text-sm" role="alert" data-testid="category-field-error-name">
					{nameFieldError}
				</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" disabled={busy} onclick={() => requestAddDiscard()}>
					Cancel
				</Button>
				<Button type="submit" disabled={busy || addName.trim() === ''} data-testid="category-add">
					Add
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={addGroupDialogOpen}>
	<Dialog.Content class="sm:max-w-md" data-testid="category-add-group-dialog">
		<Dialog.Header>
			<Dialog.Title>Add group</Dialog.Title>
			<Dialog.Description>Placed last among that kind.</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void runAction(async () => {
					await createCategoryGroup(addGroupName, addGroupKind);
					addGroupName = '';
					addGroupDialogOpen = false;
				});
			}}
		>
			<label class="space-y-1 text-sm">
				<span>Kind</span>
				<select
					class="border-input bg-background flex h-11 w-full rounded-md border px-3 text-sm md:h-9"
					bind:value={addGroupKind}
					data-testid="category-group-kind"
				>
					<option value="income">Income</option>
					<option value="expense">Expense</option>
				</select>
			</label>
			<Input
				placeholder="Name"
				bind:value={addGroupName}
				required
				data-testid="category-group-name-input"
			/>
			{#if nameFieldError && addGroupDialogOpen}
				<p class="text-destructive text-sm" role="alert">{nameFieldError}</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						addGroupDialogOpen = false;
					}}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={busy || !addGroupDirty} data-testid="category-group-add">
					Add
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={discardConfirmOpen}
	title="Discard unsaved changes?"
	description="Discard permanently, or save a draft to continue later."
	confirmLabel="Discard"
	destructive
	confirmTestId="category-discard-confirm"
	secondaryLabel="Save draft"
	secondaryTestId="category-discard-save-draft"
	onOpenChange={(next) => (discardConfirmOpen = next)}
	onConfirm={() => {
		clearCategoryCreateDraft(addKind);
		discardConfirmOpen = false;
		addDialogOpen = false;
		addName = '';
	}}
	onSecondary={() => {
		writeCategoryCreateDraft(addKind, { name: addName });
		discardConfirmOpen = false;
		addDialogOpen = false;
	}}
/>

<ConfirmDialog
	open={leaveReorderOpen}
	title="Discard group order?"
	description="Leave reorder without saving? Your last saved order stays."
	confirmLabel="Leave"
	destructive
	confirmTestId="category-reorder-leave-confirm"
	onOpenChange={(next) => (leaveReorderOpen = next)}
	onConfirm={() => {
		discardReorder();
		mode = 'view';
		leaveReorderOpen = false;
	}}
/>
