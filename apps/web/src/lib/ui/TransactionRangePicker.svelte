<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Popover } from 'bits-ui';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { currentMonthKey, monthKeyFromDay, shiftMonth } from '$lib/domain/month-summary';
	import { todayOccurredOn } from '$lib/domain/transaction-rules';
	import { formatOccurredOnDisplay } from '$lib/domain/occurred-on-display';
	import {
		applyManualDayPick,
		calendarCellsForMonth,
		customRangeToMonth,
		defaultTransactionDateRange,
		formatRangeTriggerLabel,
		highlightRangeForHover,
		monthRangeToCustom,
		rangeFromMonthKey,
		type ManualPicking,
		type TransactionDateRange
	} from '$lib/domain/transaction-date-range';

	const MONTH_SHORT = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	] as const;
	const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

	type Props = {
		range: TransactionDateRange;
		onRangeChange: (next: TransactionDateRange) => void;
	};

	let { range, onRangeChange }: Props = $props();

	let open = $state(false);
	let draft = $state<TransactionDateRange>(defaultTransactionDateRange());
	let viewYear = $state(new Date().getFullYear());
	let viewMonthKey = $state(currentMonthKey());
	let picking = $state<ManualPicking>('start');
	let hoverIso = $state<string | null>(null);

	const triggerLabel = $derived(formatRangeTriggerLabel(range));
	const cells = $derived(calendarCellsForMonth(viewMonthKey));
	const today = $derived(todayOccurredOn());
	const highlight = $derived(
		highlightRangeForHover(draft.startDate, draft.endDate, picking, hoverIso)
	);

	function copyRange(next: TransactionDateRange): TransactionDateRange {
		return { ...next };
	}

	function syncViewFromRange() {
		draft = copyRange(range);
		hoverIso = null;
		const key = range.monthKey ?? monthKeyFromDay(range.startDate) ?? currentMonthKey();
		viewYear = Number(key.slice(0, 4));
		viewMonthKey = monthKeyFromDay(range.startDate) ?? key;
		picking = 'start';
	}

	function setMode(mode: 'month' | 'custom') {
		if (mode === draft.mode) return;
		hoverIso = null;
		if (mode === 'custom') draft = monthRangeToCustom(draft);
		else draft = customRangeToMonth(draft);
	}

	function pickMonth(monthKey: string) {
		draft = rangeFromMonthKey(monthKey);
	}

	function pickDay(iso: string) {
		const next = applyManualDayPick(draft, iso, picking);
		picking = next.nextPicking;
		draft = next.range;
		hoverIso = null;
		const key = monthKeyFromDay(iso);
		if (key) viewMonthKey = key;
	}

	function inSelectedRange(iso: string): boolean {
		return iso >= highlight.startDate && iso <= highlight.endDate;
	}

	function isEnd(iso: string): boolean {
		return iso === highlight.startDate || iso === highlight.endDate;
	}

	function applyDraft() {
		onRangeChange(copyRange(draft));
		open = false;
	}

	function closeDiscard() {
		open = false;
	}
</script>

<Popover.Root
	open={open}
	onOpenChange={(next) => {
		open = next;
		if (next) syncViewFromRange();
	}}
>
	<Popover.Trigger
		type="button"
		class="border-input bg-background ring-offset-background focus-visible:ring-ring inline-flex h-9 max-w-full items-center gap-2 rounded-md border px-2.5 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
		data-testid="activity-range-trigger"
		aria-label="Date range"
	>
		<CalendarIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
		<span class="truncate tabular-nums">{triggerLabel}</span>
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			class="bg-popover text-popover-foreground z-50 w-[18.5rem] rounded-md border p-3 shadow-md"
			align="center"
			sideOffset={8}
		>
			<div class="bg-muted mb-3 flex rounded-md p-0.5">
				<button
					type="button"
					class={cn(
						'flex-1 rounded px-2 py-1 text-xs font-medium',
						draft.mode === 'month'
							? 'bg-background text-foreground shadow-xs'
							: 'text-muted-foreground'
					)}
					data-testid="activity-range-mode-month"
					onclick={() => setMode('month')}
				>
					Month
				</button>
				<button
					type="button"
					class={cn(
						'flex-1 rounded px-2 py-1 text-xs font-medium',
						draft.mode === 'custom'
							? 'bg-background text-foreground shadow-xs'
							: 'text-muted-foreground'
					)}
					data-testid="activity-range-mode-manual"
					onclick={() => setMode('custom')}
				>
					Manual
				</button>
			</div>

			{#if draft.mode === 'month'}
				<div class="mb-2 flex items-center justify-between">
					<button
						type="button"
						class="hover:bg-muted rounded-md p-1"
						aria-label="Previous year"
						data-testid="activity-range-year-prev"
						onclick={() => (viewYear -= 1)}
					>
						<ChevronLeftIcon class="size-4" />
					</button>
					<p class="text-sm font-medium tabular-nums">{viewYear}</p>
					<button
						type="button"
						class="hover:bg-muted rounded-md p-1"
						aria-label="Next year"
						data-testid="activity-range-year-next"
						onclick={() => (viewYear += 1)}
					>
						<ChevronRightIcon class="size-4" />
					</button>
				</div>
				<div class="grid grid-cols-3 gap-1">
					{#each MONTH_SHORT as label, i (label)}
						{@const monthKey = `${viewYear}-${String(i + 1).padStart(2, '0')}`}
						<button
							type="button"
							class={cn(
								'rounded-md px-2 py-2 text-sm',
								draft.monthKey === monthKey
									? 'bg-primary text-primary-foreground'
									: 'hover:bg-muted text-foreground'
							)}
							data-testid={`activity-range-month-${monthKey}`}
							onclick={() => pickMonth(monthKey)}
						>
							{label}
						</button>
					{/each}
				</div>
			{:else}
				<div class="mb-2 grid grid-cols-2 gap-2">
					<button
						type="button"
						class={cn(
							'border-input rounded-md border px-2 py-1.5 text-left text-xs',
							picking === 'start' && 'ring-ring ring-2'
						)}
						data-testid="activity-range-start"
						onclick={() => {
							picking = 'start';
							hoverIso = null;
						}}
					>
						<span class="text-muted-foreground block">From</span>
						<span class="tabular-nums">{formatOccurredOnDisplay(draft.startDate)}</span>
					</button>
					<button
						type="button"
						class={cn(
							'border-input rounded-md border px-2 py-1.5 text-left text-xs',
							picking === 'end' && 'ring-ring ring-2'
						)}
						data-testid="activity-range-end"
						onclick={() => (picking = 'end')}
					>
						<span class="text-muted-foreground block">To</span>
						<span class="tabular-nums">{formatOccurredOnDisplay(draft.endDate)}</span>
					</button>
				</div>
				<div class="mb-2 flex items-center justify-between">
					<button
						type="button"
						class="hover:bg-muted rounded-md p-1"
						aria-label="Previous month"
						data-testid="activity-range-month-prev"
						onclick={() => (viewMonthKey = shiftMonth(viewMonthKey, -1))}
					>
						<ChevronLeftIcon class="size-4" />
					</button>
					<p class="text-sm font-medium tabular-nums">
						{formatRangeTriggerLabel({
							mode: 'month',
							monthKey: viewMonthKey,
							startDate: `${viewMonthKey}-01`,
							endDate: `${viewMonthKey}-01`
						})}
					</p>
					<button
						type="button"
						class="hover:bg-muted rounded-md p-1"
						aria-label="Next month"
						data-testid="activity-range-month-next"
						onclick={() => (viewMonthKey = shiftMonth(viewMonthKey, 1))}
					>
						<ChevronRightIcon class="size-4" />
					</button>
				</div>
				<div
					class="grid grid-cols-7 gap-px text-center"
					role="group"
					aria-label="Calendar days"
					data-testid="activity-range-day-grid"
					onpointerleave={() => (hoverIso = null)}
				>
					{#each WEEKDAYS as d (d)}
						<span class="text-muted-foreground py-1 text-[0.65rem] font-medium">{d}</span>
					{/each}
					{#each cells as cell (cell.iso)}
						<button
							type="button"
							class={cn(
								'size-8 rounded-md text-xs tabular-nums',
								!cell.inMonth && 'text-muted-foreground',
								inSelectedRange(cell.iso) && !isEnd(cell.iso) && 'bg-muted',
								isEnd(cell.iso) && 'bg-primary text-primary-foreground',
								cell.iso === today && !isEnd(cell.iso) && 'ring-border ring-1'
							)}
							data-testid={`activity-range-day-${cell.iso}`}
							onpointerenter={() => {
								if (picking === 'end') hoverIso = cell.iso;
							}}
							onclick={() => pickDay(cell.iso)}
						>
							{Number(cell.iso.slice(8))}
						</button>
					{/each}
				</div>
			{/if}

			<div class="mt-3 flex gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="flex-1"
					data-testid="activity-range-close"
					onclick={closeDiscard}
				>
					Close
				</Button>
				<Button
					type="button"
					size="sm"
					class="flex-1"
					data-testid="activity-range-apply"
					onclick={applyDraft}
				>
					Apply
				</Button>
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
