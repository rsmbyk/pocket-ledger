import { db } from '$lib/data/db';
import type { PocketBudget } from '$lib/domain/budgets';

export async function listBudgets(): Promise<PocketBudget[]> {
	return db.budgets.toArray();
}

export async function listBudgetsForAccount(accountId: string): Promise<PocketBudget[]> {
	return db.budgets.where('accountId').equals(accountId).toArray();
}

export async function putBudget(budget: PocketBudget): Promise<void> {
	await db.budgets.put(budget);
}
