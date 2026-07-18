import { describe, expect, it } from 'vitest';
import type { LedgerTransaction } from '$lib/domain/transaction';
import {
	activityListSections,
	amountDigitsMatch,
	filterTransactions,
	groupActivityByOccurredOn,
	initialRevealEndIndex,
	isDefaultActivityFilters,
	nextRevealEndIndex,
	sortTransactions,
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
		createdAt: partial.createdAt ?? '2026-07-14T00:00:00.000Z',
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

	it('detects default filters', () => {
		expect(isDefaultActivityFilters({})).toBe(true);
		expect(isDefaultActivityFilters({ type: 'expense' })).toBe(false);
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

	it('groups by occurredOn only for date sorts', () => {
		const sortedDesc = sortTransactions(
			[
				tx({ id: 'a', type: 'expense', amountMinor: 1, occurredOn: '2026-07-16' }),
				tx({ id: 'b', type: 'expense', amountMinor: 1, occurredOn: '2026-07-16' }),
				tx({ id: 'c', type: 'expense', amountMinor: 1, occurredOn: '2026-07-15' })
			],
			'occurredOn-desc'
		);
		const groups = groupActivityByOccurredOn(sortedDesc, 'occurredOn-desc');
		expect(groups.map((g) => g.occurredOn)).toEqual(['2026-07-16', '2026-07-15']);
		expect(groups[0]?.transactions.map((t) => t.id)).toEqual(['a', 'b']);

		const flat = groupActivityByOccurredOn(sortedDesc, 'createdAt-desc');
		expect(flat).toHaveLength(1);
		expect(flat[0]?.occurredOn).toBe('');
		expect(flat[0]?.transactions).toHaveLength(3);

		const sections = activityListSections(sortedDesc, 'occurredOn-desc');
		expect(sections.filter((s) => s.kind === 'header')).toHaveLength(2);
		expect(activityListSections(sortedDesc, 'createdAt-desc').every((s) => s.kind === 'row')).toBe(
			true
		);
	});

	it('reveals by rows for Default and whole days for date sorts', () => {
		const many = Array.from({ length: 100 }, (_, i) =>
			tx({
				id: `r${i}`,
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-01',
				createdAt: `2026-07-01T00:${String(i).padStart(2, '0')}:00.000Z`
			})
		);
		expect(initialRevealEndIndex(many, 'createdAt-desc', 40)).toBe(40);
		expect(nextRevealEndIndex(many, 40, 'createdAt-desc', 40)).toBe(80);
		expect(nextRevealEndIndex(many, 80, 'createdAt-desc', 40)).toBe(100);
		expect(nextRevealEndIndex(many, 100, 'createdAt-desc', 40)).toBe(100);

		const dayA = Array.from({ length: 10 }, (_, i) =>
			tx({ id: `a${i}`, type: 'expense', amountMinor: 1, occurredOn: '2026-07-20' })
		);
		const dayB = Array.from({ length: 50 }, (_, i) =>
			tx({ id: `b${i}`, type: 'expense', amountMinor: 1, occurredOn: '2026-07-19' })
		);
		const dateSorted = [...dayA, ...dayB];
		const first = initialRevealEndIndex(dateSorted, 'occurredOn-desc', 40);
		expect(first).toBe(60);
		expect(dateSorted.slice(0, first).every((t, _, arr) => {
			const days = new Set(arr.map((x) => x.occurredOn));
			return days.size === 2;
		})).toBe(true);
		const lastDay = dateSorted[first - 1]!.occurredOn;
		expect(dateSorted[first] === undefined || dateSorted[first]!.occurredOn !== lastDay).toBe(true);
	});
});
