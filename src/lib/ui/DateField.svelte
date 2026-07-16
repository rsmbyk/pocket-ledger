<script lang="ts">
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
	};

	let {
		id,
		value,
		disabled = false,
		class: className = '',
		'aria-label': ariaLabel = 'Date',
		testid = 'date-field',
		onValueChange
	}: Props = $props();

	let nativeInput = $state<HTMLInputElement | null>(null);

	const display = $derived(value ? formatOccurredOnDisplay(value) : '');

	function openPicker() {
		if (disabled || !nativeInput) return;
		try {
			nativeInput.showPicker();
		} catch {
			nativeInput.focus();
			nativeInput.click();
		}
	}
</script>

<div class={cn('relative', className)}>
	<button
		type="button"
		{id}
		class={cn(
			'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-3 text-left text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
			disabled && 'shadow-none'
		)}
		{disabled}
		aria-label={ariaLabel}
		data-testid={testid}
		onclick={openPicker}
	>
		<CalendarIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
		{#if display}
			<span class="tabular-nums">{display}</span>
		{:else}
			<span class="text-muted-foreground">Pick a date</span>
		{/if}
	</button>
	<input
		bind:this={nativeInput}
		type="date"
		class="sr-only"
		tabindex={-1}
		{disabled}
		{value}
		onchange={(e) => onValueChange((e.currentTarget as HTMLInputElement).value)}
		aria-hidden="true"
	/>
</div>
