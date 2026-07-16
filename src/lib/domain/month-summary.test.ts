import { describe, expect, it } from 'vitest';
import type { LedgerTransaction } from '$lib/domain/transaction';
import {
	buildMonthSummary,
	currentMonthKey,
	formatMonthLabel,
	isValidMonthKey,
	shiftMonth,
	transactionInMonth
} from './month-summary';

function tx(
	partial: Partial<LedgerTransaction> &
		Pick<LedgerTransaction, 'type' | 'amountMinor' | 'occurredOn'>
): LedgerTransaction {
	return {
		id: partial.id ?? crypto.randomUUID(),
		accountId: partial.accountId ?? 'acc',
		counterAccountId: null,
		categoryId: partial.categoryId ?? null,
		note: partial.note ?? '',
		createdAt: partial.createdAt ?? '2026-07-14T00:00:00.000Z',
		type: partial.type,
		amountMinor: partial.amountMinor,
		occurredOn: partial.occurredOn
	};
}

describe('month-summary', () => {
	it('validates and shifts month keys', () => {
		expect(isValidMonthKey('2026-07')).toBe(true);
		expect(isValidMonthKey('2026-13')).toBe(false);
		expect(shiftMonth('2026-01', -1)).toBe('2025-12');
		expect(shiftMonth('2026-07', 1)).toBe('2026-08');
	});

	it('detects transactions in a month', () => {
		expect(transactionInMonth({ occurredOn: '2026-07-14' }, '2026-07')).toBe(true);
		expect(transactionInMonth({ occurredOn: '2026-06-30' }, '2026-07')).toBe(false);
	});

	it('builds empty summary for a quiet month', () => {
		const summary = buildMonthSummary([], '2026-07', {});
		expect(summary).toEqual({
			monthKey: '2026-07',
			incomeMinor: 0,
			expenseMinor: 0,
			netMinor: 0,
			incomeByCategory: [],
			expenseByCategory: [],
			openingMinor: 0,
			endingMinor: 0
		});
	});

	it('aggregates income, expense, net, and category breakdowns', () => {
		const rows = [
			tx({ type: 'income', amountMinor: 100_000, occurredOn: '2026-07-01', categoryId: 'sal' }),
			tx({ type: 'income', amountMinor: 20_000, occurredOn: '2026-07-05', categoryId: 'side' }),
			tx({ type: 'expense', amountMinor: 15_000, occurredOn: '2026-07-02', categoryId: 'food' }),
			tx({ type: 'expense', amountMinor: 5_000, occurredOn: '2026-07-03', categoryId: 'food' }),
			tx({ type: 'expense', amountMinor: 8_000, occurredOn: '2026-07-04', categoryId: 'ride' }),
			tx({ type: 'expense', amountMinor: 1_000, occurredOn: '2026-06-01', categoryId: 'food' })
		];

		const summary = buildMonthSummary(rows, '2026-07', {
			food: 'Food',
			ride: 'Transport',
			sal: 'Salary',
			side: 'Side'
		});

		expect(summary.incomeMinor).toBe(120_000);
		expect(summary.expenseMinor).toBe(28_000);
		expect(summary.netMinor).toBe(92_000);
		expect(summary.incomeByCategory).toEqual([
			{ categoryId: 'sal', label: 'Salary', amountMinor: 100_000 },
			{ categoryId: 'side', label: 'Side', amountMinor: 20_000 }
		]);
		expect(summary.expenseByCategory).toEqual([
			{ categoryId: 'food', label: 'Food', amountMinor: 20_000 },
			{ categoryId: 'ride', label: 'Transport', amountMinor: 8_000 }
		]);
		expect(summary.openingMinor).toBe(-1_000);
		expect(summary.endingMinor).toBe(91_000);
	});

	it('formats month labels', () => {
		expect(formatMonthLabel('2026-07', 'en')).toMatch(/2026/);
		expect(currentMonthKey(new Date('2026-07-14T12:00:00'))).toBe('2026-07');
	});
});
