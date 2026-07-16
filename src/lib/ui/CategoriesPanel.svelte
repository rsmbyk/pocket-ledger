<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { CategoryRow } from '$lib/data/db';

	type Props = {
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		onCreateCategory: (name: string, kind: CategoryRow['kind']) => void | Promise<void>;
		onRenameCategory: (id: string, name: string) => void | Promise<void>;
		onDeleteCategory: (id: string) => void | Promise<void>;
	};

	let {
		expenseCategories,
		incomeCategories,
		onCreateCategory,
		onRenameCategory,
		onDeleteCategory
	}: Props = $props();

	let addDialogOpen = $state(false);
	let addKind = $state<CategoryRow['kind']>('expense');
	let addName = $state('');
	let busy = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});

	const addTitle = $derived(
		addKind === 'expense' ? 'Add expense category' : 'Add income category'
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

	function openAdd(kind: CategoryRow['kind']) {
		addKind = kind;
		addName = '';
		addDialogOpen = true;
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
		{#each [{ title: 'Income', rows: incomeCategories, kind: 'income' as const }, { title: 'Expense', rows: expenseCategories, kind: 'expense' as const }] as group (group.title)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0">
					<Card.Title class="text-base">{group.title}</Card.Title>
					<Button
						type="button"
						size="sm"
						disabled={busy}
						data-testid={group.kind === 'expense' ? 'category-add-expense' : 'category-add-income'}
						onclick={() => openAdd(group.kind)}
					>
						Add
					</Button>
				</Card.Header>
				<Card.Content>
					<ul
						class="divide-border divide-y text-sm"
						data-testid={`category-list-${group.title.toLowerCase()}`}
					>
						{#each group.rows as cat (cat.id)}
							<li class="flex items-center gap-2 py-3">
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
										variant="outline"
										aria-label={`Save name for ${cat.name}`}
										data-testid="category-save-name"
										disabled={
											busy ||
											draftFor(cat).trim() === cat.name ||
											draftFor(cat).trim() === ''
										}
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
						{:else}
							<li class="text-muted-foreground py-2">No categories yet.</li>
						{/each}
					</ul>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={addDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{addTitle}</Dialog.Title>
			<Dialog.Description>Custom labels for {addKind === 'expense' ? 'expenses' : 'income'}.</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
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
				<Button type="button" variant="outline" disabled={busy} onclick={() => (addDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={busy} data-testid="category-add">Add category</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
