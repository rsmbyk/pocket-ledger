import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import {
	addTransaction,
	ensureSeedCategories,
	getAccountBalance,
	getCategoriesForType,
	listRecentTransactions,
	updateTransaction,
	voidTransaction
} from './transactions';
import { ensureDefaultAccount } from './accounts';
import { createCategory } from './categories';

describe('transactions application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('does not seed categories when empty', async () => {
		expect(await ensureSeedCategories()).toEqual([]);
		expect(await ensureSeedCategories()).toEqual([]);
	});

	it('adds expense and income and computes balance', async () => {
		const account = await ensureDefaultAccount();
		const expense = await createCategory('Food', 'expense');
		const income = await createCategory('Salary', 'income');

		await addTransaction({
			accountId: account.id,
			type: 'income',
			amountRaw: '100000',
			categoryId: income.id
		});
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: expense.id,
			note: 'lunch'
		});

		expect(await getAccountBalance(account.id)).toBe(85_000);
		const recent = await listRecentTransactions(account.id);
		expect(recent).toHaveLength(2);
		expect(recent[0]?.note === 'lunch' || recent[1]?.note === 'lunch').toBe(true);
	});

	it('allows uncategorized transactions', async () => {
		const account = await ensureDefaultAccount();
		const tx = await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '2500',
			categoryId: '',
			note: 'misc'
		});
		expect(tx.categoryId).toBeNull();
		expect(await getAccountBalance(account.id)).toBe(-2500);
	});

	it('rejects mismatched category kind', async () => {
		const account = await ensureDefaultAccount();
		const income = await createCategory('Salary', 'income');
		await expect(
			addTransaction({
				accountId: account.id,
				type: 'expense',
				amountRaw: '1000',
				categoryId: income.id
			})
		).rejects.toThrow(/category/i);
	});

	it('updates and voids a transaction', async () => {
		const account = await ensureDefaultAccount();
		const expense = await createCategory('Food', 'expense');
		const created = await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: expense.id,
			note: 'lunch'
		});

		await updateTransaction({
			id: created.id,
			accountId: account.id,
			type: 'expense',
			amountRaw: '10000',
			categoryId: expense.id,
			note: 'coffee'
		});
		expect(await getAccountBalance(account.id)).toBe(-10_000);
		const listed = await listRecentTransactions(account.id);
		expect(listed[0]?.note).toBe('coffee');
		expect(listed[0]?.amountMinor).toBe(10_000);

		await voidTransaction(created.id);
		expect(await getAccountBalance(account.id)).toBe(0);
		const afterVoid = await listRecentTransactions(account.id);
		expect(afterVoid).toHaveLength(1);
		expect(afterVoid[0]?.voidedAt).toBeTruthy();
		await expect(voidTransaction(created.id)).rejects.toThrow(/already voided/i);
		await expect(
			updateTransaction({
				id: created.id,
				accountId: account.id,
				type: 'expense',
				amountRaw: '1000',
				categoryId: expense.id
			})
		).rejects.toThrow(/cannot be edited/i);
	});
});
