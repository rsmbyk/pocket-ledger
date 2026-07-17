import { describe, expect, it } from 'vitest';
import {
	assertGoalDeadline,
	assertGoalTarget,
	dailyPaceNeeded,
	daysRemaining,
	goalProgressPercent,
	goalProgressRatio,
	goalRemainingMinor,
	sortGoalsByNearestDeadline
} from './goals';

describe('goals domain', () => {
	it('computes progress from balance', () => {
		expect(goalProgressRatio(1_000_000, 0)).toBe(0);
		expect(goalProgressRatio(1_000_000, 250_000)).toBe(0.25);
		expect(goalProgressPercent(1_000_000, 250_000)).toBe(25);
		expect(goalProgressPercent(100, 100)).toBe(100);
		expect(goalProgressPercent(100, 150)).toBe(100);
	});

	it('computes remaining money', () => {
		expect(goalRemainingMinor(100_000, 25_000)).toBe(75_000);
		expect(goalRemainingMinor(100_000, 100_000)).toBe(0);
		expect(goalRemainingMinor(100_000, 120_000)).toBe(-20_000);
	});

	it('computes days remaining and overdue', () => {
		expect(daysRemaining('2026-07-20', '2026-07-17')).toBe(3);
		expect(daysRemaining('2026-07-17', '2026-07-17')).toBe(0);
		expect(daysRemaining('2026-07-10', '2026-07-17')).toBe(-7);
	});

	it('computes daily pace only when useful', () => {
		expect(dailyPaceNeeded(90_000, 3)).toBe(30_000);
		expect(dailyPaceNeeded(100_000, 3)).toBe(33_334);
		expect(dailyPaceNeeded(0, 3)).toBeNull();
		expect(dailyPaceNeeded(50_000, 0)).toBeNull();
		expect(dailyPaceNeeded(50_000, -2)).toBeNull();
	});

	it('sorts by nearest deadline then remaining', () => {
		const goals = [
			{ id: 'b', targetOn: '2026-08-01', targetMinor: 100_000 },
			{ id: 'a', targetOn: '2026-07-20', targetMinor: 50_000 },
			{ id: 'c', targetOn: '2026-07-20', targetMinor: 200_000 }
		];
		const sorted = sortGoalsByNearestDeadline(goals, 10_000);
		expect(sorted.map((g) => g.id)).toEqual(['c', 'a', 'b']);
	});

	it('validates target and deadline', () => {
		expect(() => assertGoalTarget(0)).toThrow(/target/i);
		expect(() => assertGoalDeadline('not-a-date')).toThrow(/deadline/i);
		expect(() => assertGoalDeadline('2026-13-40')).toThrow(/deadline/i);
		expect(() => assertGoalDeadline('2026-07-17')).not.toThrow();
	});
});
