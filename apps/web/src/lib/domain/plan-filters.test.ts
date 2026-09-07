import { describe, expect, it } from 'vitest';
import type { LedgerPlan } from './plan';
import {
	filterPlans,
	planListSections,
	sortPlansForList,
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
		const typeOnly: PlanFilterCriteria = { search: '', types: ['income'], pocketIds: [] };
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
