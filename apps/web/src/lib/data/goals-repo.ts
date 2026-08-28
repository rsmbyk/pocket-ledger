import { db } from '$lib/data/db';
import type { Goal } from '$lib/domain/goals';

export async function listGoals(): Promise<Goal[]> {
	return db.goals.orderBy('name').toArray();
}

export async function putGoal(goal: Goal): Promise<void> {
	await db.goals.put(goal);
}

export async function deleteGoal(id: string): Promise<void> {
	await db.goals.delete(id);
}
