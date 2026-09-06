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
		/** Native `min` on the date input (YYYY-MM-DD). */
		min?: string;
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
		min,
		trailing
	}: Props = $props();

	const display = $derived(value ? formatOccurredOnDisplay(value) : '');

	let inputEl = $state<HTMLInputElement | undefined>();

	function openPicker() {
		if (!inputEl || inputEl.disabled) return;
		try {
			inputEl.showPicker();
		} catch {
			// NotAllowedError / unsupported (iOS no-op is fine — overlay tap still works).
		}
	}

	function onChromeClick(e: MouseEvent) {
		if ((e.target as HTMLElement | null)?.closest('[data-slot="date-field-trailing"]')) return;
		openPicker();
	}
</script>

<div class={cn('relative', className)} data-testid={testid}>
	<div
		class={cn(
			'border-input bg-background ring-offset-background focus-within:ring-ring flex h-11 w-full items-center gap-2 rounded-md border px-3 text-sm shadow-xs focus-within:ring-2 md:h-9',
			disabled && 'cursor-not-allowed opacity-50 shadow-none'
		)}
		data-slot="date-field-chrome"
		onclick={onChromeClick}
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
			<div class="relative z-10 ml-auto flex shrink-0 items-center" data-slot="date-field-trailing">
				{@render trailing()}
			</div>
		{/if}
	</div>
	<!--
		Native date input is the hit target (opacity 0 overlay). UA styles give
		type=date an intrinsic width (~the date text); w-full overrides that so
		Android taps on icon/padding still hit the control. showPicker() on an
		sr-only input is a silent no-op on iOS Safari; a real tap on type=date works.
	-->
	<input
		bind:this={inputEl}
		{id}
		type="date"
		class={cn(
			'absolute top-0 left-0 z-[1] h-full cursor-pointer opacity-0',
			trailing ? 'w-[calc(100%-2.5rem)]' : 'w-full min-w-full',
			'[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0',
			'[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full',
			'[&::-webkit-calendar-picker-indicator]:cursor-pointer',
			'[&::-webkit-datetime-edit]:box-border [&::-webkit-datetime-edit]:h-full [&::-webkit-datetime-edit]:w-full',
			'[&::-webkit-datetime-edit-fields-wrapper]:h-full [&::-webkit-datetime-edit-fields-wrapper]:w-full',
			disabled && 'cursor-not-allowed'
		)}
		{disabled}
		{value}
		min={min}
		aria-label={ariaLabel}
		onclick={openPicker}
		onchange={(e) => {
			onValueChange((e.currentTarget as HTMLInputElement).value);
		}}
	/>
</div>
