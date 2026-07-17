import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from './accounts';
import { createCategory } from './categories';
import { addTransaction } from './transactions';
import { getMonthSummary } from './month-summary';

describe('month-summary application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('builds a month summary for the account', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: food.id,
			occurredOn: '2026-07-15'
		});
		const summary = await getMonthSummary(account.id, '2026-07');
		expect(summary.expenseMinor).toBe(15_000);
		expect(summary.expenseByCategory.some((r) => r.label === 'Food')).toBe(true);
	});
});
