import { describe, expect, it } from 'vitest';
import { BUDGET_CREATE_BASELINE, isBudgetFormDirty } from './budget-form-dirty';

describe('budget-form-dirty', () => {
	const all = ['a', 'b', 'c'];
	const today = '2026-09-09';

	it('create is dirty once a category and amount are set', () => {
		const baseline = BUDGET_CREATE_BASELINE(today);
		expect(
			isBudgetFormDirty(
				{
					selectedIds: [],
					limitRaw: '',
					startOn: today,
					period: 'ongoing',
					hardLimit: false
				},
				baseline,
				all
			)
		).toBe(false);
		expect(
			isBudgetFormDirty(
				{
					selectedIds: ['a'],
					limitRaw: '10000',
					startOn: today,
					period: 'ongoing',
					hardLimit: false
				},
				baseline,
				all
			)
		).toBe(true);
	});

	it('treats selecting every category as pocket-wide, not a category list change', () => {
		const baseline = {
			appliesTo: 'pocket' as const,
			categoryIds: [] as string[],
			limitRaw: '10000',
			startOn: today,
			period: 'ongoing' as const,
			hardLimit: false
		};
		expect(
			isBudgetFormDirty(
				{
					selectedIds: [...all],
					limitRaw: '10000',
					startOn: today,
					period: 'ongoing',
					hardLimit: false
				},
				baseline,
				all
			)
		).toBe(false);
	});
});
