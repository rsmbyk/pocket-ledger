<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import {
		ADMIN_FEE_CATEGORY_ID,
		ADMIN_FEE_LABEL,
		UNCATEGORIZED_FILTER
	} from '$lib/domain/activity-filters';
	import UncategorizedLabel from '$lib/ui/UncategorizedLabel.svelte';
	import { cn } from '$lib/utils.js';

	type Props = {
		value: string;
		onValueChange: (next: string) => void;
		/** Flat list when not grouping (tx sheet or single-kind filter). */
		categories?: CategoryRow[];
		incomeCategories?: CategoryRow[];
		expenseCategories?: CategoryRow[];
		/** When true and both kind lists provided, render Income / Expenses groups. */
		groupByKind?: boolean;
		showAllOption?: boolean;
		showAdminFee?: boolean;
		showUncategorized?: boolean;
		/** Trigger label when value is empty. */
		emptyMeans?: 'all' | 'uncategorized';
		disabled?: boolean;
		testid?: string;
		id?: string;
		ariaLabel?: string;
		ariaInvalid?: boolean | undefined;
		class?: string;
	};

	let {
		value,
		onValueChange,
		categories = [],
		incomeCategories = [],
		expenseCategories = [],
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

	const allNamed = $derived(
		groupByKind
			? [...incomeCategories, ...expenseCategories]
			: categories.length > 0
				? categories
				: [...incomeCategories, ...expenseCategories]
	);

	const selectedLabel = $derived.by(() => {
		if (!value) return null;
		if (value === ADMIN_FEE_CATEGORY_ID) return ADMIN_FEE_LABEL;
		if (value === UNCATEGORIZED_FILTER) return 'Uncategorized';
		return allNamed.find((c) => c.id === value)?.name ?? null;
	});

	const showGroups = $derived(
		groupByKind && (incomeCategories.length > 0 || expenseCategories.length > 0)
	);
	const showSpecials = $derived(showAdminFee || showUncategorized);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		{id}
		class={cn(
			'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{disabled}
		data-testid={testid}
		aria-label={ariaLabel}
		aria-invalid={ariaInvalid}
	>
		{#if !value}
			{#if emptyMeans === 'all'}
				<span>All</span>
			{:else}
				<UncategorizedLabel system />
			{/if}
		{:else if value === ADMIN_FEE_CATEGORY_ID}
			<UncategorizedLabel system label={ADMIN_FEE_LABEL} />
		{:else if value === UNCATEGORIZED_FILTER}
			<UncategorizedLabel system />
		{:else if selectedLabel}
			<span class="truncate">{selectedLabel}</span>
		{:else if emptyMeans === 'all'}
			<span>All</span>
		{:else}
			<UncategorizedLabel system />
		{/if}
		<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="max-h-60 w-(--bits-dropdown-menu-anchor-width)">
		{#if showAllOption}
			<DropdownMenu.Item onclick={() => onValueChange('')}>All</DropdownMenu.Item>
		{/if}

		{#if showGroups}
			{#if incomeCategories.length > 0}
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading>Income</DropdownMenu.GroupHeading>
					{#each incomeCategories as category (category.id)}
						<DropdownMenu.Item onclick={() => onValueChange(category.id)}>
							{category.name}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Group>
			{/if}
			{#if expenseCategories.length > 0}
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading>Expenses</DropdownMenu.GroupHeading>
					{#each expenseCategories as category (category.id)}
						<DropdownMenu.Item onclick={() => onValueChange(category.id)}>
							{category.name}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Group>
			{/if}
		{:else}
			{#each categories.length > 0 ? categories : [...incomeCategories, ...expenseCategories] as category (category.id)}
				<DropdownMenu.Item onclick={() => onValueChange(category.id)}>
					{category.name}
				</DropdownMenu.Item>
			{/each}
		{/if}

		{#if showSpecials}
			<DropdownMenu.Separator />
			{#if showAdminFee}
				<DropdownMenu.Item onclick={() => onValueChange(ADMIN_FEE_CATEGORY_ID)}>
					<UncategorizedLabel system label={ADMIN_FEE_LABEL} />
				</DropdownMenu.Item>
			{/if}
			{#if showUncategorized}
				<DropdownMenu.Item
					onclick={() => onValueChange(showAllOption ? UNCATEGORIZED_FILTER : '')}
				>
					<UncategorizedLabel system />
				</DropdownMenu.Item>
			{/if}
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
