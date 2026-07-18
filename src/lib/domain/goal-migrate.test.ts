import { describe, expect, it } from 'vitest';
import { pickNearestGoalForMigration } from './goal-migrate';

describe('pickNearestGoalForMigration', () => {
	it('picks nearest deadline', () => {
		const pick = pickNearestGoalForMigration([
			{ id: 'b', targetOn: '2026-08-01', targetMinor: 200 },
			{ id: 'a', targetOn: '2026-07-20', targetMinor: 100 }
		]);
		expect(pick?.id).toBe('a');
	});

	it('returns null when empty', () => {
		expect(pickNearestGoalForMigration([])).toBeNull();
	});
});
