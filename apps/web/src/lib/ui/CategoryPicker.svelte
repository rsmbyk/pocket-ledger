<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Popover } from 'bits-ui';
	import * as Command from '$lib/components/ui/command/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import {
		ADMIN_FEE_CATEGORY_ID,
		ADMIN_FEE_LABEL,
		filterTriggerSummary,
		UNCATEGORIZED_FILTER
	} from '$lib/domain/activity-filters';
	import { STOCK_ADMIN_FEE_ICON, STOCK_UNCATEGORIZED_ICON } from '$lib/domain/default-category-catalog';
	import { filterCatalogGroups } from '$lib/domain/category-catalog-filter';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import CategoryIcon from '$lib/ui/CategoryIcon.svelte';
	import { cn } from '$lib/utils.js';

	type Props = {
		value?: string;
		onValueChange?: (next: string) => void;
		/** Multi-select for Filters (139). Tx sheet stays single. */
		multiple?: boolean;
		values?: string[];
		onValuesChange?: (next: string[]) => void;
		categories?: CategoryRow[];
		incomeCategories?: CategoryRow[];
		expenseCategories?: CategoryRow[];
		groups?: OverlayGroup[];
		groupByKind?: boolean;
		showAllOption?: boolean;
		showAdminFee?: boolean;
		showUncategorized?: boolean;
		emptyMeans?: 'all' | 'uncategorized';
		disabled?: boolean;
		testid?: string;
		id?: string;
		ariaLabel?: string;
		ariaInvalid?: boolean | undefined;
		class?: string;
	};

	let {
		value = '',
		onValueChange,
		multiple = false,
		values = [],
		onValuesChange,
		categories = [],
		incomeCategories = [],
		expenseCategories = [],
		groups = [],
		groupByKind = false,
		showAllOption = false,
		showAdminFee = false,
		showUncategorized = true,
		emptyMeans = 'uncategorized',
		disabled = false,
		testid = 'category-picker',
		id,
		ariaLabel = 'Category',
		ariaInvalid = undefined,
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	let search = $state('');

	$effect(() => {
		if (!open) search = '';
	});

	function matchesSearch(label: string): boolean {
		const q = search.trim().toLowerCase();
		return q === '' || label.toLowerCase().includes(q);
	}

	const allNamed = $derived(
		groupByKind
			? [...incomeCategories, ...expenseCategories]
			: categories.length > 0
				? categories
				: [...incomeCategories, ...expenseCategories]
	);

	const selectedIds = $derived(multiple ? values : value ? [value] : []);
	const selectedId = $derived(selectedIds[0] ?? '');
	const selected = $derived(allNamed.find((c) => c.id === selectedId) ?? null);
	const selectedSet = $derived(new Set(selectedIds));

	type PickerSection = {
		kindLabel?: string;
		kindTestId?: string;
		groups: Array<{ id: string; name: string; items: CategoryRow[] }>;
	};

	function groupName(groupId: string, kind: CategoryRow['kind']): string {
		return groups.find((g) => g.id === groupId)?.name ?? groupId;
	}

	function bucketsFor(rows: CategoryRow[]): Array<{ id: string; name: string; items: CategoryRow[] }> {
		const order = groups.filter((g) => rows.some((c) => c.groupId === g.id));
		const extraIds = [...new Set(rows.map((c) => c.groupId))].filter(
			(gid) => !order.some((g) => g.id === gid)
		);
		const ids = [...order.map((g) => g.id), ...extraIds];
		return ids
			.map((gid) => {
				const items = rows.filter((c) => c.groupId === gid);
				const sample = items[0];
				return {
					id: gid,
					name: sample ? groupName(gid, sample.kind) : gid,
					items
				};
			})
			.filter((g) => g.items.length > 0);
	}

	const sections = $derived.by((): PickerSection[] => {
		if (groupByKind) {
			return [
				{
					kindLabel: 'Income',
					kindTestId: 'picker-kind-income',
					groups: bucketsFor(incomeCategories)
				},
				{
					kindLabel: 'Expense',
					kindTestId: 'picker-kind-expense',
					groups: bucketsFor(expenseCategories)
				}
			].filter((s) => s.groups.length > 0);
		}
		const rows =
			categories.length > 0 ? categories : [...incomeCategories, ...expenseCategories];
		return [{ groups: bucketsFor(rows) }];
	});

	const visibleSections = $derived.by((): PickerSection[] => {
		return sections
			.map((section) => {
				const items = section.groups.flatMap((g) => g.items);
				const filtered = filterCatalogGroups(section.groups, items, search);
				return {
					...section,
					groups: filtered.map((row) => ({
						id: row.group.id,
						name: row.group.name,
						items: row.categories
					}))
				};
			})
			.filter((s) => s.groups.length > 0);
	});

	const showAllRow = $derived(!multiple && showAllOption && matchesSearch('All'));
	const showAdminRow = $derived(showAdminFee && matchesSearch(ADMIN_FEE_LABEL));
	const showUncategorizedRow = $derived(showUncategorized && matchesSearch('Uncategorized'));
	const showSpecials = $derived(showAdminRow || showUncategorizedRow);

	function labelFor(id: string): string {
		if (id === ADMIN_FEE_CATEGORY_ID) return ADMIN_FEE_LABEL;
		if (id === UNCATEGORIZED_FILTER) return 'Uncategorized';
		return allNamed.find((c) => c.id === id)?.name ?? id;
	}

	function select(next: string) {
		if (multiple) {
			const set = new Set(values);
			if (next === '') {
				onValuesChange?.([]);
				return;
			}
			if (set.has(next)) set.delete(next);
			else set.add(next);
			onValuesChange?.([...set]);
			return;
		}
		onValueChange?.(next);
		open = false;
	}
</script>

{#snippet check(id: string)}
	{#if multiple}
		<span
			class="border-input flex size-4 shrink-0 items-center justify-center rounded-sm border"
			aria-hidden="true"
		>
			{#if selectedSet.has(id)}
				<CheckIcon class="size-3" />
			{/if}
		</span>
	{/if}
{/snippet}

<Popover.Root bind:open>
	<Popover.Trigger
		{id}
		class={cn(
			'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-9',
			className
		)}
		{disabled}
		data-testid={testid}
		aria-label={ariaLabel}
		aria-invalid={ariaInvalid}
		type="button"
	>
		<span class="flex min-w-0 items-center gap-2">
			{#if multiple}
				<span class="truncate">{filterTriggerSummary(values, labelFor)}</span>
			{:else if !value}
				{#if emptyMeans === 'all'}
					<span>All</span>
				{:else}
					<CategoryIcon slug={STOCK_UNCATEGORIZED_ICON} class="text-muted-foreground" />
					<UncategorizedLabel system showIcon={false} />
				{/if}
			{:else if value === ADMIN_FEE_CATEGORY_ID}
				<CategoryIcon slug={STOCK_ADMIN_FEE_ICON} class="text-muted-foreground" />
				<UncategorizedLabel system label={ADMIN_FEE_LABEL} showIcon={false} />
			{:else if value === UNCATEGORIZED_FILTER}
				<CategoryIcon slug={STOCK_UNCATEGORIZED_ICON} class="text-muted-foreground" />
				<UncategorizedLabel system showIcon={false} />
			{:else if selected}
				<CategoryIcon slug={selected.icon} />
				<span class="truncate">{selected.name}</span>
			{:else if emptyMeans === 'all'}
				<span>All</span>
			{:else}
				<CategoryIcon slug={STOCK_UNCATEGORIZED_ICON} class="text-muted-foreground" />
				<UncategorizedLabel system showIcon={false} />
			{/if}
		</span>
		<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			class="bg-popover text-popover-foreground z-50 w-(--bits-popover-anchor-width) overflow-hidden rounded-md border p-0 shadow-md"
			align="start"
			sideOffset={4}
		>
			<Command.Root shouldFilter={false}>
				<Command.Input
					placeholder="Search categories…"
					data-testid="category-picker-search"
					bind:value={search}
				/>
				<Command.List>
					<Command.Empty>No matching categories.</Command.Empty>
					{#if showAllRow}
						<Command.Group>
							<Command.Item value="all" onSelect={() => select('')} data-testid="category-option-all">
								All
							</Command.Item>
						</Command.Group>
					{/if}
					{#each visibleSections as section (section.kindTestId ?? 'single')}
						{#if section.kindLabel}
							<div
								class="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium"
								data-testid={section.kindTestId}
							>
								{section.kindLabel}
							</div>
						{/if}
						{#each section.groups as group (group.id)}
							<Command.Group heading={group.name} data-testid={`picker-group-${group.id}`}>
								{#each group.items as category (category.id)}
									<Command.Item
										value={`${category.name} ${category.id}`}
										onSelect={() => select(category.id)}
										data-testid={`category-option-${category.id}`}
										class={multiple ? '[&_.cn-command-item-indicator]:hidden' : undefined}
									>
										{@render check(category.id)}
										<CategoryIcon slug={category.icon} />
										{category.name}
									</Command.Item>
								{/each}
							</Command.Group>
						{/each}
					{/each}
					{#if showSpecials}
						<Command.Separator />
						<Command.Group>
							{#if showAdminRow}
								<Command.Item
									value={ADMIN_FEE_LABEL}
									onSelect={() => select(ADMIN_FEE_CATEGORY_ID)}
									class={multiple ? '[&_.cn-command-item-indicator]:hidden' : undefined}
								>
									{@render check(ADMIN_FEE_CATEGORY_ID)}
									<CategoryIcon slug={STOCK_ADMIN_FEE_ICON} />
									<UncategorizedLabel system label={ADMIN_FEE_LABEL} showIcon={false} />
								</Command.Item>
							{/if}
							{#if showUncategorizedRow}
								<Command.Item
									value="Uncategorized"
									onSelect={() =>
										select(multiple || showAllOption ? UNCATEGORIZED_FILTER : '')}
									class={multiple ? '[&_.cn-command-item-indicator]:hidden' : undefined}
								>
									{@render check(UNCATEGORIZED_FILTER)}
									<CategoryIcon slug={STOCK_UNCATEGORIZED_ICON} />
									<UncategorizedLabel system showIcon={false} />
								</Command.Item>
							{/if}
						</Command.Group>
					{/if}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
