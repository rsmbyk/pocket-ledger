import { describe, expect, it } from 'vitest';
import { goalBarFillCss } from './goals';
import {
	assertBudgetLimit,
	assertBudgetStartOn,
	budgetBarFillCss,
	budgetBarWidthPercent,
	budgetProgressPercent,
	budgetUsedMinor,
	budgetWouldExceed,
	effectiveStartOn,
	exceededBudgets,
	findDuplicateActiveScope,
	formatBudgetAppliesTitle,
	groupSelectionState,
	hydrateBudgetScope,
	isActiveBudget,
	isAllSelectable,
	resolveAppliesTo,
	budgetScopeKey,
	sortActiveBudgets,
	txContribution,
	withGroupToggled,
	type PocketBudget
} from './budgets';
import type { LedgerTransaction } from './transaction';

function budget(partial: Partial<PocketBudget> & Pick<PocketBudget, 'id'>): PocketBudget {
	return {
		accountId: 'p',
		appliesTo: 'categories',
		categoryIds: ['groceries'],
		limitMinor: 10_000,
		hardLimit: false,
		period: 'ongoing',
		startOn: '2026-09-01',
		createdAt: '2026-09-01T00:00:00.000Z',
		cancelledAt: null,
		deletedAt: null,
		groupIds: [],
		...partial
	};
}

function tx(partial: Partial<LedgerTransaction> & Pick<LedgerTransaction, 'id'>): LedgerTransaction {
	return {
		accountId: 'p',
		counterAccountId: null,
		type: 'expense',
		amountMinor: 1_000,
		feeMinor: 0,
		categoryId: 'groceries',
		note: '',
		occurredOn: '2026-09-05',
		createdAt: '2026-09-05T00:00:00.000Z',
		voidedAt: null,
		...partial
	};
}

describe('budgets domain', () => {
	const today = '2026-09-09';

	it('asserts a positive limit and a start date not after today', () => {
		expect(() => assertBudgetLimit(1)).not.toThrow();
		expect(() => assertBudgetLimit(0)).toThrow(/positive/i);
		assertBudgetStartOn('2026-09-09', today);
		expect(() => assertBudgetStartOn('2026-09-10', today)).toThrow(/today/i);
	});

	it('derives monthly effective start without rewriting startOn', () => {
		const monthly = budget({ id: 'm', period: 'monthly', startOn: '2026-08-15' });
		expect(effectiveStartOn(monthly, '2026-08-20')).toBe('2026-08-15');
		expect(effectiveStartOn(monthly, '2026-09-09')).toBe('2026-09-01');
		expect(effectiveStartOn(budget({ id: 'o', period: 'ongoing', startOn: '2026-08-15' }), today)).toBe(
			'2026-08-15'
		);
	});

	it('counts category-scope expense principal only inside the window', () => {
		const b = budget({ id: 'g' });
		expect(
			txContribution(
				b,
				tx({ id: 'in', amountMinor: 8_000, feeMinor: 500, occurredOn: '2026-09-02' }),
				today
			)
		).toBe(8_000);
		expect(txContribution(b, tx({ id: 'fee-only', categoryId: 'other' }), today)).toBe(0);
		expect(txContribution(b, tx({ id: 'income', type: 'income' }), today)).toBe(0);
		expect(
			txContribution(b, tx({ id: 'xfer', type: 'transfer', counterAccountId: 'q' }), today)
		).toBe(0);
		expect(txContribution(b, tx({ id: 'void', voidedAt: 'x' }), today)).toBe(0);
		expect(txContribution(b, tx({ id: 'future', occurredOn: '2026-09-10' }), today)).toBe(0);
		expect(txContribution(b, tx({ id: 'before', occurredOn: '2026-08-31' }), today)).toBe(0);
	});

	it('counts pocket-wide expenses with fees plus transfer-out', () => {
		const b = budget({ id: 'pw', appliesTo: 'pocket', categoryIds: [] });
		const rows = [
			tx({ id: 'e', amountMinor: 1_000, feeMinor: 100 }),
			tx({
				id: 'out',
				type: 'transfer',
				amountMinor: 2_000,
				feeMinor: 50,
				categoryId: null,
				counterAccountId: 'q'
			}),
			tx({ id: 'in', type: 'income', amountMinor: 9_000, categoryId: 'salary' }),
			tx({
				id: 'recv',
				type: 'transfer',
				accountId: 'q',
				counterAccountId: 'p',
				amountMinor: 3_000,
				categoryId: null
			})
		];
		expect(budgetUsedMinor(b, rows, today)).toBe(3_150);
	});

	it('monthly window drops prior-month rows', () => {
		const b = budget({ id: 'm', period: 'monthly', startOn: '2026-08-15' });
		expect(
			budgetUsedMinor(
				b,
				[
					tx({ id: 'aug', occurredOn: '2026-08-20', amountMinor: 4_000 }),
					tx({ id: 'sep', occurredOn: '2026-09-02', amountMinor: 1_500 })
				],
				today
			)
		).toBe(1_500);
	});

	it('exceeds only when projected used is strictly over the limit', () => {
		const b = budget({ id: 'x', limitMinor: 10_000 });
		const existing = [tx({ id: 'a', amountMinor: 9_000 })];
		expect(budgetWouldExceed(b, existing, tx({ id: 'new', amountMinor: 1_000 }), today)).toBe(false);
		expect(budgetWouldExceed(b, existing, tx({ id: 'new', amountMinor: 1_001 }), today)).toBe(true);
		expect(
			budgetWouldExceed(b, existing, tx({ id: 'a', amountMinor: 10_000 }), today, 'a')
		).toBe(false);
		expect(exceededBudgets([b], existing, tx({ id: 'new', amountMinor: 2_000 }), today)).toEqual([b]);
	});

	it('mirrors goal bar color and leaves percent unclamped', () => {
		expect(budgetProgressPercent(10_000, 11_000)).toBe(110);
		expect(budgetBarWidthPercent(110)).toBe(100);
		expect(budgetBarFillCss(0)).toBe(goalBarFillCss(100));
		expect(budgetBarFillCss(30)).toBe(goalBarFillCss(70));
		expect(budgetBarFillCss(100)).toBe(goalBarFillCss(0));
		expect(budgetBarFillCss(110)).toBe(goalBarFillCss(0));
	});

	it('collapses full groups in the title and uses the pocket name when pocket-wide', () => {
		const groups = [
			{ id: 'food', name: 'Food', kind: 'expense' as const },
			{ id: 'fun', name: 'Fun', kind: 'expense' as const }
		];
		const cats = [
			{ id: 'g1', name: 'Groceries', groupId: 'food' },
			{ id: 'g2', name: 'Coffee', groupId: 'food' },
			{ id: 'f1', name: 'Movies', groupId: 'fun' },
			{ id: 'f2', name: 'Games', groupId: 'fun' }
		];
		expect(
			formatBudgetAppliesTitle(
				budget({ id: 'pw', appliesTo: 'pocket', categoryIds: [] }),
				'Vacation',
				cats,
				groups
			)
		).toBe('Vacation');
		expect(
			formatBudgetAppliesTitle(
				budget({ id: 'food', categoryIds: ['g1', 'g2'] }),
				'Vacation',
				cats,
				groups
			)
		).toBe('Food');
		expect(
			formatBudgetAppliesTitle(
				budget({ id: 'mix', categoryIds: ['g1', 'f1'] }),
				'Vacation',
				cats,
				groups
			)
		).toBe('Groceries, Movies');
	});

	it('toggles groups and promotes Select all to pocket-wide', () => {
		const all = ['a', 'b', 'c'];
		expect(groupSelectionState(['a', 'b'], new Set(['a']))).toBe('some');
		expect(groupSelectionState(['a', 'b'], new Set(['a', 'b']))).toBe('all');
		expect(withGroupToggled(['a', 'b'], new Set(['c']), true).sort()).toEqual(['a', 'b', 'c']);
		expect(isAllSelectable(new Set(all), all)).toBe(true);
		expect(resolveAppliesTo(['a', 'b', 'c'], all)).toEqual({
			appliesTo: 'pocket',
			groupIds: [],
			categoryIds: []
		});
		expect(resolveAppliesTo(['a', 'b'], all)).toEqual({
			appliesTo: 'categories',
			groupIds: [],
			categoryIds: ['a', 'b']
		});
	});

	it('stores a full group as sticky and expands used from the live catalog', () => {
		const catalog = {
			groups: [{ id: 'home', name: 'Home', kind: 'expense' as const }],
			categories: [
				{ id: 'rent', name: 'Rent', groupId: 'home' },
				{ id: 'hoa', name: 'HOA', groupId: 'home' }
			]
		};
		expect(resolveAppliesTo(['rent', 'hoa'], ['rent', 'hoa', 'groc'], catalog)).toEqual({
			appliesTo: 'categories',
			groupIds: ['home'],
			categoryIds: []
		});
		expect(resolveAppliesTo(['rent'], ['rent', 'hoa', 'groc'], catalog)).toEqual({
			appliesTo: 'categories',
			groupIds: [],
			categoryIds: ['rent']
		});

		const sticky = budget({ id: 'home', groupIds: ['home'], categoryIds: [] });
		const live = [
			...catalog.categories,
			{ id: 'gnome', name: 'Garden gnome', groupId: 'home' }
		];
		expect(txContribution(sticky, tx({ id: 'new', categoryId: 'gnome' }), today, live)).toBe(1_000);
		expect(
			txContribution(
				sticky,
				tx({ id: 'fee', categoryId: 'rent', amountMinor: 500, feeMinor: 50 }),
				today,
				live
			)
		).toBe(500);

		const snapshot = budget({ id: 'old', categoryIds: ['rent', 'hoa'] });
		const hydrated = hydrateBudgetScope(snapshot, catalog);
		expect(hydrated.groupIds).toEqual(['home']);
		expect(hydrated.categoryIds).toEqual([]);
		expect(txContribution(hydrated, tx({ id: 'new', categoryId: 'gnome' }), today, live)).toBe(1_000);

		const demoted = budget({ id: 'part', categoryIds: ['rent'] });
		expect(
			budgetUsedMinor(demoted, [tx({ id: 'new', categoryId: 'gnome' })], today, null, live)
		).toBe(0);
		expect(formatBudgetAppliesTitle(sticky, 'Daily', live, catalog.groups)).toBe('Home');
	});

	it('keys unique Applies to per pocket', () => {
		expect(budgetScopeKey(budget({ id: 'pw', appliesTo: 'pocket', categoryIds: [] }))).toBe('pocket');
		expect(budgetScopeKey(budget({ id: 'g', categoryIds: ['groceries'] }))).toBe(
			'g:|c:groceries'
		);
		expect(budgetScopeKey(budget({ id: 'h', groupIds: ['home'], categoryIds: [] }))).toBe(
			'g:home|c:'
		);
		expect(
			budgetScopeKey(budget({ id: 'mix', groupIds: ['home'], categoryIds: ['groceries'] }))
		).toBe('g:home|c:groceries');
		const catalog = {
			groups: [{ id: 'home', name: 'Home', kind: 'expense' as const }],
			categories: [
				{ id: 'rent', name: 'Rent', groupId: 'home' },
				{ id: 'hoa', name: 'HOA', groupId: 'home' }
			]
		};
		const first = budget({ id: 'a', appliesTo: 'pocket', categoryIds: [] });
		expect(
			findDuplicateActiveScope(
				[first],
				'p',
				{ appliesTo: 'pocket', groupIds: [], categoryIds: [] },
				null,
				catalog
			)?.id
		).toBe('a');
		expect(
			findDuplicateActiveScope(
				[first],
				'p',
				{ appliesTo: 'pocket', groupIds: [], categoryIds: [] },
				'a',
				catalog
			)
		).toBeNull();
	});

	it('sorts pocket-wide first even when a category row is hotter', () => {
		const rows = [
			budget({
				id: 'groc',
				appliesTo: 'categories',
				limitMinor: 100,
				createdAt: '2026-01-01T00:00:00.000Z'
			}),
			budget({
				id: 'all',
				appliesTo: 'pocket',
				categoryIds: [],
				limitMinor: 10_000,
				createdAt: '2026-02-01T00:00:00.000Z'
			}),
			budget({
				id: 'dropped',
				cancelledAt: 'x',
				deletedAt: 'x',
				limitMinor: 100
			})
		];
		expect(isActiveBudget(rows[2]!)).toBe(false);
		expect(sortActiveBudgets(rows, { groc: 150, all: 0, dropped: 100 }, today).map((b) => b.id)).toEqual([
			'all',
			'groc'
		]);
	});

	it('sorts by unclamped percent, then larger limit, then older effectiveStartOn', () => {
		expect(
			sortActiveBudgets(
				[
					budget({ id: 'cool', limitMinor: 100 }),
					budget({ id: 'hot', limitMinor: 100 })
				],
				{ cool: 50, hot: 150 },
				today
			).map((b) => b.id)
		).toEqual(['hot', 'cool']);

		expect(
			sortActiveBudgets(
				[
					budget({ id: 'small', limitMinor: 100 }),
					budget({ id: 'big', limitMinor: 200 })
				],
				{ small: 50, big: 100 },
				today
			).map((b) => b.id)
		).toEqual(['big', 'small']);

		expect(
			sortActiveBudgets(
				[
					budget({ id: 'late', period: 'monthly', startOn: '2026-09-05', limitMinor: 100 }),
					budget({ id: 'early', period: 'monthly', startOn: '2026-08-01', limitMinor: 100 })
				],
				{ late: 0, early: 0 },
				today
			).map((b) => b.id)
		).toEqual(['early', 'late']);
	});

	it('sorts monthly before ongoing, hard before soft, then createdAt and id', () => {
		expect(
			sortActiveBudgets(
				[
					budget({ id: 'ongoing', period: 'ongoing', limitMinor: 100 }),
					budget({ id: 'monthly', period: 'monthly', limitMinor: 100 })
				],
				{ ongoing: 0, monthly: 0 },
				today
			).map((b) => b.id)
		).toEqual(['monthly', 'ongoing']);

		expect(
			sortActiveBudgets(
				[
					budget({ id: 'soft', hardLimit: false, limitMinor: 100 }),
					budget({ id: 'hard', hardLimit: true, limitMinor: 100 })
				],
				{ soft: 0, hard: 0 },
				today
			).map((b) => b.id)
		).toEqual(['hard', 'soft']);

		expect(
			sortActiveBudgets(
				[
					budget({ id: 'new', createdAt: '2026-02-01T00:00:00.000Z', limitMinor: 100 }),
					budget({ id: 'old', createdAt: '2026-01-01T00:00:00.000Z', limitMinor: 100 })
				],
				{ new: 0, old: 0 },
				today
			).map((b) => b.id)
		).toEqual(['old', 'new']);

		expect(
			sortActiveBudgets(
				[
					budget({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z', limitMinor: 100 }),
					budget({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z', limitMinor: 100 })
				],
				{ a: 0, b: 0 },
				today
			).map((b) => b.id)
		).toEqual(['a', 'b']);
	});
});
