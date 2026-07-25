import { describe, expect, it } from 'vitest';
import type { LedgerTransaction } from '$lib/domain/transaction';
import {
	buildMonthSummary,
	canShiftMonth,
	clampMonthKey,
	currentMonthKey,
	formatMonthLabel,
	isValidMonthKey,
	resolveMonthBounds,
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
		counterAccountId: partial.counterAccountId ?? null,
		categoryId: partial.categoryId ?? null,
		note: partial.note ?? '',
		createdAt: partial.createdAt ?? '2026-07-14T00:00:00.000Z',
		type: partial.type,
		amountMinor: partial.amountMinor,
		feeMinor: partial.feeMinor ?? 0,
		occurredOn: partial.occurredOn,
		voidedAt: partial.voidedAt ?? null
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
		const pocket = { id: 'acc', openingBalanceMinor: 0, openingAsOf: '2026-01-01' };
		const rows = [
			tx({ type: 'income', amountMinor: 100_000, occurredOn: '2026-07-01', categoryId: 'sal' }),
			tx({ type: 'income', amountMinor: 20_000, occurredOn: '2026-07-05', categoryId: 'side' }),
			tx({ type: 'expense', amountMinor: 15_000, occurredOn: '2026-07-02', categoryId: 'food' }),
			tx({ type: 'expense', amountMinor: 5_000, occurredOn: '2026-07-03', categoryId: 'food' }),
			tx({ type: 'expense', amountMinor: 8_000, occurredOn: '2026-07-04', categoryId: 'ride' }),
			tx({ type: 'expense', amountMinor: 1_000, occurredOn: '2026-06-01', categoryId: 'food' })
		];

		const summary = buildMonthSummary(
			rows,
			'2026-07',
			{
				food: { name: 'Food', sortOrder: 0 },
				ride: { name: 'Transport', sortOrder: 1 },
				sal: { name: 'Salary', sortOrder: 0 },
				side: { name: 'Side', sortOrder: 1 }
			},
			[pocket]
		);

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

	it('infers opening from pocket openings walking backward and forward', () => {
		const pocket = { id: 'a', openingBalanceMinor: 100_000, openingAsOf: '2026-06-15' };
		const midGap = [
			tx({
				type: 'expense',
				amountMinor: 25_000,
				accountId: 'a',
				occurredOn: '2026-06-05',
				categoryId: 'food'
			})
		];
		expect(buildMonthSummary(midGap, '2026-06', {}, [pocket]).openingMinor).toBe(125_000);

		const later = [
			tx({
				type: 'expense',
				amountMinor: 10_000,
				accountId: 'a',
				occurredOn: '2026-06-20',
				categoryId: 'food'
			})
		];
		expect(buildMonthSummary(later, '2026-07', {}, [pocket]).openingMinor).toBe(90_000);
	});

	it('sums opening across pockets', () => {
		const pockets = [
			{ id: 'a', openingBalanceMinor: 100_000, openingAsOf: '2026-06-01' },
			{ id: 'b', openingBalanceMinor: 50_000, openingAsOf: '2026-06-01' }
		];
		const summary = buildMonthSummary([], '2026-06', {}, pockets);
		expect(summary.openingMinor).toBe(150_000);
		expect(summary.endingMinor).toBe(150_000);
	});

	it('orders categories by sortOrder with Admin Fee before Uncategorized', () => {
		const rows = [
			tx({ type: 'expense', amountMinor: 5_000, occurredOn: '2026-07-02', categoryId: 'b' }),
			tx({ type: 'expense', amountMinor: 50_000, occurredOn: '2026-07-02', categoryId: 'a' }),
			tx({ type: 'expense', amountMinor: 1_000, occurredOn: '2026-07-02', categoryId: null }),
			tx({
				type: 'transfer',
				amountMinor: 10_000,
				feeMinor: 250,
				occurredOn: '2026-07-02',
				accountId: 'main',
				counterAccountId: 'vac'
			})
		];
		const summary = buildMonthSummary(rows, '2026-07', {
			a: { name: 'Alpha', sortOrder: 1 },
			b: { name: 'Beta', sortOrder: 0 }
		});
		expect(summary.expenseByCategory.map((r) => r.label)).toEqual([
			'Beta',
			'Alpha',
			'Admin Fee',
			'Uncategorized'
		]);
		expect(summary.expenseMinor).toBe(5_000 + 50_000 + 1_000 + 250);
	});

	it('counts transfer fees as expense and reduces opening by prior fees', () => {
		const pockets = [
			{ id: 'main', openingBalanceMinor: 0, openingAsOf: '2026-01-01' },
			{ id: 'vac', openingBalanceMinor: 0, openingAsOf: '2026-01-01' }
		];
		const rows = [
			tx({
				type: 'transfer',
				amountMinor: 10_000,
				feeMinor: 250,
				occurredOn: '2026-06-15',
				accountId: 'main',
				counterAccountId: 'vac'
			}),
			tx({
				type: 'transfer',
				amountMinor: 5_000,
				feeMinor: 100,
				occurredOn: '2026-07-02',
				accountId: 'main',
				counterAccountId: 'vac'
			}),
			tx({
				type: 'transfer',
				amountMinor: 1_000,
				feeMinor: 0,
				occurredOn: '2026-07-03',
				accountId: 'main',
				counterAccountId: 'vac'
			})
		];
		const summary = buildMonthSummary(rows, '2026-07', {}, pockets);
		expect(summary.openingMinor).toBe(-250);
		expect(summary.expenseMinor).toBe(100);
		expect(summary.expenseByCategory).toEqual([
			{ categoryId: '__admin_fee__', label: 'Admin Fee', amountMinor: 100 }
		]);
		expect(summary.endingMinor).toBe(-350);
	});

	it('ignores voided transfer fees', () => {
		const rows = [
			tx({
				type: 'transfer',
				amountMinor: 10_000,
				feeMinor: 250,
				occurredOn: '2026-07-02',
				accountId: 'main',
				counterAccountId: 'vac',
				voidedAt: '2026-07-03T00:00:00.000Z'
			})
		];
		const summary = buildMonthSummary(rows, '2026-07', {});
		expect(summary.expenseMinor).toBe(0);
		expect(summary.expenseByCategory).toEqual([]);
	});

	it('ignores voided transactions in totals and opening', () => {
		const pocket = { id: 'acc', openingBalanceMinor: 0, openingAsOf: '2026-01-01' };
		const rows = [
			tx({ type: 'expense', amountMinor: 15_000, occurredOn: '2026-07-02', categoryId: 'food' }),
			tx({
				type: 'expense',
				amountMinor: 9_000,
				occurredOn: '2026-07-03',
				categoryId: 'food',
				voidedAt: '2026-07-16T00:00:00.000Z'
			}),
			tx({
				type: 'income',
				amountMinor: 50_000,
				occurredOn: '2026-06-01',
				voidedAt: '2026-07-16T00:00:00.000Z'
			})
		];
		const summary = buildMonthSummary(
			rows,
			'2026-07',
			{ food: { name: 'Food', sortOrder: 0 } },
			[pocket]
		);
		expect(summary.expenseMinor).toBe(15_000);
		expect(summary.openingMinor).toBe(0);
		expect(summary.endingMinor).toBe(-15_000);
	});

	it('formats month labels', () => {
		expect(formatMonthLabel('2026-07', 'en')).toMatch(/2026/);
		expect(currentMonthKey(new Date('2026-07-14T12:00:00'))).toBe('2026-07');
	});

	describe('month bounds', () => {
		const now = new Date('2026-07-14T12:00:00');

		it('uses earliest openingAsOf when there are no transactions', () => {
			expect(resolveMonthBounds([], ['2026-03-15', '2026-05-01'], now)).toEqual({
				earliest: '2026-03',
				latest: '2026-07'
			});
		});

		it('uses earliest non-voided transaction when earlier than openings', () => {
			const rows = [
				tx({ type: 'expense', amountMinor: 1_000, occurredOn: '2026-04-10' }),
				tx({ type: 'income', amountMinor: 2_000, occurredOn: '2026-06-01' })
			];
			expect(resolveMonthBounds(rows, ['2026-06-01'], now)).toEqual({
				earliest: '2026-04',
				latest: '2026-07'
			});
		});

		it('ignores voided transactions for earliest bound', () => {
			const rows = [
				tx({
					type: 'expense',
					amountMinor: 1_000,
					occurredOn: '2026-04-10',
					voidedAt: '2026-04-11T00:00:00.000Z'
				})
			];
			expect(resolveMonthBounds(rows, ['2026-06-01'], now)).toEqual({
				earliest: '2026-06',
				latest: '2026-07'
			});
		});

		it('clamps earliest to latest when opening is in the future', () => {
			expect(resolveMonthBounds([], ['2026-09-01'], now)).toEqual({
				earliest: '2026-07',
				latest: '2026-07'
			});
		});

		it('defaults earliest to latest when no openings or txs', () => {
			expect(resolveMonthBounds([], [], now)).toEqual({
				earliest: '2026-07',
				latest: '2026-07'
			});
		});

		it('clamps month keys into bounds', () => {
			const bounds = { earliest: '2026-03', latest: '2026-07' };
			expect(clampMonthKey('2026-01', bounds)).toBe('2026-03');
			expect(clampMonthKey('2026-12', bounds)).toBe('2026-07');
			expect(clampMonthKey('2026-05', bounds)).toBe('2026-05');
		});

		it('reports whether a month shift stays in bounds', () => {
			const bounds = { earliest: '2026-03', latest: '2026-07' };
			expect(canShiftMonth('2026-03', -1, bounds)).toBe(false);
			expect(canShiftMonth('2026-03', 1, bounds)).toBe(true);
			expect(canShiftMonth('2026-07', 1, bounds)).toBe(false);
			expect(canShiftMonth('2026-07', -1, bounds)).toBe(true);
		});
	});
});
