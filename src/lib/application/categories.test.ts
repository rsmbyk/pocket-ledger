import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { addTransaction, getCategoriesForType } from '$lib/application/transactions';
import { createRecurringRule } from '$lib/application/recurring';
import {
	createCategory,
	isCategoryInUse,
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

	it('reports in-use when a transaction or recurring rule references the category', async () => {
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

		const viaRule = await createCategory('Rent', 'expense');
		expect(await isCategoryInUse(viaRule.id)).toBe(false);
		await createRecurringRule({
			accountId: account.id,
			type: 'expense',
			amountMinor: 100_000,
			categoryId: viaRule.id,
			note: '',
			frequency: 'monthly',
			nextOccurredOn: '2026-08-01'
		});
		expect(await isCategoryInUse(viaRule.id)).toBe(true);
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
