import { describe, expect, it } from 'vitest';
import {
	addCalendarDays,
	isDueInHomeWindow,
	nextDueOn,
	ordinalDay,
	planAsListTransaction,
	planTouchesPocket,
	repeatChipLabel,
	repeatOptionLabel,
	resolveMonthDay,
	weekdayName,
	type LedgerPlan
} from './plan';

function plan(partial: Partial<LedgerPlan> & Pick<LedgerPlan, 'id' | 'dueOn'>): LedgerPlan {
	return {
		description: '',
		type: 'expense',
		amountMinor: 1_000,
		feeMinor: 0,
		categoryId: null,
		accountId: 'main',
		counterAccountId: null,
		note: '',
		createdAt: '2026-01-01T00:00:00.000Z',
		frequency: 'once',
		monthDay: null,
		...partial
	};
}

describe('plan domain', () => {
	it('includes due dates in the inclusive today-7 … today+7 window', () => {
		const today = '2026-09-07';
		expect(isDueInHomeWindow(addCalendarDays(today, -7), today)).toBe(true);
		expect(isDueInHomeWindow(addCalendarDays(today, 3), today)).toBe(true);
		expect(isDueInHomeWindow(addCalendarDays(today, 7), today)).toBe(true);
		expect(isDueInHomeWindow(addCalendarDays(today, -8), today)).toBe(false);
		expect(isDueInHomeWindow(addCalendarDays(today, 21), today)).toBe(false);
	});

	it('maps a plan onto tx-row chrome using dueOn as the date', () => {
		const row = planAsListTransaction(
			plan({ id: 'p1', dueOn: '2026-09-10', note: 'rent', amountMinor: 5_000 })
		);
		expect(row.occurredOn).toBe('2026-09-10');
		expect(row.note).toBe('rent');
		expect(row.voidedAt).toBeNull();
	});

	it('treats transfer dest as touching a pocket', () => {
		const transfer = plan({
			id: 't1',
			dueOn: '2026-09-10',
			type: 'transfer',
			accountId: 'main',
			counterAccountId: 'vac'
		});
		expect(planTouchesPocket(transfer, 'vac')).toBe(true);
		expect(planTouchesPocket(transfer, 'other')).toBe(false);
	});

	it('advances weekly by seven calendar days and leaves Once n/a', () => {
		expect(nextDueOn('2026-09-07', 'weekly', null)).toBe('2026-09-14');
		expect(nextDueOn('2026-09-07', 'once', null)).toBeNull();
	});

	it('clamps monthly to the last day and retries stored monthDay later', () => {
		expect(nextDueOn('2026-01-31', 'monthly', 31)).toBe('2026-02-28');
		expect(nextDueOn('2026-02-28', 'monthly', 31)).toBe('2026-03-31');
		expect(nextDueOn('2024-01-31', 'monthly', 31)).toBe('2024-02-29');
	});

	it('stores monthDay only for monthly Repeat', () => {
		expect(resolveMonthDay('once', '2026-01-31')).toBeNull();
		expect(resolveMonthDay('weekly', '2026-01-31')).toBeNull();
		expect(resolveMonthDay('monthly', '2026-01-31')).toBe(31);
		expect(resolveMonthDay('monthly', '2026-02-28', 31)).toBe(31);
	});

	it('builds Repeat labels from Due and chips without the weekday/ordinal', () => {
		expect(weekdayName('2026-09-07')).toBe('Monday');
		expect(ordinalDay(31)).toBe('31st');
		expect(ordinalDay(2)).toBe('2nd');
		expect(ordinalDay(3)).toBe('3rd');
		expect(ordinalDay(11)).toBe('11th');
		expect(repeatOptionLabel('once', '2026-09-07')).toBe('Once');
		expect(repeatOptionLabel('weekly', '2026-09-07')).toBe('Weekly (on Monday)');
		expect(repeatOptionLabel('weekly', '2026-09-10')).toBe('Weekly (on Thursday)');
		expect(repeatOptionLabel('monthly', '2026-01-31')).toBe('Monthly (on the 31st)');
		expect(repeatChipLabel('once')).toBeNull();
		expect(repeatChipLabel('weekly')).toBe('Weekly');
		expect(repeatChipLabel('monthly')).toBe('Monthly');
	});
});
