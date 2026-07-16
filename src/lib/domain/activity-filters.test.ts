import { describe, expect, it } from 'vitest';
import type { LedgerTransaction } from '$lib/domain/transaction';
import {
	amountDigitsMatch,
	filterTransactions,
	isDefaultActivityFilters,
	nextActivityDateSort,
	sortTransactionsByDate,
	UNCATEGORIZED_FILTER
} from './activity-filters';

function tx(
	partial: Partial<LedgerTransaction> &
		Pick<LedgerTransaction, 'type' | 'amountMinor' | 'occurredOn'>
): LedgerTransaction {
	return {
		id: partial.id ?? crypto.randomUUID(),
		accountId: 'acc',
		counterAccountId: null,
		categoryId: partial.categoryId ?? null,
		note: partial.note ?? '',
		createdAt: '2026-07-14T00:00:00.000Z',
		voidedAt: partial.voidedAt ?? null,
		type: partial.type,
		amountMinor: partial.amountMinor,
		occurredOn: partial.occurredOn
	};
}

describe('activity-filters', () => {
	const rows = [
		tx({ type: 'expense', amountMinor: 100_000, occurredOn: '2026-07-15', categoryId: 'food', note: 'secret lunch' }),
		tx({ type: 'income', amountMinor: 50_000, occurredOn: '2026-07-01', categoryId: 'sal', note: 'pay' }),
		tx({ type: 'expense', amountMinor: 15_000, occurredOn: '2026-06-20', categoryId: 'food', note: 'old' })
	];

	it('matches amounts with or without separators', () => {
		expect(amountDigitsMatch(100_000, '10000')).toBe(true);
		expect(amountDigitsMatch(100_000, '100,000')).toBe(true);
		expect(amountDigitsMatch(100_000, '999')).toBe(false);
	});

	it('filters by type, category, dates, and search', () => {
		expect(filterTransactions(rows, { type: 'expense' })).toHaveLength(2);
		expect(filterTransactions(rows, { categoryId: 'sal' })).toHaveLength(1);
		expect(filterTransactions(rows, { startDate: '2026-07-10', endDate: '2026-07-31' })).toHaveLength(
			1
		);
		expect(filterTransactions(rows, { search: 'lunch' })[0]?.note).toBe('secret lunch');
		expect(filterTransactions(rows, { search: '100,000' })).toHaveLength(1);
	});

	it('filters uncategorized via sentinel', () => {
		const mixed = [
			...rows,
			tx({ type: 'expense', amountMinor: 9, occurredOn: '2026-07-16', categoryId: null, note: 'bare' })
		];
		expect(filterTransactions(mixed, { categoryId: UNCATEGORIZED_FILTER })).toHaveLength(1);
		expect(filterTransactions(mixed, { categoryId: UNCATEGORIZED_FILTER })[0]?.note).toBe('bare');
	});

	it('hides voided and compares amount lt/gt', () => {
		const mixed = [
			tx({ type: 'expense', amountMinor: 10_000, occurredOn: '2026-07-15', note: 'a' }),
			tx({
				type: 'expense',
				amountMinor: 20_000,
				occurredOn: '2026-07-15',
				note: 'b',
				voidedAt: '2026-07-16T00:00:00.000Z'
			}),
			tx({ type: 'expense', amountMinor: 30_000, occurredOn: '2026-07-15', note: 'c' })
		];
		expect(filterTransactions(mixed, { hideVoided: true })).toHaveLength(2);
		expect(filterTransactions(mixed, { amountOp: 'lt', amountRaw: '25000' }).map((t) => t.note)).toEqual([
			'a',
			'b'
		]);
		expect(filterTransactions(mixed, { amountOp: 'gt', amountRaw: '15,000' }).map((t) => t.note)).toEqual([
			'b',
			'c'
		]);
	});

	it('detects default filters and cycles date sort', () => {
		expect(isDefaultActivityFilters({})).toBe(true);
		expect(isDefaultActivityFilters({ type: 'expense' })).toBe(false);
		expect(nextActivityDateSort('createdAt-desc')).toBe('occurredOn-desc');
		expect(nextActivityDateSort('occurredOn-desc')).toBe('occurredOn-asc');
		expect(nextActivityDateSort('occurredOn-asc')).toBe('createdAt-desc');
	});

	it('sorts by createdAt then occurredOn', () => {
		const mixed = [
			tx({
				id: '1',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-01',
				createdAt: '2026-07-10T00:00:00.000Z',
				note: 'older-created'
			}),
			tx({
				id: '2',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-20',
				createdAt: '2026-07-01T00:00:00.000Z',
				note: 'newer-occurred'
			})
		];
		expect(sortTransactionsByDate(mixed, 'createdAt-desc')[0]?.id).toBe('1');
		expect(sortTransactionsByDate(mixed, 'occurredOn-desc')[0]?.id).toBe('2');
		expect(sortTransactionsByDate(mixed, 'occurredOn-asc')[0]?.id).toBe('1');
	});
});
