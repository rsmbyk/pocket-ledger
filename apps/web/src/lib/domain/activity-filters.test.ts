import { describe, expect, it } from 'vitest';
import type { LedgerTransaction } from '$lib/domain/transaction';
import {
	activityListSections,
	ADMIN_FEE_CATEGORY_ID,
	amountDigitsMatch,
	countAdvancedFilters,
	filterTransactions,
	filterTriggerSummary,
	groupActivityByOccurredOn,
	initialRevealEndIndex,
	isCategoryFilterCompatible,
	isCategoryFilterDisabled,
	isDefaultActivityFilters,
	hasAdminFeeLedgerRow,
	nextRevealEndIndex,
	resolveCategoryIdsForTypes,
	shouldShowActivityCategoryFilter,
	sortTransactions,
	UNCATEGORIZED_FILTER,
	usedCategoryIds,
	latestPocketTransactions
} from './activity-filters';
import {
	customRangeToMonth,
	defaultTransactionDateRange,
	lastCalendarDayOfMonth,
	monthRangeForKey,
	monthRangeToCustom,
	snapDateRange
} from './transaction-date-range';

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
		feeMinor: partial.feeMinor ?? 0,
		type: partial.type,
		amountMinor: partial.amountMinor,
		occurredOn: partial.occurredOn
	};
}

describe('activity-filters', () => {
	const rows = [
		tx({
			type: 'expense',
			amountMinor: 100_000,
			occurredOn: '2026-07-15',
			categoryId: 'food',
			note: 'secret lunch'
		}),
		tx({
			type: 'income',
			amountMinor: 50_000,
			occurredOn: '2026-07-01',
			categoryId: 'sal',
			note: 'pay'
		}),
		tx({
			type: 'expense',
			amountMinor: 15_000,
			occurredOn: '2026-06-20',
			categoryId: 'food',
			note: 'old'
		})
	];

	it('matches amounts with or without separators', () => {
		expect(amountDigitsMatch(100_000, '10000')).toBe(true);
		expect(amountDigitsMatch(100_000, '100,000')).toBe(true);
		expect(amountDigitsMatch(100_000, '999')).toBe(false);
	});

	it('filters by type, category, dates, and search', () => {
		expect(filterTransactions(rows, { types: ['expense'] })).toHaveLength(2);
		expect(filterTransactions(rows, { categoryIds: ['sal'] })).toHaveLength(1);
		expect(
			filterTransactions(rows, { startDate: '2026-07-10', endDate: '2026-07-31' })
		).toHaveLength(1);
		expect(filterTransactions(rows, { search: 'lunch' })[0]?.note).toBe('secret lunch');
		expect(filterTransactions(rows, { search: '100,000' })).toHaveLength(1);
	});

	it('ORs types and ANDs across fields', () => {
		const mixed = [
			...rows,
			{
				...tx({ type: 'transfer', amountMinor: 100, occurredOn: '2026-07-16', note: 'xfer' }),
				counterAccountId: 'vac'
			}
		];
		expect(
			filterTransactions(mixed, { types: ['income', 'expense'] }).map((t) => t.note)
		).toEqual(['secret lunch', 'pay', 'old']);
		expect(filterTransactions(mixed, { types: ['transfer'] }).map((t) => t.note)).toEqual(['xfer']);
	});

	it('resolves incompatible category selections for type (Spec 107 / 139)', () => {
		const kinds = { food: 'expense' as const, sal: 'income' as const };
		expect(isCategoryFilterDisabled(['transfer'])).toBe(true);
		expect(isCategoryFilterDisabled([])).toBe(false);
		expect(isCategoryFilterDisabled(['income', 'expense'])).toBe(false);
		expect(isCategoryFilterCompatible('food', ['expense'], kinds)).toBe(true);
		expect(isCategoryFilterCompatible('food', ['income'], kinds)).toBe(false);
		expect(isCategoryFilterCompatible(ADMIN_FEE_CATEGORY_ID, [], kinds)).toBe(true);
		expect(isCategoryFilterCompatible(ADMIN_FEE_CATEGORY_ID, ['expense'], kinds)).toBe(true);
		expect(isCategoryFilterCompatible(ADMIN_FEE_CATEGORY_ID, ['income'], kinds)).toBe(false);
		expect(isCategoryFilterCompatible(UNCATEGORIZED_FILTER, ['income'], kinds)).toBe(true);
		expect(resolveCategoryIdsForTypes(['food'], ['income'], kinds)).toEqual([]);
		expect(resolveCategoryIdsForTypes(['food'], ['expense'], kinds)).toEqual(['food']);
		expect(resolveCategoryIdsForTypes([ADMIN_FEE_CATEGORY_ID], ['transfer'], kinds)).toEqual([]);
		expect(resolveCategoryIdsForTypes([], ['transfer'], kinds)).toEqual([]);
	});

	it('filters uncategorized via sentinel', () => {
		const mixed = [
			...rows,
			tx({
				type: 'expense',
				amountMinor: 9,
				occurredOn: '2026-07-16',
				categoryId: null,
				note: 'bare'
			})
		];
		expect(filterTransactions(mixed, { categoryIds: [UNCATEGORIZED_FILTER] })).toHaveLength(1);
		expect(filterTransactions(mixed, { categoryIds: [UNCATEGORIZED_FILTER] })[0]?.note).toBe(
			'bare'
		);
	});

	it('filters Admin Fee via sentinel to transfers or expenses with fee', () => {
		const mixed = [
			tx({ type: 'expense', amountMinor: 9, occurredOn: '2026-07-16', note: 'exp' }),
			tx({
				type: 'expense',
				amountMinor: 9,
				occurredOn: '2026-07-16',
				note: 'exp-fee',
				feeMinor: 40
			}),
			{
				...tx({ type: 'transfer', amountMinor: 100, occurredOn: '2026-07-16', note: 'free' }),
				counterAccountId: 'vac',
				feeMinor: 0
			},
			{
				...tx({ type: 'transfer', amountMinor: 100, occurredOn: '2026-07-16', note: 'paid' }),
				counterAccountId: 'vac',
				feeMinor: 25
			},
			{
				...tx({
					type: 'transfer',
					amountMinor: 100,
					occurredOn: '2026-07-16',
					note: 'void-fee',
					voidedAt: '2026-07-17T00:00:00.000Z'
				}),
				counterAccountId: 'vac',
				feeMinor: 50
			}
		];
		expect(hasAdminFeeLedgerRow(mixed)).toBe(true);
		expect(
			filterTransactions(mixed, {
				categoryIds: [ADMIN_FEE_CATEGORY_ID],
				showVoided: true
			}).map((t) => t.note)
		).toEqual(['exp-fee', 'paid', 'void-fee']);
		expect(
			filterTransactions(mixed, { categoryIds: [ADMIN_FEE_CATEGORY_ID] }).map((t) => t.note)
		).toEqual(['exp-fee', 'paid']);
		expect(
			filterTransactions(mixed, {
				types: ['expense'],
				categoryIds: [ADMIN_FEE_CATEGORY_ID]
			}).map((t) => t.note)
		).toEqual(['exp-fee']);
	});

	it('hides voided by default', () => {
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
		expect(filterTransactions(mixed, {})).toHaveLength(2);
		expect(filterTransactions(mixed, { showVoided: true })).toHaveLength(3);
		expect(filterTransactions(mixed, { showVoided: true }).map((t) => t.note)).toEqual([
			'a',
			'b',
			'c'
		]);
	});

	it('filters by pocket including transfer either side; multi OR', () => {
		const mixed = [
			tx({ type: 'expense', amountMinor: 10, occurredOn: '2026-07-15', note: 'main-exp' }),
			{
				...tx({ type: 'expense', amountMinor: 20, occurredOn: '2026-07-15', note: 'vac-exp' }),
				accountId: 'vac'
			},
			{
				...tx({ type: 'transfer', amountMinor: 30, occurredOn: '2026-07-15', note: 'xfer' }),
				accountId: 'acc',
				counterAccountId: 'vac'
			}
		];
		expect(filterTransactions(mixed, { pocketIds: ['acc'] }).map((t) => t.note)).toEqual([
			'main-exp',
			'xfer'
		]);
		expect(filterTransactions(mixed, { pocketIds: ['vac'] }).map((t) => t.note)).toEqual([
			'vac-exp',
			'xfer'
		]);
		expect(filterTransactions(mixed, { pocketIds: ['acc', 'vac'] })).toHaveLength(3);
		expect(filterTransactions(mixed, { pocketIds: [] })).toHaveLength(3);
	});

	it('detects default filters (dates ignored; voided hidden)', () => {
		expect(isDefaultActivityFilters({})).toBe(true);
		expect(isDefaultActivityFilters({ startDate: '2026-09-01', endDate: '2026-09-02' })).toBe(
			true
		);
		expect(isDefaultActivityFilters({ types: ['expense'] })).toBe(false);
		expect(isDefaultActivityFilters({ showVoided: true })).toBe(false);
		expect(countAdvancedFilters({ showVoided: true })).toBe(1);
		expect(countAdvancedFilters({ startDate: '2026-09-01' })).toBe(0);
		expect(countAdvancedFilters({})).toBe(0);
	});

	it('summarizes multi-select triggers', () => {
		expect(filterTriggerSummary([], () => 'x')).toBe('All');
		expect(filterTriggerSummary(['food'], (id) => (id === 'food' ? 'Food' : id))).toBe('Food');
		expect(filterTriggerSummary(['a', 'b'], (id) => id)).toBe('2 selected');
	});

	it('always sorts occurredOn desc then createdAt desc then id', () => {
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
		expect(sortTransactions(mixed).map((t) => t.id)).toEqual(['2', '1']);
	});

	it('latestPocketTransactions caps at 10, hides voided, includes transfer either side (148)', () => {
		const rows: LedgerTransaction[] = [];
		for (let i = 1; i <= 12; i++) {
			rows.push({
				...tx({
					id: `n-${i}`,
					type: 'expense',
					amountMinor: i,
					occurredOn: `2026-01-${String(i).padStart(2, '0')}`,
					note: `n-${i}`
				}),
				accountId: 'vac'
			});
		}
		rows.push({
			...tx({
				id: 'voided',
				type: 'expense',
				amountMinor: 99,
				occurredOn: '2026-06-01',
				voidedAt: '2026-06-02T00:00:00.000Z',
				note: 'voided'
			}),
			accountId: 'vac'
		});
		rows.push({
			...tx({
				id: 'xfer',
				type: 'transfer',
				amountMinor: 30,
				occurredOn: '2026-07-15',
				note: 'xfer'
			}),
			accountId: 'acc',
			counterAccountId: 'vac'
		});
		const latest = latestPocketTransactions(rows, 'vac', 10);
		expect(latest).toHaveLength(10);
		expect(latest.map((t) => t.id)).toEqual([
			'xfer',
			'n-12',
			'n-11',
			'n-10',
			'n-9',
			'n-8',
			'n-7',
			'n-6',
			'n-5',
			'n-4'
		]);
		expect(latest.some((t) => t.id === 'voided')).toBe(false);
	});

	it('orders same-day rows by createdAt desc (Spec 101 / 134)', () => {
		const sameDay = [
			tx({
				id: 'old-created',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-15',
				createdAt: '2026-07-01T10:00:00.000Z'
			}),
			tx({
				id: 'new-created',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-15',
				createdAt: '2026-07-20T10:00:00.000Z'
			}),
			tx({
				id: 'other-day',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-16',
				createdAt: '2026-06-01T10:00:00.000Z'
			})
		];
		expect(sortTransactions(sameDay).map((t) => t.id)).toEqual([
			'other-day',
			'new-created',
			'old-created'
		]);
	});

	it('always groups by occurredOn with date headers', () => {
		const sortedDesc = sortTransactions([
			tx({
				id: 'a',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-16',
				createdAt: '2026-07-16T10:00:00.000Z'
			}),
			tx({
				id: 'b',
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-16',
				createdAt: '2026-07-16T09:00:00.000Z'
			}),
			tx({ id: 'c', type: 'expense', amountMinor: 1, occurredOn: '2026-07-15' })
		]);
		const groups = groupActivityByOccurredOn(sortedDesc);
		expect(groups.map((g) => g.occurredOn)).toEqual(['2026-07-16', '2026-07-15']);
		expect(groups[0]?.transactions.map((t) => t.id)).toEqual(['a', 'b']);

		const sections = activityListSections(sortedDesc);
		expect(sections.filter((s) => s.kind === 'header')).toHaveLength(2);
		expect(sections[0]).toEqual({ kind: 'header', occurredOn: '2026-07-16' });
	});

	it('reveals whole days and never splits a day', () => {
		const many = Array.from({ length: 100 }, (_, i) =>
			tx({
				id: `r${i}`,
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-01',
				createdAt: `2026-07-01T00:${String(i).padStart(2, '0')}:00.000Z`
			})
		);
		expect(initialRevealEndIndex(many, 40)).toBe(100);
		expect(nextRevealEndIndex(many, 100, 40)).toBe(100);

		const dayA = Array.from({ length: 10 }, (_, i) =>
			tx({ id: `a${i}`, type: 'expense', amountMinor: 1, occurredOn: '2026-07-20' })
		);
		const dayB = Array.from({ length: 50 }, (_, i) =>
			tx({ id: `b${i}`, type: 'expense', amountMinor: 1, occurredOn: '2026-07-19' })
		);
		const dateSorted = [...dayA, ...dayB];
		const first = initialRevealEndIndex(dateSorted, 40);
		expect(first).toBe(60);
		const lastDay = dateSorted[first - 1]!.occurredOn;
		expect(dateSorted[first] === undefined || dateSorted[first]!.occurredOn !== lastDay).toBe(
			true
		);
	});
});

describe('usedCategoryIds / shouldShowActivityCategoryFilter (Spec 132)', () => {
	it('includes voided rows and skips null categoryId', () => {
		const rows = [
			tx({ type: 'expense', amountMinor: 1, occurredOn: '2026-07-15', categoryId: 'food' }),
			tx({
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-16',
				categoryId: 'food',
				voidedAt: '2026-07-16T00:00:00.000Z'
			}),
			tx({
				type: 'income',
				amountMinor: 1,
				occurredOn: '2026-07-17',
				categoryId: null
			}),
			tx({
				type: 'expense',
				amountMinor: 1,
				occurredOn: '2026-07-18',
				categoryId: 'groc',
				voidedAt: '2026-07-18T00:00:00.000Z'
			})
		];
		expect([...usedCategoryIds(rows)].sort()).toEqual(['food', 'groc']);
		expect(shouldShowActivityCategoryFilter(rows)).toBe(true);
	});

	it('hides the control for an empty ledger', () => {
		expect(usedCategoryIds([]).size).toBe(0);
		expect(shouldShowActivityCategoryFilter([])).toBe(false);
	});

	it('hides the control when every row is uncategorized', () => {
		const rows = [
			tx({ type: 'income', amountMinor: 1, occurredOn: '2026-07-01', categoryId: null }),
			tx({ type: 'transfer', amountMinor: 1, occurredOn: '2026-07-02', categoryId: null })
		];
		expect(usedCategoryIds(rows).size).toBe(0);
		expect(shouldShowActivityCategoryFilter(rows)).toBe(false);
	});
});

describe('transaction date range (Spec 141)', () => {
	it('uses today as end for the current month and last day otherwise', () => {
		const now = new Date(2026, 8, 2);
		expect(monthRangeForKey('2026-09', now)).toEqual({
			startDate: '2026-09-01',
			endDate: '2026-09-02'
		});
		expect(monthRangeForKey('2026-08', now)).toEqual({
			startDate: '2026-08-01',
			endDate: '2026-08-31'
		});
		expect(lastCalendarDayOfMonth('2026-02')).toBe('2026-02-28');
		expect(defaultTransactionDateRange(now)).toEqual({
			mode: 'month',
			monthKey: '2026-09',
			startDate: '2026-09-01',
			endDate: '2026-09-02'
		});
	});

	it('snaps start after end', () => {
		expect(snapDateRange('2026-09-10', '2026-09-01')).toEqual({
			startDate: '2026-09-01',
			endDate: '2026-09-10'
		});
	});

	it('maps month ↔ custom', () => {
		const now = new Date(2026, 8, 2);
		const august = {
			mode: 'month' as const,
			monthKey: '2026-08',
			startDate: '2026-08-01',
			endDate: '2026-08-31'
		};
		expect(monthRangeToCustom(august)).toEqual({
			mode: 'custom',
			startDate: '2026-08-01',
			endDate: '2026-08-31'
		});
		expect(
			customRangeToMonth(
				{ mode: 'custom', startDate: '2026-07-04', endDate: '2026-07-20' },
				now
			)
		).toEqual({
			mode: 'month',
			monthKey: '2026-07',
			startDate: '2026-07-01',
			endDate: '2026-07-31'
		});
	});
});
