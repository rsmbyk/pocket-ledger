<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import FolderPlusIcon from '@lucide/svelte/icons/folder-plus';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import ListOrderedIcon from '@lucide/svelte/icons/list-ordered';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import { filterCatalogGroups } from '$lib/domain/category-catalog-filter';
	import type { CategoryKind } from '$lib/domain/default-category-catalog';
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
	import {
		readCategoriesKind,
		writeCategoriesKind
	} from '$lib/shared/categories-kind-session';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import CategoryIcon from '$lib/ui/CategoryIcon.svelte';
	import EmptyState from '$lib/ui/EmptyState.svelte';
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
	type Mode = 'view' | 'reorder';
	let mode = $state<Mode>('view');
	let selectedKind = $state<CategoryKind>(readCategoriesKind());
	let searchQuery = $state('');
	let editingId = $state<string | null>(null);

	let addDialogOpen = $state(false);
	let addGroupId = $state('');
	let addName = $state('');
	let addGroupDialogOpen = $state(false);
	let addGroupName = $state('');
	let discardConfirmOpen = $state(false);
	let leaveReorderOpen = $state(false);
	let pendingKind = $state<CategoryKind | null>(null);
	let busy = $state(false);
	let error = $state('');
	let nameFieldError = $state('');
	let renameErrorId = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});

	let reorderItems = $state<OverlayGroup[]>([]);
	let savedReorderOrder = $state<string[]>([]);

	const kindGroups = $derived(groups.filter((g) => g.kind === selectedKind));
	const kindCategories = $derived(categories.filter((c) => c.kind === selectedKind));
	const filteredRows = $derived(filterCatalogGroups(kindGroups, kindCategories, searchQuery));

	const addDirty = $derived(addName.trim() !== '');
	const addGroupDirty = $derived(addGroupName.trim() !== '');

	const kindMeta = {
		income: {
			title: 'Income',
			listTestId: 'category-list-income',
			cardClass: 'border-emerald-500/30 ring-emerald-500/20',
			headerClass: 'border-emerald-500/20 bg-emerald-500/5'
		},
		expense: {
			title: 'Expenses',
			listTestId: 'category-list-expense',
			cardClass: 'border-destructive/30 ring-destructive/20',
			headerClass: 'border-destructive/20 bg-destructive/5'
		}
	} as const;

	const meta = $derived(kindMeta[selectedKind]);

	function setDirty(next: boolean) {
		reorderDirty = next;
		onReorderDirtyChange?.(next);
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

	function applyKind(next: CategoryKind) {
		selectedKind = next;
		writeCategoriesKind(next);
		searchQuery = '';
		editingId = null;
		if (mode === 'reorder') loadReorder(next);
	}

	function requestKindChange(next: string) {
		if (next !== 'income' && next !== 'expense') return;
		if (next === selectedKind) return;
		if (mode === 'reorder' && reorderDirty) {
			pendingKind = next;
			leaveReorderOpen = true;
			return;
		}
		applyKind(next);
	}

	function openAdd(groupId: string) {
		addGroupId = groupId;
		addName = '';
		nameFieldError = '';
		const draft = readCategoryCreateDraft(selectedKind);
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

	function loadReorder(kind: CategoryKind) {
		reorderItems = groups.filter((g) => g.kind === kind);
		savedReorderOrder = reorderItems.map((g) => g.id);
		setDirty(false);
	}

	function enterReorder() {
		mode = 'reorder';
		loadReorder(selectedKind);
	}

	function currentDirty(): boolean {
		return reorderItems.map((g) => g.id).join(',') !== savedReorderOrder.join(',');
	}

	function handleConsider(e: CustomEvent<DndEvent<OverlayGroup>>) {
		reorderItems = e.detail.items;
		setDirty(currentDirty());
	}

	async function saveReorder() {
		await runAction(async () => {
			await saveCategoryGroupOrder(
				selectedKind,
				reorderItems.map((g) => g.id)
			);
		});
		savedReorderOrder = reorderItems.map((g) => g.id);
		setDirty(false);
		mode = 'view';
	}

	function discardReorder() {
		reorderItems = savedReorderOrder
			.map((id) => groups.find((g) => g.id === id))
			.filter((g): g is OverlayGroup => Boolean(g));
		setDirty(false);
	}

	function resetReorder() {
		reorderItems = groups
			.filter((g) => g.kind === selectedKind && g.source === 'stock')
			.concat(groups.filter((g) => g.kind === selectedKind && g.source === 'custom'));
		setDirty(currentDirty());
	}

	function requestLeaveReorder() {
		if (!reorderDirty) {
			mode = 'view';
			return;
		}
		pendingKind = null;
		leaveReorderOpen = true;
	}

	function confirmLeaveReorder() {
		discardReorder();
		mode = 'view';
		leaveReorderOpen = false;
		const dest = pendingKind;
		pendingKind = null;
		if (dest) applyKind(dest);
	}

	function startRename(cat: CategoryRow) {
		editingId = cat.id;
		renameDrafts = { ...renameDrafts, [cat.id]: cat.name };
		nameFieldError = '';
		renameErrorId = null;
	}

	function cancelRename(id: string) {
		if (editingId === id) editingId = null;
		const next = { ...renameDrafts };
		delete next[id];
		renameDrafts = next;
		if (renameErrorId === id) {
			renameErrorId = null;
			nameFieldError = '';
		}
	}
</script>

<div class="flex min-h-0 flex-1 flex-col gap-3" data-testid="categories-panel">
	<Tabs.Root
		value={selectedKind}
		onValueChange={requestKindChange}
		class="mx-auto w-full max-w-md shrink-0"
		data-testid="category-kind-tabs"
	>
		<Tabs.List variant="default" class="mx-auto grid w-full grid-cols-2">
			<Tabs.Trigger
				value="income"
				data-testid="category-kind-income"
				class="data-active:bg-emerald-500/15 data-active:text-emerald-800 dark:data-active:text-emerald-300"
			>
				Income
			</Tabs.Trigger>
			<Tabs.Trigger
				value="expense"
				data-testid="category-kind-expense"
				class="data-active:bg-destructive/15 data-active:text-destructive"
			>
				Expenses
			</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<div class="relative shrink-0" data-testid="category-search-wrap">
		<SearchIcon
			class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
			aria-hidden="true"
		/>
		<Input
			id="category-search"
			type="search"
			placeholder="Search categories or groups"
			class="pl-9"
			bind:value={searchQuery}
			data-testid="category-search"
			aria-label="Search categories or groups"
		/>
	</div>

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
			<Button type="button" variant="ghost" size="sm" disabled={busy} onclick={requestLeaveReorder}>
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
				<FolderPlusIcon class="size-4" />
				Add group
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={busy}
				data-testid="category-reorder"
				onclick={enterReorder}
			>
				<ListOrderedIcon class="size-4" />
				Reorder
			</Button>
		{/if}
	</div>

	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}

	<div
		class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
		data-testid="categories-desktop-grid"
		data-kind={selectedKind}
	>
		<div
			class="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3"
			data-testid={meta.listTestId}
			data-kind={selectedKind}
		>
			{#if mode === 'reorder'}
				<Card.Root class={cn('col-span-full min-h-0 overflow-hidden py-0', meta.cardClass)}>
					<ul
						class="divide-border m-0 list-none divide-y p-0"
						use:dragHandleZone={{
							items: reorderItems,
							flipDurationMs,
							type: selectedKind,
							dragDisabled: busy
						}}
						onconsider={handleConsider}
						onfinalize={handleConsider}
						aria-label={`${meta.title} groups`}
					>
						{#each reorderItems as group (group.id)}
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
				</Card.Root>
			{:else if filteredRows.length === 0}
				<div class="col-span-full">
					<EmptyState
						testid="category-search-empty"
						title="No matches"
						description="Try a different category or group name."
					>
						{#snippet icon()}
							<SearchXIcon class="size-5" />
						{/snippet}
					</EmptyState>
				</div>
			{:else}
				{#each filteredRows as row (row.group.id)}
					{@const group = row.group}
					<Card.Root
						class={cn('flex min-h-0 flex-col gap-0 overflow-hidden py-0', meta.cardClass)}
						data-testid={`category-group-${group.id}`}
					>
						<Card.Header class={cn('items-center border-b px-4 py-2', meta.headerClass)}>
							<Card.Title class="text-sm font-medium">{group.name}</Card.Title>
							<Card.Action>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									data-testid="category-add-in-group"
									aria-label={`Add category to ${group.name}`}
									disabled={busy}
									onclick={() => openAdd(group.id)}
								>
									<PlusIcon class="size-4" />
								</Button>
							</Card.Action>
						</Card.Header>
						<Card.Content class="p-3">
							<ul class="m-0 flex list-none flex-wrap gap-2 p-0">
								{#each row.categories as cat (cat.id)}
									<li
										class={cn(
											'group border-border relative flex items-center gap-1 rounded-lg border bg-background px-2 py-1 text-sm transition',
											cat.hidden
												? 'opacity-60 shadow-none'
												: 'shadow-sm -translate-y-px',
											'hover:bg-accent/70 hover:ring-foreground/10 hover:ring-1',
											'focus-within:bg-accent/70 focus-within:ring-foreground/10 focus-within:ring-1'
										)}
										data-testid="category-chip"
										data-name={cat.name}
										data-hidden={cat.hidden ? 'true' : undefined}
										aria-label={cat.name}
									>
										<CategoryIcon slug={cat.icon} />
										{#if editingId === cat.id}
											<div class="min-w-0 space-y-1">
												<Input
													class="h-8 w-36"
													aria-label={`Name for ${cat.name}`}
													aria-invalid={renameErrorId === cat.id ? true : undefined}
													value={draftFor(cat)}
													oninput={(e) => {
														renameDrafts = {
															...renameDrafts,
															[cat.id]: (e.currentTarget as HTMLInputElement).value
														};
													}}
													onkeydown={(e) => {
														if (e.key === 'Escape') {
															e.preventDefault();
															cancelRename(cat.id);
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
														editingId = null;
													}, {
														renameId: cat.id
													})}
											>
												<CheckIcon class="size-4" />
											</Button>
										{:else}
											<span class="max-w-36 truncate">{cat.name}</span>
											<span
												class="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
											>
												{#if cat.source === 'custom'}
													<Button
														size="icon-xs"
														variant="ghost"
														aria-label={`Edit ${cat.name}`}
														data-testid="category-edit-name"
														disabled={busy}
														onclick={() => startRename(cat)}
													>
														<PencilIcon class="size-3.5" />
													</Button>
												{/if}
												<Button
													size="icon-xs"
													variant="ghost"
													aria-label={cat.hidden ? `Show ${cat.name}` : `Hide ${cat.name}`}
													data-testid={cat.hidden ? 'category-show' : 'category-hide'}
													disabled={busy}
													onclick={() =>
														void runAction(() =>
															cat.hidden ? showCategory(cat.id) : hideCategory(cat.id)
														)}
												>
													{#if cat.hidden}
														<EyeIcon class="size-3.5" />
													{:else}
														<EyeOffIcon class="size-3.5" />
													{/if}
												</Button>
											</span>
										{/if}
									</li>
								{/each}
							</ul>
						</Card.Content>
					</Card.Root>
				{/each}
			{/if}
		</div>
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
					await createCategory(addName, selectedKind, addGroupId);
					clearCategoryCreateDraft(selectedKind);
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
			<Dialog.Description>Placed last among {meta.title.toLowerCase()}.</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void runAction(async () => {
					await createCategoryGroup(addGroupName, selectedKind);
					addGroupName = '';
					addGroupDialogOpen = false;
				});
			}}
		>
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
		clearCategoryCreateDraft(selectedKind);
		discardConfirmOpen = false;
		addDialogOpen = false;
		addName = '';
	}}
	onSecondary={() => {
		writeCategoryCreateDraft(selectedKind, { name: addName });
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
	onConfirm={confirmLeaveReorder}
/>
