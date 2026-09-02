import { currentMonthKey, monthKeyFromDay } from './month-summary';
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
