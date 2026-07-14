import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { addTransaction, getCategoriesForType } from '$lib/application/transactions';
import { createCategory, listCategories, removeCategory, renameCategory } from './categories';

describe('categories application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates and renames a custom category', async () => {
		await createCategory('Coffee', 'expense');
		const rows = await listCategories();
		expect(rows.some((c) => c.name === 'Coffee' && c.kind === 'expense')).toBe(true);

		const coffee = rows.find((c) => c.name === 'Coffee')!;
		await renameCategory(coffee.id, 'Cafe');
		expect((await listCategories()).some((c) => c.name === 'Cafe')).toBe(true);
	});

	it('blocks delete when a transaction uses the category', async () => {
		const account = await ensureDefaultAccount();
		const created = await createCategory('Coffee', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: created.id
		});
		await expect(removeCategory(created.id)).rejects.toThrow(/still used/i);
		expect(await getCategoriesForType('expense')).toEqual(
			expect.arrayContaining([expect.objectContaining({ id: created.id })])
		);
	});
});
