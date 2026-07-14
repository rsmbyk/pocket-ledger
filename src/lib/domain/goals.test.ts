import { describe, expect, it } from 'vitest';
import { assertGoalAmounts, goalProgressPercent, goalProgressRatio } from './goals';

describe('goals', () => {
	it('computes progress', () => {
		expect(goalProgressRatio({ targetMinor: 1_000_000, savedMinor: 250_000 })).toBe(0.25);
		expect(goalProgressPercent({ targetMinor: 1_000_000, savedMinor: 250_000 })).toBe(25);
		expect(goalProgressPercent({ targetMinor: 100, savedMinor: 150 })).toBe(100);
	});

	it('validates amounts', () => {
		expect(() => assertGoalAmounts(0, 0)).toThrow(/target/i);
		expect(() => assertGoalAmounts(100, -1)).toThrow(/saved/i);
	});
});
