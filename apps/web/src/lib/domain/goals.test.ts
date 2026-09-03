import { describe, expect, it } from 'vitest';
import {
	assertGoalDateNotPast,
	assertGoalDeadline,
	assertGoalTarget,
	goalProgressPercent,
	goalProgressRatio,
	isActive,
	isHidden,
	isPast,
	migrateAccountGoalsToRows,
	pastGoalBadge,
	previewGoal,
	sortActiveGoals,
	sortPastGoals,
	type PocketGoal
} from './goals';

function goal(partial: Partial<PocketGoal> & Pick<PocketGoal, 'id'>): PocketGoal {
	return {
		accountId: 'p',
		description: '',
		targetMinor: 100_000,
		targetOn: null,
		createdAt: '2026-01-01T00:00:00.000Z',
		cancelledAt: null,
		deletedAt: null,
		...partial
	};
}

describe('goals domain', () => {
	const today = '2026-09-03';

	it('computes progress from balance', () => {
		expect(goalProgressRatio(1_000_000, 250_000)).toBe(0.25);
		expect(goalProgressPercent(1_000_000, 250_000)).toBe(25);
		expect(goalProgressPercent(100, 150)).toBe(100);
	});

	it('classifies active, past, and hidden', () => {
		expect(isActive(goal({ id: 'a', targetOn: null }), today)).toBe(true);
		expect(isActive(goal({ id: 'a', targetOn: today }), today)).toBe(true);
		expect(isActive(goal({ id: 'a', targetOn: '2026-09-02' }), today)).toBe(false);
		expect(isPast(goal({ id: 'a', targetOn: '2026-09-02' }), today)).toBe(true);
		expect(
			isHidden(goal({ id: 'a', cancelledAt: 'x', deletedAt: 'x', targetOn: null }))
		).toBe(true);
		expect(
			isPast(goal({ id: 'a', targetOn: '2026-12-01', cancelledAt: 'x' }), today)
		).toBe(true);
	});

	it('sorts active dated closest-first then no-date oldest first', () => {
		const oct = goal({
			id: 'oct',
			targetOn: '2026-10-01',
			createdAt: '2026-02-01T00:00:00.000Z'
		});
		const dec = goal({
			id: 'dec',
			targetOn: '2026-12-01',
			createdAt: '2026-01-01T00:00:00.000Z'
		});
		const oldOpen = goal({
			id: 'old',
			targetOn: null,
			createdAt: '2026-01-01T00:00:00.000Z'
		});
		const newOpen = goal({
			id: 'new',
			targetOn: null,
			createdAt: '2026-03-01T00:00:00.000Z'
		});
		expect(sortActiveGoals([newOpen, dec, oldOpen, oct], today).map((g) => g.id)).toEqual([
			'oct',
			'dec',
			'old',
			'new'
		]);
		expect(previewGoal([newOpen, dec, oldOpen, oct], today)?.id).toBe('oct');
		expect(previewGoal([newOpen, oldOpen], today)?.id).toBe('old');
	});

	it('sorts past by date latest first then createdAt desc', () => {
		const a = goal({
			id: 'a',
			targetOn: '2026-08-01',
			createdAt: '2026-01-02T00:00:00.000Z'
		});
		const b = goal({
			id: 'b',
			targetOn: '2026-08-01',
			createdAt: '2026-01-01T00:00:00.000Z'
		});
		const c = goal({
			id: 'c',
			targetOn: '2026-09-01',
			createdAt: '2026-01-01T00:00:00.000Z'
		});
		expect(sortPastGoals([a, b, c], today).map((g) => g.id)).toEqual(['c', 'a', 'b']);
	});

	it('badges Dropped, Achieved, Missed', () => {
		expect(
			pastGoalBadge(goal({ id: 'd', targetOn: '2026-01-01', cancelledAt: 'x' }), 0)
		).toBe('Dropped');
		expect(pastGoalBadge(goal({ id: 'a', targetOn: '2026-01-01' }), 100_000)).toBe('Achieved');
		expect(pastGoalBadge(goal({ id: 'm', targetOn: '2026-01-01' }), 99_999)).toBe('Missed');
	});

	it('validates target and date min', () => {
		expect(() => assertGoalTarget(0)).toThrow(/target/i);
		expect(() => assertGoalDeadline('not-a-date')).toThrow(/deadline/i);
		expect(() => assertGoalDateNotPast('2026-09-02', today)).toThrow(/today/i);
		expect(() => assertGoalDateNotPast(today, today)).not.toThrow();
	});

	it('migrates pocket fields once', () => {
		const rows = migrateAccountGoalsToRows(
			[
				{ id: 'vac', goalEnabled: true, goalTargetMinor: 100_000, goalTargetOn: '2099-01-01' },
				{ id: 'main', goalEnabled: false, goalTargetMinor: null, goalTargetOn: null }
			],
			[],
			'2026-09-03T00:00:00.000Z'
		);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			accountId: 'vac',
			description: '',
			targetMinor: 100_000,
			targetOn: '2099-01-01',
			cancelledAt: null,
			deletedAt: null
		});
		const again = migrateAccountGoalsToRows(
			[{ id: 'vac', goalEnabled: true, goalTargetMinor: 100_000, goalTargetOn: '2099-01-01' }],
			rows,
			'2026-09-04T00:00:00.000Z'
		);
		expect(again).toHaveLength(1);
	});
});
