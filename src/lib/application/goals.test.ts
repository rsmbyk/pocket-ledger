import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { createGoal, listGoals, updateGoalSaved } from './goals';

describe('goals application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates a goal and updates saved progress including zero', async () => {
		const goal = await createGoal('Emergency', '1000000');
		expect(goal.savedMinor).toBe(0);
		expect(await listGoals()).toHaveLength(1);

		const progressed = await updateGoalSaved(goal.id, '250000');
		expect(progressed.savedMinor).toBe(250_000);

		const reset = await updateGoalSaved(goal.id, '0');
		expect(reset.savedMinor).toBe(0);
	});
});
