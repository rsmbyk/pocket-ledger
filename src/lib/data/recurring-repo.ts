import { db } from '$lib/data/db';
import type { RecurringRule } from '$lib/domain/recurring';

export async function listRecurringRules(): Promise<RecurringRule[]> {
	return db.recurringRules.orderBy('nextOccurredOn').toArray();
}

export async function putRecurringRule(rule: RecurringRule): Promise<void> {
	await db.recurringRules.put(rule);
}

export async function deleteRecurringRule(id: string): Promise<void> {
	await db.recurringRules.delete(id);
}

export async function getRecurringRule(id: string): Promise<RecurringRule | undefined> {
	return db.recurringRules.get(id);
}
