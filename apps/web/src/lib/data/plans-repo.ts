import { db } from '$lib/data/db';
import type { LedgerPlan } from '$lib/domain/plan';

export async function listPlansRaw(): Promise<LedgerPlan[]> {
	return db.plans.toArray();
}

export async function listPlansForAccount(accountId: string): Promise<LedgerPlan[]> {
	const rows = await db.plans.toArray();
	return rows.filter((p) => p.accountId === accountId || p.counterAccountId === accountId);
}

export async function getPlan(id: string): Promise<LedgerPlan | undefined> {
	return db.plans.get(id);
}

export async function putPlan(plan: LedgerPlan): Promise<void> {
	await db.plans.put(plan);
}

export async function deletePlanRow(id: string): Promise<void> {
	await db.plans.delete(id);
}
