import { currentMonthKey, formatMonthLabel, monthKeyFromDay } from './month-summary';
import { formatOccurredOnDisplay } from './occurred-on-display';
import { todayOccurredOn } from './transaction-rules';

export type DateRangeMode = 'month' | 'custom';

export type TransactionDateRange = {
	mode: DateRangeMode;
	monthKey?: string;
	startDate: string;
	endDate: string;
};

/** Last calendar day of `YYYY-MM` (`new Date(y, m, 0)`). */
export function lastCalendarDayOfMonth(monthKey: string): string {
	const [ys, ms] = monthKey.split('-');
	const y = Number(ys);
	const m = Number(ms);
	const last = new Date(y, m, 0).getDate();
	return `${ys}-${ms}-${String(last).padStart(2, '0')}`;
}

/** Inclusive calendar span for a `YYYY-MM` key. Current month ends on today. */
export function monthRangeForKey(
	monthKey: string,
	now = new Date()
): { startDate: string; endDate: string } {
	const startDate = `${monthKey}-01`;
	const endDate =
		monthKey === currentMonthKey(now) ? todayOccurredOn(now) : lastCalendarDayOfMonth(monthKey);
	return { startDate, endDate };
}

export function defaultTransactionDateRange(now = new Date()): TransactionDateRange {
	const monthKey = currentMonthKey(now);
	const { startDate, endDate } = monthRangeForKey(monthKey, now);
	return { mode: 'month', monthKey, startDate, endDate };
}

/** If start is after end, swap so the span is always ordered. */
export function snapDateRange(
	startDate: string,
	endDate: string
): { startDate: string; endDate: string } {
	if (startDate && endDate && startDate > endDate) {
		return { startDate: endDate, endDate: startDate };
	}
	return { startDate, endDate };
}

export function rangeFromCustom(startDate: string, endDate: string): TransactionDateRange {
	const snapped = snapDateRange(startDate, endDate);
	return { mode: 'custom', startDate: snapped.startDate, endDate: snapped.endDate };
}

export function rangeFromMonthKey(monthKey: string, now = new Date()): TransactionDateRange {
	const { startDate, endDate } = monthRangeForKey(monthKey, now);
	return { mode: 'month', monthKey, startDate, endDate };
}

export type CalendarCell = {
	iso: string;
	inMonth: boolean;
};

function ymdFromParts(y: number, m: number, d: number): string {
	return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function addCalendarDays(iso: string, delta: number): string {
	const [ys, ms, ds] = iso.split('-').map(Number) as [number, number, number];
	const dt = new Date(ys, ms - 1, ds + delta);
	return ymdFromParts(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

/** Sunday-start month grid, padded to complete weeks. */
export function calendarCellsForMonth(monthKey: string): CalendarCell[] {
	const [ys, ms] = monthKey.split('-');
	const y = Number(ys);
	const m = Number(ms);
	if (!Number.isInteger(y) || m < 1 || m > 12) return [];
	const firstWeekday = new Date(y, m - 1, 1).getDay();
	const lastDay = new Date(y, m, 0).getDate();
	const cells: CalendarCell[] = [];
	for (let i = 0; i < firstWeekday; i++) {
		cells.push({ iso: addCalendarDays(`${monthKey}-01`, i - firstWeekday), inMonth: false });
	}
	for (let day = 1; day <= lastDay; day++) {
		cells.push({ iso: ymdFromParts(y, m, day), inMonth: true });
	}
	while (cells.length % 7 !== 0) {
		const last = cells[cells.length - 1]!;
		cells.push({ iso: addCalendarDays(last.iso, 1), inMonth: false });
	}
	return cells;
}

export function shiftCalendarYear(monthKey: string, delta: number): string {
	const [ys, ms] = monthKey.split('-');
	return `${Number(ys) + delta}-${ms}`;
}

export type ManualPicking = 'start' | 'end';

export function applyManualDayPick(
	range: TransactionDateRange,
	iso: string,
	picking: ManualPicking
): { range: TransactionDateRange; nextPicking: ManualPicking } {
	if (picking === 'start') {
		return { range: rangeFromCustom(iso, iso), nextPicking: 'end' };
	}
	return { range: rangeFromCustom(range.startDate, iso), nextPicking: 'start' };
}

/** Closed trigger copy: month name, or from–to (single day omits the dash). */
export function formatRangeTriggerLabel(
	range: TransactionDateRange,
	locale?: string
): string {
	if (range.mode === 'month' && range.monthKey) {
		return formatMonthLabel(range.monthKey, locale);
	}
	if (range.startDate === range.endDate) {
		return formatOccurredOnDisplay(range.startDate);
	}
	return `${formatOccurredOnDisplay(range.startDate)} – ${formatOccurredOnDisplay(range.endDate)}`;
}

/** Month → Custom keeps the same inclusive bounds. */
export function monthRangeToCustom(range: TransactionDateRange): TransactionDateRange {
	return { mode: 'custom', startDate: range.startDate, endDate: range.endDate };
}

/** Custom → Month snaps to the month of start (that month's default span). */
export function customRangeToMonth(
	range: TransactionDateRange,
	now = new Date()
): TransactionDateRange {
	const monthKey = monthKeyFromDay(range.startDate) ?? currentMonthKey(now);
	const { startDate, endDate } = monthRangeForKey(monthKey, now);
	return { mode: 'month', monthKey, startDate, endDate };
}
