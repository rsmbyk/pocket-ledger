<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import EmptyState from '$lib/ui/EmptyState.svelte';
	import { cn } from '$lib/utils.js';

	type Props = {
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		onCreateCategory: (name: string, kind: CategoryRow['kind']) => void | Promise<void>;
		onRenameCategory: (id: string, name: string) => void | Promise<void>;
		onDeleteCategory: (id: string) => void | Promise<void>;
		onReorderCategory: (id: string, direction: 'up' | 'down') => void | Promise<void>;
	};

	let {
		expenseCategories,
		incomeCategories,
		onCreateCategory,
		onRenameCategory,
		onDeleteCategory,
		onReorderCategory
	}: Props = $props();

	let addDialogOpen = $state(false);
	let addKind = $state<CategoryRow['kind']>('expense');
	let addName = $state('');
	let busy = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});
	let dialogEmphasizing = $state(false);

	let emphasizeTimeout: ReturnType<typeof setTimeout> | undefined;

	const addTitle = $derived(
		addKind === 'expense' ? 'Add expense category' : 'Add income category'
	);

	const addSubmitDisabled = $derived(busy || addName.trim() === '');

	const groups = $derived([
		{
			title: 'Income',
			rows: incomeCategories,
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
			rows: expenseCategories,
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

	async function wrap(action: () => void | Promise<void>, ok: string) {
		busy = true;
		error = null;
		message = null;
		try {
			await action();
			message = ok;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong';
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

	function handleInteractOutside(e: Event) {
		e.preventDefault();
		dialogEmphasizing = true;
		clearTimeout(emphasizeTimeout);
		emphasizeTimeout = setTimeout(() => {
			dialogEmphasizing = false;
		}, 400);
	}

	async function confirmDelete(id: string, name: string) {
		if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
		await wrap(() => onDeleteCategory(id), 'Deleted');
	}
</script>

<div class="space-y-4" data-testid="categories-panel">
	{#if message}
		<p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">{message}</p>
	{/if}
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}

	<div class="grid gap-4 md:grid-cols-2 md:items-start" data-testid="categories-desktop-grid">
		{#each groups as group (group.kind)}
			<Card.Root class={group.cardClass}>
				<Card.Header
					class={cn(
						'flex flex-row items-center justify-between gap-2 space-y-0 border-b',
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
						size="icon"
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
						{#if group.rows.length === 0}
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
							<ul class="divide-border divide-y text-sm">
								{#each group.rows as cat, index (cat.id)}
									<li class="flex items-center gap-2 px-6 py-3">
										<div class="flex shrink-0 flex-col gap-0.5">
											<Button
												type="button"
												size="icon-sm"
												variant="outline"
												aria-label={`Move ${cat.name} up`}
												data-testid="category-move-up"
												disabled={busy || index === 0}
												onclick={() =>
													void wrap(() => onReorderCategory(cat.id, 'up'), 'Reordered')}
											>
												<ChevronUpIcon class="size-4" />
											</Button>
											<Button
												type="button"
												size="icon-sm"
												variant="outline"
												aria-label={`Move ${cat.name} down`}
												data-testid="category-move-down"
												disabled={busy || index === group.rows.length - 1}
												onclick={() =>
													void wrap(() => onReorderCategory(cat.id, 'down'), 'Reordered')}
											>
												<ChevronDownIcon class="size-4" />
											</Button>
										</div>
										<Input
											class="min-w-0 flex-1"
											aria-label={`Name for ${cat.name}`}
											value={draftFor(cat)}
											oninput={(e) => {
												renameDrafts = {
													...renameDrafts,
													[cat.id]: (e.currentTarget as HTMLInputElement).value
												};
											}}
										/>
										<div class="flex shrink-0 justify-end gap-1">
											<Button
												size="icon"
												variant={saveDisabled(cat) ? 'outline' : 'default'}
												aria-label={`Save name for ${cat.name}`}
												data-testid="category-save-name"
												disabled={saveDisabled(cat)}
												onclick={() =>
													void wrap(() => onRenameCategory(cat.id, draftFor(cat)), 'Renamed')}
											>
												<CheckIcon class="size-4" />
											</Button>
											<Button
												size="icon"
												variant="destructive"
												aria-label={`Delete ${cat.name}`}
												data-testid="category-delete"
												disabled={busy}
												onclick={() => void confirmDelete(cat.id, cat.name)}
											>
												<Trash2Icon class="size-4" />
											</Button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={addDialogOpen}>
	<Dialog.Content
		class={cn(
			'sm:max-w-md overflow-hidden p-0',
			activeDialogGroup.dialogClass,
			dialogEmphasizing && 'panel-emphasize'
		)}
		onInteractOutside={handleInteractOutside}
	>
		<Dialog.Header
			class={cn('space-y-2 border-b px-6 py-4', activeDialogGroup.dialogHeaderClass)}
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
				void wrap(async () => {
					await onCreateCategory(addName, addKind);
					addName = '';
					addDialogOpen = false;
				}, 'Category added');
			}}
		>
			<Input
				placeholder="Name"
				bind:value={addName}
				required
				data-testid="category-name-input"
			/>
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

<style>
	:global(.panel-emphasize) {
		animation: panel-emphasize 0.4s ease;
	}

	@keyframes panel-emphasize {
		0%,
		100% {
			box-shadow:
				0 0 0 0 color-mix(in oklch, var(--ring) 0%, transparent),
				0 0 0 0 transparent;
		}

		50% {
			box-shadow:
				0 0 0 3px color-mix(in oklch, var(--ring) 45%, transparent),
				0 0 0 1px var(--ring);
		}
	}
</style>
