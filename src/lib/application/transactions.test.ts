import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import {
	addTransaction,
	ensureSeedCategories,
	getAccountBalance,
	getCategoriesForType,
	listRecentTransactions
} from './transactions';
import { ensureDefaultAccount } from './accounts';

describe('transactions application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('seeds default categories once', async () => {
		const first = await ensureSeedCategories();
		const second = await ensureSeedCategories();
		expect(first.length).toBeGreaterThan(0);
		expect(second).toHaveLength(first.length);
		expect(first.some((c) => c.kind === 'expense' && c.name === 'Food')).toBe(true);
		expect(first.some((c) => c.kind === 'income' && c.name === 'Salary')).toBe(true);
	});

	it('adds expense and income and computes balance', async () => {
		const account = await ensureDefaultAccount();
		const expenseCats = await getCategoriesForType('expense');
		const incomeCats = await getCategoriesForType('income');

		await addTransaction({
			accountId: account.id,
			type: 'income',
			amountRaw: '100000',
			categoryId: incomeCats[0]!.id
		});
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: expenseCats[0]!.id,
			note: 'lunch'
		});

		expect(await getAccountBalance(account.id)).toBe(85_000);
		const recent = await listRecentTransactions(account.id);
		expect(recent).toHaveLength(2);
		expect(recent[0]?.note === 'lunch' || recent[1]?.note === 'lunch').toBe(true);
	});

	it('rejects mismatched category kind', async () => {
		const account = await ensureDefaultAccount();
		const incomeCats = await getCategoriesForType('income');
		await expect(
			addTransaction({
				accountId: account.id,
				type: 'expense',
				amountRaw: '1000',
				categoryId: incomeCats[0]!.id
			})
		).rejects.toThrow(/category/i);
	});
});
