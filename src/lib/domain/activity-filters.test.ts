import { describe, expect, it } from 'vitest';
import type { LedgerTransaction } from '$lib/domain/transaction';
import { amountDigitsMatch, filterTransactions } from './activity-filters';

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

	it('keeps voided rows when they match', () => {
		const withVoid = [
			...rows,
			tx({
				type: 'expense',
				amountMinor: 1_000,
				occurredOn: '2026-07-16',
				categoryId: 'food',
				note: 'voided snack',
				voidedAt: '2026-07-16T12:00:00.000Z'
			})
		];
		expect(filterTransactions(withVoid, { search: 'voided' })).toHaveLength(1);
	});
});
