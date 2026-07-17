import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { createGoal, listGoals, listGoalsNearestFirst, removeGoal, updateGoal } from './goals';

describe('goals application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates a goal with deadline and lists it', async () => {
		const goal = await createGoal('Emergency', '1000000', '2026-12-31');
		expect(goal.targetMinor).toBe(1_000_000);
		expect(goal.targetOn).toBe('2026-12-31');
		expect(goal.savedMinor).toBe(0);
		expect(await listGoals()).toHaveLength(1);
	});

	it('updates goal fields and sorts nearest first', async () => {
		const later = await createGoal('Later', '100000', '2026-08-01');
		const sooner = await createGoal('Sooner', '200000', '2026-07-20');
		const ordered = await listGoalsNearestFirst(0);
		expect(ordered.map((g) => g.id)).toEqual([sooner.id, later.id]);

		const updated = await updateGoal(sooner.id, { name: 'Trip', targetOn: '2026-09-01' });
		expect(updated.name).toBe('Trip');
		expect(updated.targetOn).toBe('2026-09-01');
	});

	it('removes a goal', async () => {
		const goal = await createGoal('Gone', '50000', '2026-07-30');
		await removeGoal(goal.id);
		expect(await listGoals()).toHaveLength(0);
	});

	it('rejects invalid deadline', async () => {
		await expect(createGoal('Bad', '10000', 'nope')).rejects.toThrow(/deadline/i);
	});
});
