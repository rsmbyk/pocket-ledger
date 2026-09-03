import { db } from '$lib/data/db';
import type { PocketGoal } from '$lib/domain/goals';

export async function listGoals(): Promise<PocketGoal[]> {
	return db.goals.toArray();
}

export async function listGoalsForAccount(accountId: string): Promise<PocketGoal[]> {
	return db.goals.where('accountId').equals(accountId).toArray();
}

export async function putGoal(goal: PocketGoal): Promise<void> {
	await db.goals.put(goal);
}

export async function putGoals(goals: PocketGoal[]): Promise<void> {
	if (goals.length === 0) return;
	await db.goals.bulkPut(goals);
}
