<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { formatMonthLabel, isValidMonthKey } from '$lib/domain/month-summary';
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
		'aria-label': ariaLabel = 'Month',
		testid = 'month-field',
		onValueChange
	}: Props = $props();

	const display = $derived(isValidMonthKey(value) ? formatMonthLabel(value) : '');
</script>

<div class={cn('relative', className)} data-testid={testid}>
	<div
		class={cn(
			'border-input bg-background ring-offset-background focus-within:ring-ring flex h-11 w-full items-center gap-2 rounded-md border px-3 text-sm shadow-xs focus-within:ring-2 md:h-9',
			disabled && 'cursor-not-allowed opacity-50 shadow-none'
		)}
	>
		<div class="pointer-events-none flex min-w-0 flex-1 items-center gap-2 text-left">
			<CalendarIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
			{#if display}
				<span class="truncate tabular-nums">{display}</span>
			{:else}
				<span class="text-muted-foreground truncate">Pick a month</span>
			{/if}
		</div>
	</div>
	<input
		{id}
		type="month"
		class={cn(
			'absolute inset-0 z-[1] cursor-pointer opacity-0',
			'[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0',
			'[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full',
			'[&::-webkit-calendar-picker-indicator]:cursor-pointer',
			disabled && 'cursor-not-allowed'
		)}
		{disabled}
		{value}
		aria-label={ariaLabel}
		onclick={(e) => {
			const el = e.currentTarget as HTMLInputElement;
			if (el.disabled) return;
			try {
				el.showPicker();
			} catch {
				// NotAllowedError / unsupported
			}
		}}
		onchange={(e) => {
			onValueChange((e.currentTarget as HTMLInputElement).value);
		}}
	/>
</div>
