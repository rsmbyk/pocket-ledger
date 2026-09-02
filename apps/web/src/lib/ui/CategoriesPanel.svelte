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
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import { filterCatalogGroups } from '$lib/domain/category-catalog-filter';
	import {
		cloneKindGroupOrder,
		groupsInOrder,
		isReorderDirty,
		resetKindInOrder,
		setKindOrder,
		snapshotGroupOrders,
		type KindGroupOrder
	} from '$lib/domain/category-reorder-session';
	import type { CategoryKind } from '$lib/domain/default-category-catalog';
	import {
		createCategory,
		createCategoryGroup,
		hideCategory,
		renameCategory,
		renameCategoryGroup,
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
	import {
		CATEGORY_CHIP_LONG_PRESS_MS,
		chipPressMovedBeyondSlop,
		chipPressOutcome,
		groupHeaderPressOutcome
	} from '$lib/shared/category-chip-press';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
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

	const flipDurationMs = 0;
	const belowMd = new IsMobile();
	type Mode = 'view' | 'reorder';
	type ChipPress = {
		categoryId: string;
		pointerId: number;
		startX: number;
		startY: number;
		startedAt: number;
		slop: boolean;
		timer: ReturnType<typeof setTimeout> | null;
	};
	type HeaderPress = {
		groupId: string;
		pointerId: number;
		startX: number;
		startY: number;
		startedAt: number;
		slop: boolean;
		timer: ReturnType<typeof setTimeout> | null;
	};
	let mode = $state<Mode>('view');
	let selectedKind = $state<CategoryKind>(readCategoriesKind());
	let searchQuery = $state('');
	let editingId = $state<string | null>(null);

	let addDialogOpen = $state(false);
	let addGroupId = $state('');
	let addName = $state('');
	let addGroupDialogOpen = $state(false);
	let addGroupName = $state('');
	let renameGroupDialogOpen = $state(false);
	let renameGroupId = $state('');
	let renameGroupName = $state('');
	let discardConfirmOpen = $state(false);
	let busy = $state(false);
	let error = $state('');
	let nameFieldError = $state('');
	let renameErrorId = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});

	const emptyOrder = (): KindGroupOrder => ({ income: [], expense: [] });
	let reorderItems = $state<OverlayGroup[]>([]);
	let reorderDraft = $state<KindGroupOrder>(emptyOrder());
	let reorderSnapshot = $state<KindGroupOrder>(emptyOrder());

	const kindGroups = $derived(groups.filter((g) => g.kind === selectedKind));
	const kindCategories = $derived(categories.filter((c) => c.kind === selectedKind));
	const filteredRows = $derived(filterCatalogGroups(kindGroups, kindCategories, searchQuery));

	const addDirty = $derived(addName.trim() !== '');
	const addGroupDirty = $derived(addGroupName.trim() !== '');
	const renameGroupDirty = $derived(renameGroupName.trim() !== '');
	const headerActionReveal =
		'md:pointer-events-none md:opacity-0 md:group-hover/card-header:pointer-events-auto md:group-hover/card-header:opacity-100 md:group-focus-within/card-header:pointer-events-auto md:group-focus-within/card-header:opacity-100';

	const kindMeta = {
		income: {
			title: 'Income',
			listTestId: 'category-list-income',
			cardClass: 'border-income/30 ring-income/20',
			headerClass: 'border-income/20 bg-income/5'
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
			} else if (addDialogOpen || addGroupDialogOpen || renameGroupDialogOpen) {
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
		if (mode !== 'reorder') searchQuery = '';
		editingId = null;
		if (mode === 'reorder') {
			reorderItems = groupsInOrder(groups, reorderDraft[next]);
		}
	}

	function requestKindChange(next: string) {
		if (next !== 'income' && next !== 'expense') return;
		if (next === selectedKind) return;
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

	function showReorderList(kind: CategoryKind) {
		reorderItems = groupsInOrder(groups, reorderDraft[kind]);
	}

	function enterReorder() {
		searchQuery = '';
		reorderSnapshot = snapshotGroupOrders(groups);
		reorderDraft = cloneKindGroupOrder(reorderSnapshot);
		mode = 'reorder';
		showReorderList(selectedKind);
		setDirty(false);
	}

	function exitReorder() {
		mode = 'view';
		searchQuery = '';
		reorderItems = [];
		reorderDraft = emptyOrder();
		reorderSnapshot = emptyOrder();
		setDirty(false);
	}

	function handleConsider(e: CustomEvent<DndEvent<OverlayGroup>>) {
		reorderItems = e.detail.items;
		reorderDraft = setKindOrder(
			reorderDraft,
			selectedKind,
			e.detail.items.map((g) => g.id)
		);
		setDirty(isReorderDirty(reorderDraft, reorderSnapshot));
	}

	async function saveReorder() {
		await runAction(async () => {
			await saveCategoryGroupOrder('income', reorderDraft.income);
			await saveCategoryGroupOrder('expense', reorderDraft.expense);
		});
		exitReorder();
	}

	function discardReorder() {
		exitReorder();
	}

	function resetReorder() {
		reorderDraft = resetKindInOrder(reorderDraft, groups, selectedKind);
		showReorderList(selectedKind);
		setDirty(isReorderDirty(reorderDraft, reorderSnapshot));
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

	let chipPress = $state<ChipPress | null>(null);

	function clearChipPress() {
		if (chipPress?.timer) clearTimeout(chipPress.timer);
		chipPress = null;
	}

	function chipAriaLabel(cat: CategoryRow): string {
		if (!belowMd.current || editingId === cat.id) return cat.name;
		return cat.hidden ? `Show ${cat.name}` : `Hide ${cat.name}`;
	}

	function applyChipOutcome(cat: CategoryRow, outcome: ReturnType<typeof chipPressOutcome>) {
		if (outcome === 'rename') {
			startRename(cat);
			return;
		}
		if (outcome === 'toggle') {
			void runAction(() => (cat.hidden ? showCategory(cat.id) : hideCategory(cat.id)));
		}
	}

	function onChipPointerDown(cat: CategoryRow, e: PointerEvent) {
		if (!belowMd.current) return;
		if (editingId === cat.id) return;
		if (e.button > 0) return;
		clearChipPress();
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			// Synthetic Playwright presses may not have a capturable pointer.
		}
		const timer = setTimeout(() => {
			if (!chipPress || chipPress.categoryId !== cat.id || chipPress.slop) return;
			applyChipOutcome(
				cat,
				chipPressOutcome({
					durationMs: CATEGORY_CHIP_LONG_PRESS_MS,
					movedBeyondSlop: false,
					isCustom: cat.source === 'custom',
					renameOpen: editingId === cat.id
				})
			);
			clearChipPress();
		}, CATEGORY_CHIP_LONG_PRESS_MS);
		chipPress = {
			categoryId: cat.id,
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			startedAt: performance.now(),
			slop: false,
			timer
		};
	}

	function onChipPointerMove(e: PointerEvent) {
		if (!chipPress || e.pointerId !== chipPress.pointerId) return;
		if (chipPress.slop) return;
		if (chipPressMovedBeyondSlop(chipPress.startX, chipPress.startY, e.clientX, e.clientY)) {
			chipPress.slop = true;
			if (chipPress.timer) {
				clearTimeout(chipPress.timer);
				chipPress.timer = null;
			}
		}
	}

	function onChipPointerUp(cat: CategoryRow, e: PointerEvent) {
		if (!belowMd.current) return;
		if (!chipPress || chipPress.categoryId !== cat.id || e.pointerId !== chipPress.pointerId) {
			return;
		}
		const durationMs = performance.now() - chipPress.startedAt;
		const slop = chipPress.slop;
		clearChipPress();
		applyChipOutcome(
			cat,
			chipPressOutcome({
				durationMs,
				movedBeyondSlop: slop,
				isCustom: cat.source === 'custom',
				renameOpen: editingId === cat.id
			})
		);
	}

	function onChipContextMenu(e: MouseEvent) {
		if (belowMd.current) e.preventDefault();
	}

	function onChipKeydown(cat: CategoryRow, e: KeyboardEvent) {
		if (!belowMd.current || editingId === cat.id) return;
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		applyChipOutcome(
			cat,
			chipPressOutcome({
				durationMs: 0,
				movedBeyondSlop: false,
				isCustom: cat.source === 'custom',
				renameOpen: false
			})
		);
	}

	function catsInGroup(groupId: string): CategoryRow[] {
		return kindCategories.filter((c) => c.groupId === groupId);
	}

	function isGroupAllHidden(cats: CategoryRow[]): boolean {
		return cats.length > 0 && cats.every((c) => c.hidden);
	}

	async function toggleGroupVisibility(cats: CategoryRow[]) {
		if (cats.length === 0) return;
		if (isGroupAllHidden(cats)) {
			for (const cat of cats) {
				if (cat.hidden) await showCategory(cat.id);
			}
			return;
		}
		for (const cat of cats) {
			if (!cat.hidden) await hideCategory(cat.id);
		}
	}

	function openRenameGroup(group: OverlayGroup) {
		if (group.source !== 'custom') return;
		renameGroupId = group.id;
		renameGroupName = group.name;
		nameFieldError = '';
		renameGroupDialogOpen = true;
	}

	let headerPress = $state<HeaderPress | null>(null);

	function clearHeaderPress() {
		if (headerPress?.timer) clearTimeout(headerPress.timer);
		headerPress = null;
	}

	function applyHeaderOutcome(
		group: OverlayGroup,
		outcome: ReturnType<typeof groupHeaderPressOutcome>
	) {
		if (outcome === 'rename') {
			openRenameGroup(group);
			return;
		}
		if (outcome === 'toggle') {
			void runAction(() => toggleGroupVisibility(catsInGroup(group.id)));
		}
	}

	function onHeaderPointerDown(group: OverlayGroup, e: PointerEvent) {
		if (!belowMd.current) return;
		if (e.button > 0) return;
		clearHeaderPress();
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			// Synthetic Playwright presses may not have a capturable pointer.
		}
		const cats = catsInGroup(group.id);
		const timer = setTimeout(() => {
			if (!headerPress || headerPress.groupId !== group.id || headerPress.slop) return;
			applyHeaderOutcome(
				group,
				groupHeaderPressOutcome({
					durationMs: CATEGORY_CHIP_LONG_PRESS_MS,
					movedBeyondSlop: false,
					isCustom: group.source === 'custom',
					emptyGroup: cats.length === 0,
					renameOpen: renameGroupDialogOpen
				})
			);
			clearHeaderPress();
		}, CATEGORY_CHIP_LONG_PRESS_MS);
		headerPress = {
			groupId: group.id,
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			startedAt: performance.now(),
			slop: false,
			timer
		};
	}

	function onHeaderPointerMove(e: PointerEvent) {
		if (!headerPress || e.pointerId !== headerPress.pointerId) return;
		if (headerPress.slop) return;
		if (chipPressMovedBeyondSlop(headerPress.startX, headerPress.startY, e.clientX, e.clientY)) {
			headerPress.slop = true;
			if (headerPress.timer) {
				clearTimeout(headerPress.timer);
				headerPress.timer = null;
			}
		}
	}

	function onHeaderPointerUp(group: OverlayGroup, e: PointerEvent) {
		if (!belowMd.current) return;
		if (!headerPress || headerPress.groupId !== group.id || e.pointerId !== headerPress.pointerId) {
			return;
		}
		const durationMs = performance.now() - headerPress.startedAt;
		const slop = headerPress.slop;
		clearHeaderPress();
		applyHeaderOutcome(
			group,
			groupHeaderPressOutcome({
				durationMs,
				movedBeyondSlop: slop,
				isCustom: group.source === 'custom',
				emptyGroup: catsInGroup(group.id).length === 0,
				renameOpen: renameGroupDialogOpen
			})
		);
	}

	function onHeaderContextMenu(e: MouseEvent) {
		if (belowMd.current) e.preventDefault();
	}

	function onHeaderKeydown(group: OverlayGroup, e: KeyboardEvent) {
		if (!belowMd.current) return;
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		applyHeaderOutcome(
			group,
			groupHeaderPressOutcome({
				durationMs: 0,
				movedBeyondSlop: false,
				isCustom: group.source === 'custom',
				emptyGroup: catsInGroup(group.id).length === 0,
				renameOpen: renameGroupDialogOpen
			})
		);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col" data-testid="categories-panel">
	<div class="bg-background flex shrink-0 flex-col gap-3 border-b px-7 py-3 md:px-9">
	<Tabs.Root
		value={selectedKind}
		onValueChange={requestKindChange}
		class="mx-auto w-full max-w-md shrink-0 md:max-w-sm"
		data-testid="category-kind-tabs"
	>
		<Tabs.List variant="default" class="mx-auto grid w-full grid-cols-2">
			<Tabs.Trigger
				value="income"
				data-testid="category-kind-income"
				class="data-active:bg-income/20 data-active:text-income dark:data-active:border-income/50 dark:data-active:bg-income/30"
			>
				Income
			</Tabs.Trigger>
			<Tabs.Trigger
				value="expense"
				data-testid="category-kind-expense"
				class="data-active:bg-destructive/20 data-active:text-destructive dark:data-active:border-destructive/50 dark:data-active:bg-destructive/35 dark:data-active:text-red-300"
			>
				Expenses
			</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	{#if mode !== 'reorder'}
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
	{/if}

	<div
		class={cn(
			'flex shrink-0 items-center gap-2',
			mode === 'reorder'
				? 'flex-wrap justify-end'
				: 'max-md:grid max-md:w-full max-md:grid-cols-2 md:flex-wrap md:justify-end'
		)}
	>
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
		{:else}
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="gap-1.5 max-md:w-full [&_svg]:size-3.5"
				disabled={busy}
				data-testid="category-add-group"
				onclick={() => {
					addGroupName = '';
					nameFieldError = '';
					addGroupDialogOpen = true;
				}}
			>
				<FolderPlusIcon />
				Add group
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="gap-1.5 max-md:w-full [&_svg]:size-3.5"
				disabled={busy}
				data-testid="category-reorder"
				onclick={enterReorder}
			>
				<ListOrderedIcon />
				Reorder
			</Button>
		{/if}
	</div>

	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}
	</div>

	<div class="min-h-0 flex-1 overflow-hidden">
		<div
			class="h-full min-h-0 overflow-y-auto overscroll-contain"
			data-testid="categories-desktop-grid"
			data-kind={selectedKind}
		>
			<div
				class={cn(
					'grid content-start gap-4 px-7 pt-1 pb-12 md:px-9',
					mode === 'reorder'
						? 'grid-cols-1'
						: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,22rem),1fr))]'
				)}
				data-testid={meta.listTestId}
				data-kind={selectedKind}
			>
			{#if mode === 'reorder'}
				<Card.Root class={cn('col-span-full min-h-0 overflow-visible py-0', meta.cardClass)}>
					<ul
						class="m-0 flex list-none flex-col gap-3 p-2"
						use:dragHandleZone={{
							items: reorderItems,
							flipDurationMs,
							type: selectedKind,
							dragDisabled: busy,
							dropFromOthersDisabled: true,
							useCursorForDetection: true
						}}
						onconsider={handleConsider}
						onfinalize={handleConsider}
						aria-label={`${meta.title} groups`}
					>
						{#each reorderItems as group (group.id)}
							<li
								class="flex items-center gap-2 rounded-md px-4 py-2.5"
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
					{@const groupCats = catsInGroup(group.id)}
					{@const groupAllHidden = isGroupAllHidden(groupCats)}
					{@const groupEmpty = groupCats.length === 0}
					{@const isCustomGroup = group.source === 'custom'}
					<Card.Root
						class={cn(
							'@container flex min-h-0 flex-col gap-0 overflow-hidden py-0',
							meta.cardClass,
							groupAllHidden && 'opacity-60 shadow-none'
						)}
						data-testid={`category-group-${group.id}`}
						data-group-hidden={groupAllHidden ? 'true' : undefined}
					>
						<Card.Header
							class={cn(
								'grid-rows-1 items-center border-b px-3 py-1 [.border-b]:pb-1',
								meta.headerClass
							)}
						>
							{#if belowMd.current}
								<button
									type="button"
									class="self-center truncate text-left text-sm leading-none font-medium"
									data-slot="card-title"
									data-testid="category-group-name"
									aria-label={group.name}
									onpointerdown={(e) => onHeaderPointerDown(group, e)}
									onpointermove={onHeaderPointerMove}
									onpointerup={(e) => onHeaderPointerUp(group, e)}
									onpointercancel={clearHeaderPress}
									oncontextmenu={onHeaderContextMenu}
									onkeydown={(e) => onHeaderKeydown(group, e)}
								>
									{group.name}
								</button>
							{:else}
								<Card.Title
									class="self-center text-sm leading-none font-medium"
									data-testid="category-group-name"
								>
									{group.name}
								</Card.Title>
							{/if}
							<Card.Action class="row-span-1 self-center">
								<div class="flex items-center">
									{#if !belowMd.current}
										<div class={cn('flex items-center', headerActionReveal)}>
											<span class="bg-border mx-1 h-4 w-px shrink-0" aria-hidden="true"></span>
											<Button
												type="button"
												variant="ghost"
												size="icon-xs"
												data-testid={groupAllHidden ? 'category-group-show' : 'category-group-hide'}
												aria-label={groupAllHidden ? 'Show group' : 'Hide group'}
												disabled={busy || groupEmpty}
												onclick={() =>
													void runAction(() => toggleGroupVisibility(groupCats))}
											>
												{#if groupAllHidden}
													<EyeIcon class="size-3.5" />
												{:else}
													<EyeOffIcon class="size-3.5" />
												{/if}
											</Button>
											{#if isCustomGroup}
												<span class="bg-border mx-1 h-4 w-px shrink-0" aria-hidden="true"></span>
												<Button
													type="button"
													variant="ghost"
													size="icon-xs"
													data-testid="category-group-edit"
													aria-label={`Rename ${group.name}`}
													disabled={busy}
													onclick={() => openRenameGroup(group)}
												>
													<PencilIcon class="size-3.5" />
												</Button>
											{/if}
										</div>
									{/if}
									<div
										class={cn('flex items-center', !belowMd.current && headerActionReveal)}
										data-testid="category-group-add-wrap"
									>
										<span class="bg-border mx-1 h-4 w-px shrink-0" aria-hidden="true"></span>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											data-testid="category-add-in-group"
											aria-label={`Add category to ${group.name}`}
											disabled={busy}
											onclick={() => openAdd(group.id)}
										>
											<PlusIcon class="size-3.5" />
										</Button>
									</div>
								</div>
							</Card.Action>
						</Card.Header>
						<Card.Content class="p-3">
							<ul
								class="m-0 grid list-none grid-cols-1 gap-2 p-0 @min-[22rem]:grid-cols-2 @min-[32rem]:grid-cols-3"
							>
								{#each row.categories as cat (cat.id)}
									<li
										class={cn(
											'group/chip border-border relative flex w-full min-w-0 cursor-default items-center gap-1.5 rounded-lg border bg-background px-2 py-1 text-sm select-none transition',
											cat.hidden ? 'opacity-60 shadow-none' : 'shadow-sm',
											'hover:bg-accent/70 hover:ring-foreground/10 hover:ring-1',
											'focus-within:bg-accent/70 focus-within:ring-foreground/10 focus-within:ring-1'
										)}
										data-testid="category-chip"
										data-name={cat.name}
										data-hidden={cat.hidden ? 'true' : undefined}
									>
										{#if editingId === cat.id}
											<CategoryIcon slug={cat.icon} />
											<div class="min-w-0 flex-1 space-y-1">
												<Input
													class="h-8 min-w-0 w-full"
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
												size="icon-xs"
												variant="outline"
												class="shrink-0"
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
												<CheckIcon class="size-3.5" />
											</Button>
										{:else if belowMd.current}
											<button
												type="button"
												class="flex min-w-0 flex-1 items-center gap-1.5 text-left"
												aria-label={chipAriaLabel(cat)}
												onpointerdown={(e) => onChipPointerDown(cat, e)}
												onpointermove={onChipPointerMove}
												onpointerup={(e) => onChipPointerUp(cat, e)}
												onpointercancel={clearChipPress}
												oncontextmenu={onChipContextMenu}
												onkeydown={(e) => onChipKeydown(cat, e)}
											>
												<CategoryIcon slug={cat.icon} />
												<span class="min-w-0 flex-1 truncate pr-1">{cat.name}</span>
											</button>
											{#if cat.source === 'custom'}
												<button
													type="button"
													class="sr-only"
													aria-label={`Edit ${cat.name}`}
													data-testid="category-edit-name"
													disabled={busy}
													onclick={() => startRename(cat)}
												>
													Edit {cat.name}
												</button>
											{/if}
										{:else}
											<CategoryIcon slug={cat.icon} />
											<span class="min-w-0 flex-1 truncate pr-1">{cat.name}</span>
											<span
												class="absolute top-1/2 right-1 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-within/chip:opacity-100"
											>
												{#if cat.source === 'custom'}
													<Button
														size="icon-xs"
														variant="outline"
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
</div>

<Dialog.Root
	open={addDialogOpen}
	onOpenChange={(next) => {
		if (next) addDialogOpen = true;
		else requestAddDiscard();
	}}
>
	<Dialog.Content class="max-w-sm sm:max-w-sm" showCloseButton={false} data-testid="category-add-dialog">
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
	<Dialog.Content class="max-w-sm sm:max-w-sm" data-testid="category-add-group-dialog">
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

<Dialog.Root bind:open={renameGroupDialogOpen}>
	<Dialog.Content class="max-w-sm sm:max-w-sm" data-testid="category-rename-group-dialog">
		<Dialog.Header>
			<Dialog.Title>Rename group</Dialog.Title>
			<Dialog.Description>Must be unique among {meta.title.toLowerCase()}.</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				void runAction(async () => {
					await renameCategoryGroup(renameGroupId, renameGroupName);
					renameGroupName = '';
					renameGroupId = '';
					renameGroupDialogOpen = false;
				});
			}}
		>
			<Input
				placeholder="Name"
				bind:value={renameGroupName}
				required
				data-testid="category-rename-group-name-input"
			/>
			{#if nameFieldError && renameGroupDialogOpen}
				<p class="text-destructive text-sm" role="alert">{nameFieldError}</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						renameGroupDialogOpen = false;
					}}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={busy || !renameGroupDirty}
					data-testid="category-rename-group-save"
				>
					Save
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
