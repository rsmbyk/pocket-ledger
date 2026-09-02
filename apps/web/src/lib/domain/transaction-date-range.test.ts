import { describe, expect, it } from 'vitest';
import { formatMonthLabel } from './month-summary';
import { formatOccurredOnDisplay } from './occurred-on-display';
import {
	applyManualDayPick,
	calendarCellsForMonth,
	formatRangeTriggerLabel,
	rangeFromCustom,
	rangeFromMonthKey,
	shiftCalendarYear
} from './transaction-date-range';

describe('transaction date range picker (Spec 142)', () => {
	it('pads a Sunday-start month grid', () => {
		const cells = calendarCellsForMonth('2026-09');
		expect(cells.length % 7).toBe(0);
		expect(cells[0]).toEqual({ iso: '2026-08-30', inMonth: false });
		expect(cells[2]).toEqual({ iso: '2026-09-01', inMonth: true });
		expect(cells.find((c) => c.iso === '2026-09-30')).toEqual({
			iso: '2026-09-30',
			inMonth: true
		});
		expect(cells.at(-1)).toEqual({ iso: '2026-10-03', inMonth: false });
	});

	it('labels the closed trigger by mode', () => {
		const now = new Date(2026, 8, 2);
		expect(formatRangeTriggerLabel(rangeFromMonthKey('2026-09', now), 'en')).toBe(
			formatMonthLabel('2026-09', 'en')
		);
		expect(
			formatRangeTriggerLabel(rangeFromCustom('2026-08-10', '2026-08-20'), 'en')
		).toBe(`${formatOccurredOnDisplay('2026-08-10')} – ${formatOccurredOnDisplay('2026-08-20')}`);
		expect(formatRangeTriggerLabel(rangeFromCustom('2026-09-02', '2026-09-02'), 'en')).toBe(
			formatOccurredOnDisplay('2026-09-02')
		);
	});

	it('manual first click sets a single day; second click sets the other end', () => {
		const first = applyManualDayPick(rangeFromMonthKey('2026-08'), '2026-08-10', 'start');
		expect(first.nextPicking).toBe('end');
		expect(first.range).toEqual({
			mode: 'custom',
			startDate: '2026-08-10',
			endDate: '2026-08-10'
		});
		const second = applyManualDayPick(first.range, '2026-08-20', first.nextPicking);
		expect(second.nextPicking).toBe('start');
		expect(second.range).toEqual({
			mode: 'custom',
			startDate: '2026-08-10',
			endDate: '2026-08-20'
		});
		const swapped = applyManualDayPick(first.range, '2026-08-01', 'end');
		expect(swapped.range.startDate).toBe('2026-08-01');
		expect(swapped.range.endDate).toBe('2026-08-10');
	});

	it('shifts the year of a month key', () => {
		expect(shiftCalendarYear('2026-09', -1)).toBe('2025-09');
		expect(shiftCalendarYear('2026-09', 1)).toBe('2027-09');
	});
});
