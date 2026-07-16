import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { createCategory } from '$lib/application/categories';
import { createRecurringRule, materializeDueRecurring } from './recurring';

describe('recurring application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('materializes a due monthly expense and advances next date', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await createRecurringRule({
			accountId: account.id,
			type: 'expense',
			amountMinor: 50_000,
			categoryId: food.id,
			frequency: 'monthly',
			nextOccurredOn: '2026-07-01',
			note: 'rent'
		});

		const created = await materializeDueRecurring('2026-07-14');
		expect(created).toBe(1);
		expect(await db.transactions.count()).toBe(1);
		const rule = (await db.recurringRules.toArray())[0]!;
		expect(rule.nextOccurredOn).toBe('2026-08-01');
	});
});
