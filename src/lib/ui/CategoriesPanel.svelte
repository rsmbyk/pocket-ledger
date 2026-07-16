<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
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

	let kind = $state<CategoryRow['kind']>('expense');
	let name = $state('');
	let busy = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);
	let renameDrafts = $state<Record<string, string>>({});

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
</script>

<div class="space-y-4" data-testid="categories-panel">
	{#if message}
		<p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">{message}</p>
	{/if}
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Add category</Card.Title>
			<Card.Description>Custom labels for income and expenses.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				class="space-y-2"
				onsubmit={(e) => {
					e.preventDefault();
					void wrap(async () => {
						await onCreateCategory(name, kind);
						name = '';
					}, 'Category added');
				}}
			>
				<div class="grid grid-cols-2 gap-2">
					<Button
						type="button"
						size="sm"
						variant={kind === 'expense' ? 'default' : 'outline'}
						onclick={() => (kind = 'expense')}>Expense</Button
					>
					<Button
						type="button"
						size="sm"
						variant={kind === 'income' ? 'default' : 'outline'}
						onclick={() => (kind = 'income')}>Income</Button
					>
				</div>
				<Input
					placeholder="Name"
					bind:value={name}
					required
					data-testid="category-name-input"
				/>
				<Button type="submit" class="w-full" disabled={busy} data-testid="category-add"
					>Add category</Button
				>
			</form>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2 md:items-start" data-testid="categories-desktop-grid">
		{#each [{ title: 'Expense', rows: expenseCategories }, { title: 'Income', rows: incomeCategories }] as group (group.title)}
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">{group.title}</Card.Title>
				</Card.Header>
				<Card.Content>
					<ul
						class="divide-border divide-y text-sm"
						data-testid={`category-list-${group.title.toLowerCase()}`}
					>
						{#each group.rows as cat (cat.id)}
							<li class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
								<Input
									aria-label={`Rename ${cat.name}`}
									value={draftFor(cat)}
									oninput={(e) => {
										renameDrafts = {
											...renameDrafts,
											[cat.id]: (e.currentTarget as HTMLInputElement).value
										};
									}}
								/>
								<div class="flex shrink-0 gap-1">
									<Button
										size="sm"
										variant="outline"
										disabled={busy}
										onclick={() =>
											void wrap(() => onRenameCategory(cat.id, draftFor(cat)), 'Renamed')}
									>
										Rename
									</Button>
									<Button
										size="sm"
										variant="ghost"
										disabled={busy}
										onclick={() => void wrap(() => onDeleteCategory(cat.id), 'Deleted')}
									>
										Delete
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
