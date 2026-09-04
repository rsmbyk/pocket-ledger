import { describe, expect, it } from 'vitest';
import {
	GOAL_CREATE_BASELINE,
	isGoalFormDirty,
	type GoalFormBaseline
} from './goal-form-dirty';

const emptyLive = {
	description: '',
	targetRaw: '',
	dateEnabled: false,
	targetOn: ''
};

describe('isGoalFormDirty', () => {
	it('treats empty create as clean', () => {
		expect(isGoalFormDirty(emptyLive, GOAL_CREATE_BASELINE)).toBe(false);
		expect(isGoalFormDirty({ ...emptyLive, description: '   ' }, GOAL_CREATE_BASELINE)).toBe(false);
	});

	it('treats description-only create as dirty', () => {
		expect(isGoalFormDirty({ ...emptyLive, description: '5454545' }, GOAL_CREATE_BASELINE)).toBe(
			true
		);
	});

	it('treats target digits or a date as dirty on create', () => {
		expect(isGoalFormDirty({ ...emptyLive, targetRaw: '15000' }, GOAL_CREATE_BASELINE)).toBe(true);
		expect(
			isGoalFormDirty(
				{ ...emptyLive, dateEnabled: true, targetOn: '2026-09-05' },
				GOAL_CREATE_BASELINE
			)
		).toBe(true);
	});

	it('compares edit fields to the baseline', () => {
		const baseline: GoalFormBaseline = {
			description: 'Rent',
			targetRaw: '15000',
			targetOn: '2026-12-01'
		};
		expect(
			isGoalFormDirty(
				{ description: 'Rent', targetRaw: '15000', dateEnabled: true, targetOn: '2026-12-01' },
				baseline
			)
		).toBe(false);
		expect(
			isGoalFormDirty(
				{ description: 'Rent!', targetRaw: '15000', dateEnabled: true, targetOn: '2026-12-01' },
				baseline
			)
		).toBe(true);
		expect(
			isGoalFormDirty(
				{ description: 'Rent', targetRaw: '15000', dateEnabled: false, targetOn: '' },
				baseline
			)
		).toBe(true);
	});
});
