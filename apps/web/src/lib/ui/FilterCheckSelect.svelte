<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Popover } from 'bits-ui';
	import { filterTriggerSummary } from '$lib/domain/activity-filters';
	import { cn } from '$lib/utils.js';

	export type FilterCheckItem = {
		id: string;
		label: string;
		testid: string;
	};

	type Props = {
		id?: string;
		testid: string;
		ariaLabel: string;
		values: string[];
		onValuesChange: (next: string[]) => void;
		items: FilterCheckItem[];
		/** Custom row body (e.g. PocketLabel). Defaults to `item.label`. */
		item?: Snippet<[FilterCheckItem]>;
		class?: string;
	};

	let {
		id,
		testid,
		ariaLabel,
		values,
		onValuesChange,
		items,
		item: itemSnippet,
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	const selectedSet = $derived(new Set(values));

	function labelFor(itemId: string): string {
		return items.find((row) => row.id === itemId)?.label ?? itemId;
	}

	function toggle(itemId: string) {
		const set = new Set(values);
		if (set.has(itemId)) set.delete(itemId);
		else set.add(itemId);
		onValuesChange([...set]);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		{id}
		class={cn(
			'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-9',
			className
		)}
		data-testid={testid}
		aria-label={ariaLabel}
		type="button"
	>
		<span class="truncate">{filterTriggerSummary(values, labelFor)}</span>
		<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			class="bg-popover text-popover-foreground z-[100] w-(--bits-popover-anchor-width) overflow-hidden rounded-md border p-1 shadow-md"
			align="start"
			sideOffset={4}
			data-testid="filter-check-menu"
			data-slot="popover-content"
		>
			<div class="max-h-60 overflow-y-auto" role="listbox" aria-multiselectable="true">
				{#each items as row (row.id)}
					<button
						type="button"
						role="option"
						data-testid={row.testid}
						data-checked={selectedSet.has(row.id) ? 'true' : undefined}
						aria-checked={selectedSet.has(row.id)}
						aria-selected={selectedSet.has(row.id)}
						class="hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none"
						onclick={() => toggle(row.id)}
					>
						<span
							class="border-input flex size-4 shrink-0 items-center justify-center rounded-sm border"
							aria-hidden="true"
						>
							{#if selectedSet.has(row.id)}
								<CheckIcon class="size-3" />
							{/if}
						</span>
						{#if itemSnippet}
							{@render itemSnippet(row)}
						{:else}
							{row.label}
						{/if}
					</button>
				{/each}
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
