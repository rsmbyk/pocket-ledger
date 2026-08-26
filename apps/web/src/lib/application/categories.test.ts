import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import {
	addTransaction,
	getCategoriesForType,
	voidTransaction
} from '$lib/application/transactions';
import {
	createCategory,
	isCategoryInUse,
	listAllCategories,
	listCategories,
	removeCategory,
	renameCategory,
	reorderCategory,
	reorderCategories
} from './categories';

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

	it('reports in-use when an active transaction references the category', async () => {
		const account = await ensureDefaultAccount();
		const viaTx = await createCategory('Coffee', 'expense');
		expect(await isCategoryInUse(viaTx.id)).toBe(false);
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: viaTx.id
		});
		expect(await isCategoryInUse(viaTx.id)).toBe(true);
	});

	it('blocks delete when an active transaction uses the category', async () => {
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

	it('soft-deletes when only voided transactions reference the category', async () => {
		const account = await ensureDefaultAccount();
		const created = await createCategory('Coffee', 'expense');
		const tx = await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: created.id
		});
		await voidTransaction(tx.id);
		expect(await isCategoryInUse(created.id)).toBe(false);

		await removeCategory(created.id);

		expect(await listCategories()).not.toEqual(
			expect.arrayContaining([expect.objectContaining({ id: created.id })])
		);
		expect(await getCategoriesForType('expense')).not.toEqual(
			expect.arrayContaining([expect.objectContaining({ id: created.id })])
		);

		const stored = await db.categories.get(created.id);
		expect(stored?.deletedAt).toBeTruthy();
		expect((await listAllCategories()).find((c) => c.id === created.id)?.name).toBe('Coffee');
	});

	it('hard-deletes unused categories', async () => {
		const created = await createCategory('Unused', 'expense');
		await removeCategory(created.id);
		expect(await db.categories.get(created.id)).toBeUndefined();
	});

	it('allows recreating a soft-deleted category name', async () => {
		const account = await ensureDefaultAccount();
		const created = await createCategory('Coffee', 'expense');
		const tx = await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			categoryId: created.id
		});
		await voidTransaction(tx.id);
		await removeCategory(created.id);

		const again = await createCategory('Coffee', 'expense');
		expect(again.id).not.toBe(created.id);
		expect((await listCategories()).some((c) => c.id === again.id && c.name === 'Coffee')).toBe(
			true
		);
	});

	it('reorders categories within a kind and persists sortOrder', async () => {
		const a = await createCategory('Alpha', 'expense');
		const b = await createCategory('Beta', 'expense');
		expect((await listCategories()).filter((c) => c.kind === 'expense').map((c) => c.name)).toEqual([
			'Alpha',
			'Beta'
		]);

		await reorderCategory(b.id, 'up');
		const after = await listCategories();
		expect(after.filter((c) => c.kind === 'expense').map((c) => c.name)).toEqual(['Beta', 'Alpha']);
		expect(after.find((c) => c.id === b.id)!.sortOrder).toBeLessThan(
			after.find((c) => c.id === a.id)!.sortOrder
		);
	});

	it('reorders categories by ordered ids', async () => {
		const a = await createCategory('Alpha', 'expense');
		const b = await createCategory('Beta', 'expense');
		const c = await createCategory('Gamma', 'expense');
		await reorderCategories('expense', [c.id, a.id, b.id]);
		expect(
			(await listCategories()).filter((row) => row.kind === 'expense').map((row) => row.name)
		).toEqual(['Gamma', 'Alpha', 'Beta']);
	});
});
