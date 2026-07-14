import { putTransaction } from '$lib/data/transaction-repo';
import {
	deleteRecurringRule,
	listRecurringRules,
	putRecurringRule
} from '$lib/data/recurring-repo';
import type { RecurringFrequency, RecurringRule } from '$lib/domain/recurring';
import { advanceOccurredOn, isDue } from '$lib/domain/recurring';
import { assertMinorUnits } from '$lib/domain/money';
import { todayOccurredOn, type AddableTransactionType } from '$lib/domain/transaction-rules';
import { getCategoriesForType } from '$lib/application/transactions';

function createId(): string {
	return crypto.randomUUID();
}

export type CreateRecurringInput = {
	accountId: string;
	type: AddableTransactionType;
	amountMinor: number;
	categoryId: string;
	note?: string;
	frequency: RecurringFrequency;
	nextOccurredOn?: string;
};

export async function createRecurringRule(input: CreateRecurringInput): Promise<RecurringRule> {
	assertMinorUnits(input.amountMinor);
	if (input.amountMinor <= 0) throw new Error('Amount must be greater than zero');
	const categories = await getCategoriesForType(input.type);
	if (!categories.some((c) => c.id === input.categoryId)) {
		throw new Error('Choose a category for this type');
	}

	const rule: RecurringRule = {
		id: createId(),
		accountId: input.accountId,
		type: input.type,
		amountMinor: input.amountMinor,
		categoryId: input.categoryId,
		note: (input.note ?? '').trim(),
		frequency: input.frequency,
		nextOccurredOn: input.nextOccurredOn ?? todayOccurredOn(),
		active: true,
		createdAt: new Date().toISOString()
	};
	await putRecurringRule(rule);
	return rule;
}

export async function setRecurringActive(id: string, active: boolean): Promise<void> {
	const rule = (await listRecurringRules()).find((r) => r.id === id);
	if (!rule) throw new Error('Rule not found');
	await putRecurringRule({ ...rule, active });
}

export async function removeRecurringRule(id: string): Promise<void> {
	await deleteRecurringRule(id);
}

export { listRecurringRules };

/**
 * Spawn due recurring transactions up to today (inclusive).
 * @returns number of transactions created
 */
export async function materializeDueRecurring(today = todayOccurredOn()): Promise<number> {
	const rules = await listRecurringRules();
	let created = 0;

	for (const rule of rules) {
		if (!rule.active) continue;
		let next = rule.nextOccurredOn;
		let working = { ...rule };

		// Safety cap avoids infinite loops on bad data.
		for (let i = 0; i < 366 && isDue(next, today); i++) {
			await putTransaction({
				id: createId(),
				accountId: working.accountId,
				counterAccountId: null,
				type: working.type,
				amountMinor: working.amountMinor,
				categoryId: working.categoryId,
				note: working.note || `Recurring (${working.frequency})`,
				occurredOn: next,
				createdAt: new Date().toISOString()
			});
			created += 1;
			next = advanceOccurredOn(next, working.frequency);
			working = { ...working, nextOccurredOn: next };
		}

		if (working.nextOccurredOn !== rule.nextOccurredOn) {
			await putRecurringRule(working);
		}
	}

	return created;
}
