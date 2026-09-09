import { describe, expect, it } from 'vitest';
import type { LedgerPlan } from './plan';
import { ADMIN_FEE_CATEGORY_ID, UNCATEGORIZED_FILTER } from './activity-filters';
import {
	countPlanAdvancedFilters,
	filterPlans,
	hasAdminFeePlanRow,
	hasUncategorizedPlanRow,
	isDefaultPlanFilters,
	planListSections,
	shouldShowPlanCategoryFilter,
	sortPlansForList,
	usedPlanCategoryIds,
	type PlanFilterCriteria
} from './plan-filters';

function plan(partial: Partial<LedgerPlan> & Pick<LedgerPlan, 'id'>): LedgerPlan {
	return {
		description: '',
		type: 'expense',
		amountMinor: 1_000,
		feeMinor: 0,
		categoryId: null,
		accountId: 'main',
		counterAccountId: null,
		note: '',
		dueOn: '2026-09-10',
		createdAt: '2026-01-01T00:00:00.000Z',
		frequency: 'once',
		monthDay: null,
		...partial
	};
}

const pockets = [
	{ id: 'main', isMain: true, sortOrder: 0 },
	{ id: 'alpha', isMain: false, sortOrder: 0 },
	{ id: 'beta', isMain: false, sortOrder: 1 }
];

describe('plan filters', () => {
	it('searches description, note, and amount digits', () => {
		const rows = [
			plan({ id: '1', description: 'Rent', note: 'landlord', amountMinor: 1_500_000 }),
			plan({ id: '2', description: 'Coffee', note: 'shop', amountMinor: 25_000 })
		];
		expect(filterPlans(rows, { search: 'Rent' }).map((p) => p.id)).toEqual(['1']);
		expect(filterPlans(rows, { search: 'landlord' }).map((p) => p.id)).toEqual(['1']);
		expect(filterPlans(rows, { search: '1500000' }).map((p) => p.id)).toEqual(['1']);
		expect(filterPlans(rows, { search: '25,000' }).map((p) => p.id)).toEqual(['2']);
	});

	it('filters by type and pocket including transfer dest', () => {
		const rows = [
			plan({ id: 'inc', type: 'income', accountId: 'main' }),
			plan({ id: 'exp', type: 'expense', accountId: 'alpha' }),
			plan({
				id: 'xfer',
				type: 'transfer',
				accountId: 'main',
				counterAccountId: 'beta'
			})
		];
		const typeOnly: PlanFilterCriteria = {
			search: '',
			types: ['income'],
			categoryIds: [],
			pocketIds: []
		};
		expect(filterPlans(rows, typeOnly).map((p) => p.id)).toEqual(['inc']);
		expect(filterPlans(rows, { pocketIds: ['beta'] }).map((p) => p.id)).toEqual(['xfer']);
		expect(filterPlans(rows, { pocketIds: ['alpha'] }).map((p) => p.id)).toEqual(['exp']);
	});

	it('sorts soonest due first, then Main, then sortOrder, then createdAt desc', () => {
		const rows = [
			plan({
				id: 'later',
				dueOn: '2026-09-20',
				accountId: 'main',
				createdAt: '2026-01-03T00:00:00.000Z'
			}),
			plan({
				id: 'beta-old',
				dueOn: '2026-09-10',
				accountId: 'beta',
				createdAt: '2026-01-01T00:00:00.000Z'
			}),
			plan({
				id: 'beta-new',
				dueOn: '2026-09-10',
				accountId: 'beta',
				createdAt: '2026-01-02T00:00:00.000Z'
			}),
			plan({
				id: 'alpha',
				dueOn: '2026-09-10',
				accountId: 'alpha',
				createdAt: '2026-01-01T00:00:00.000Z'
			}),
			plan({
				id: 'main',
				dueOn: '2026-09-10',
				accountId: 'main',
				createdAt: '2026-01-01T00:00:00.000Z'
			})
		];
		expect(sortPlansForList(rows, pockets).map((p) => p.id)).toEqual([
			'main',
			'alpha',
			'beta-new',
			'beta-old',
			'later'
		]);
	});

	it('groups sorted plans by dueOn with headers', () => {
		const sorted = sortPlansForList(
			[
				plan({ id: 'a', dueOn: '2026-09-11', accountId: 'main' }),
				plan({ id: 'b', dueOn: '2026-09-10', accountId: 'main' })
			],
			pockets
		);
		const sections = planListSections(sorted);
		expect(sections.map((s) => (s.kind === 'header' ? s.dueOn : s.plan.id))).toEqual([
			'2026-09-10',
			'b',
			'2026-09-11',
			'a'
		]);
	});
});

describe('plan category filters (Spec 244)', () => {
	it('filters by user category, Uncategorized, and Admin Fee', () => {
		const rows = [
			plan({ id: 'food', categoryId: 'food', description: 'Lunch' }),
			plan({ id: 'bare', categoryId: null, description: 'Bare' }),
			plan({ id: 'fee', type: 'expense', feeMinor: 40, description: 'Tipped' }),
			plan({
				id: 'xfer-fee',
				type: 'transfer',
				feeMinor: 25,
				counterAccountId: 'beta',
				description: 'Paid xfer'
			}),
			plan({
				id: 'xfer-free',
				type: 'transfer',
				feeMinor: 0,
				counterAccountId: 'beta',
				description: 'Free xfer'
			}),
			plan({
				id: 'sentinel',
				categoryId: ADMIN_FEE_CATEGORY_ID,
				description: 'Fee cat'
			})
		];
		expect(filterPlans(rows, { categoryIds: ['food'] }).map((p) => p.id)).toEqual(['food']);
		expect(filterPlans(rows, { categoryIds: [UNCATEGORIZED_FILTER] }).map((p) => p.id)).toEqual([
			'bare',
			'fee',
			'xfer-fee',
			'xfer-free'
		]);
		expect(filterPlans(rows, { categoryIds: [ADMIN_FEE_CATEGORY_ID] }).map((p) => p.id)).toEqual([
			'fee',
			'xfer-fee',
			'sentinel'
		]);
		expect(filterPlans(rows, { categoryIds: [] }).map((p) => p.id)).toEqual(rows.map((p) => p.id));
	});

	it('ANDs category with type', () => {
		const rows = [
			plan({ id: 'food-exp', type: 'expense', categoryId: 'food' }),
			plan({ id: 'food-inc', type: 'income', categoryId: 'food' })
		];
		expect(
			filterPlans(rows, { types: ['expense'], categoryIds: ['food'] }).map((p) => p.id)
		).toEqual(['food-exp']);
	});

	it('counts category as an advanced filter', () => {
		expect(countPlanAdvancedFilters({ categoryIds: ['food'] })).toBe(1);
		expect(isDefaultPlanFilters({ categoryIds: ['food'] })).toBe(false);
		expect(isDefaultPlanFilters({})).toBe(true);
	});

	it('used-only helpers hide when empty or uncategorized-only', () => {
		expect(usedPlanCategoryIds([]).size).toBe(0);
		expect(shouldShowPlanCategoryFilter([])).toBe(false);
		expect(hasUncategorizedPlanRow([])).toBe(false);
		expect(hasAdminFeePlanRow([])).toBe(false);

		const uncategorized = [plan({ id: 'bare', categoryId: null })];
		expect(usedPlanCategoryIds(uncategorized).size).toBe(0);
		expect(shouldShowPlanCategoryFilter(uncategorized)).toBe(false);
		expect(hasUncategorizedPlanRow(uncategorized)).toBe(true);

		const used = [
			plan({ id: 'food', categoryId: 'food' }),
			plan({ id: 'bare', categoryId: null })
		];
		expect([...usedPlanCategoryIds(used)]).toEqual(['food']);
		expect(shouldShowPlanCategoryFilter(used)).toBe(true);
		expect(hasAdminFeePlanRow([plan({ id: 'fee', feeMinor: 10 })])).toBe(true);
		expect(shouldShowPlanCategoryFilter([plan({ id: 'fee', feeMinor: 10 })])).toBe(true);
		expect(
			usedPlanCategoryIds([plan({ id: 'fee-cat', categoryId: ADMIN_FEE_CATEGORY_ID })]).size
		).toBe(0);
	});
});
