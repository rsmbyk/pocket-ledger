<script lang="ts">
	import type { Snippet } from 'svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import { cn } from '$lib/utils.js';

	type Props = {
		id?: string;
		value: string;
		disabled?: boolean;
		class?: string;
		'aria-label'?: string;
		testid?: string;
		onValueChange: (next: string) => void;
		/** Optional trailing control inside the field chrome (right side). */
		trailing?: Snippet;
	};

	let {
		id,
		value,
		disabled = false,
		class: className = '',
		'aria-label': ariaLabel = 'Date',
		testid = 'date-field',
		onValueChange,
		trailing
	}: Props = $props();

	const display = $derived(value ? formatOccurredOnDisplay(value) : '');
</script>

<div
	class={cn('relative', className)}
	data-testid={testid}
>
	<div
		class={cn(
			'border-input bg-background ring-offset-background focus-within:ring-ring flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm shadow-xs focus-within:ring-2',
			disabled && 'cursor-not-allowed opacity-50 shadow-none'
		)}
	>
		<div class="pointer-events-none flex min-w-0 flex-1 items-center gap-2 text-left">
			<CalendarIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
			{#if display}
				<span class="truncate tabular-nums">{display}</span>
			{:else}
				<span class="text-muted-foreground truncate">Pick a date</span>
			{/if}
		</div>
		{#if trailing}
			<div
				class="relative z-10 ml-auto flex shrink-0 items-center"
				data-slot="date-field-trailing"
			>
				{@render trailing()}
			</div>
		{/if}
	</div>
	<!--
		Native date input is the hit target (opacity 0 overlay). showPicker() on an
		sr-only input is a silent no-op on iOS Safari; a real tap on type=date works.
	-->
	<input
		{id}
		type="date"
		class={cn(
			'absolute inset-y-0 left-0 z-[1] cursor-pointer opacity-0',
			trailing ? 'right-10' : 'right-0',
			disabled && 'cursor-not-allowed'
		)}
		{disabled}
		{value}
		aria-label={ariaLabel}
		onchange={(e) => {
			onValueChange((e.currentTarget as HTMLInputElement).value);
		}}
	/>
</div>
