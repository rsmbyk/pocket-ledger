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

	let nativeInput = $state<HTMLInputElement | null>(null);
	let pickerOpen = $state(false);

	const display = $derived(value ? formatOccurredOnDisplay(value) : '');

	function closePicker() {
		pickerOpen = false;
		nativeInput?.blur();
	}

	function openPicker() {
		if (disabled || !nativeInput) return;
		try {
			nativeInput.showPicker();
			pickerOpen = true;
		} catch {
			nativeInput.focus();
			nativeInput.click();
			pickerOpen = true;
		}
	}

	function onTriggerClick() {
		if (disabled) return;
		if (pickerOpen) {
			closePicker();
			return;
		}
		openPicker();
	}
</script>

<div class={cn('relative', className)}>
	<div
		class={cn(
			'border-input bg-background ring-offset-background focus-within:ring-ring flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm shadow-xs focus-within:ring-2',
			disabled && 'cursor-not-allowed opacity-50 shadow-none'
		)}
	>
		<button
			type="button"
			{id}
			class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left focus-visible:outline-none disabled:cursor-not-allowed"
			{disabled}
			aria-label={ariaLabel}
			aria-expanded={pickerOpen}
			data-testid={testid}
			onclick={onTriggerClick}
		>
			<CalendarIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
			{#if display}
				<span class="truncate tabular-nums">{display}</span>
			{:else}
				<span class="text-muted-foreground truncate">Pick a date</span>
			{/if}
		</button>
		{#if trailing}
			<div class="ml-auto flex shrink-0 items-center" data-slot="date-field-trailing">
				{@render trailing()}
			</div>
		{/if}
	</div>
	<input
		bind:this={nativeInput}
		type="date"
		class="sr-only"
		tabindex={-1}
		{disabled}
		{value}
		onchange={(e) => {
			onValueChange((e.currentTarget as HTMLInputElement).value);
			closePicker();
		}}
		oncancel={() => closePicker()}
		onblur={() => {
			window.setTimeout(() => {
				if (document.activeElement !== nativeInput) closePicker();
			}, 0);
		}}
		aria-hidden="true"
	/>
</div>
