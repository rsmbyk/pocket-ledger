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
	createCategoryGroup,
	hideCategory,
	listAllCategories,
	listCategories,
	listResolvedGroups,
	removeCategory,
	renameCategory,
	renameCategoryGroup,
	saveCategoryGroupOrder,
	showCategory
} from './categories';
import { putCategory } from '$lib/data/category-repo';

describe('categories application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('resolves the stock catalog without inserting Dexie rows', async () => {
		const rows = await listCategories();
		expect(rows).toHaveLength(139);
		expect(await db.categories.count()).toBe(0);
		expect(rows.some((c) => c.id === 'stock:expense:groceries')).toBe(true);
		expect(rows.find((c) => c.id === 'stock:income:salary')?.icon).toBe('briefcase');
	});

	it('creates a custom category in a group with tag icon', async () => {
		await createCategory('Warung', 'expense', 'stock-group:food-drink');
		expect(await db.categories.count()).toBe(1);
		const food = (await listCategories()).filter((c) => c.groupId === 'stock-group:food-drink');
		expect(food.at(-1)).toEqual(
			expect.objectContaining({ name: 'Warung', icon: 'tag', source: 'custom' })
		);
	});

	it('rejects custom names that collide with stock', async () => {
		await expect(createCategory('Groceries', 'expense')).rejects.toThrow(/already exists/i);
	});

	it('creates and renames a custom category', async () => {
		await createCategory('Warung', 'expense');
		const coffee = (await listCategories()).find((c) => c.name === 'Warung')!;
		await renameCategory(coffee.id, 'Cafe');
		expect((await listCategories()).some((c) => c.name === 'Cafe')).toBe(true);
		await expect(renameCategory('stock:expense:groceries', 'Food')).rejects.toThrow(/cannot be renamed/i);
	});

	it('hides stock and custom without hard-deleting custom rows', async () => {
		const created = await createCategory('Warung', 'expense');
		await hideCategory('stock:expense:groceries');
		await hideCategory(created.id);
		const picker = await listCategories();
		expect(picker.some((c) => c.id === 'stock:expense:groceries')).toBe(false);
		expect(picker.some((c) => c.id === created.id)).toBe(false);
		expect(await db.categories.get(created.id)).toBeTruthy();
		const listed = await listAllCategories();
		expect(listed.find((c) => c.id === created.id)?.hidden).toBe(true);
		await showCategory(created.id);
		await showCategory('stock:expense:groceries');
		expect((await listCategories()).some((c) => c.id === created.id)).toBe(true);
		expect((await listCategories()).some((c) => c.id === 'stock:expense:groceries')).toBe(true);
	});

	it('maps a Groceries UUID onto stock and parks Coffee as custom', async () => {
		const groceriesId = crypto.randomUUID();
		const coffeeId = crypto.randomUUID();
		await putCategory({
			id: groceriesId,
			name: 'Groceries',
			kind: 'expense',
			sortOrder: 0,
			createdAt: new Date().toISOString(),
			deletedAt: null,
			groupId: '',
			icon: 'tag',
			hidden: false
		});
		await putCategory({
			id: coffeeId,
			name: 'Warung',
			kind: 'expense',
			sortOrder: 1,
			createdAt: new Date().toISOString(),
			deletedAt: null,
			groupId: '',
			icon: 'tag',
			hidden: false
		});
		const account = await ensureDefaultAccount();
		await db.transactions.put({
			id: crypto.randomUUID(),
			accountId: account.id,
			counterAccountId: null,
			type: 'expense',
			amountMinor: 1000,
			feeMinor: 0,
			categoryId: groceriesId,
			note: '',
			occurredOn: account.openingAsOf,
			createdAt: new Date().toISOString(),
			voidedAt: null
		});

		const cats = await listCategories();
		expect(cats.some((c) => c.id === groceriesId)).toBe(false);
		expect(cats.some((c) => c.id === 'stock:expense:groceries')).toBe(true);
		expect(await db.categories.get(groceriesId)).toBeUndefined();
		expect((await db.transactions.toArray())[0]?.categoryId).toBe('stock:expense:groceries');
		const coffee = cats.find((c) => c.name === 'Warung');
		expect(coffee?.groupId).toBe('stock-group:catch-all');
		expect(coffee?.icon).toBe('tag');
	});

	it('appends a custom group last in kind', async () => {
		await createCategoryGroup('Side', 'expense');
		const groups = await listResolvedGroups();
		expect(groups.filter((g) => g.kind === 'expense').at(-1)?.name).toBe('Side');
	});

	it('renames a custom group and rejects stock or duplicate names', async () => {
		const created = await createCategoryGroup('Side hustle', 'expense');
		await createCategoryGroup('Gig work', 'expense');
		const renamed = await renameCategoryGroup(created.id, 'Freelance');
		expect(renamed.name).toBe('Freelance');
		expect((await listResolvedGroups()).some((g) => g.id === created.id && g.name === 'Freelance')).toBe(
			true
		);
		await expect(renameCategoryGroup(created.id, 'gig work')).rejects.toThrow(/already exists/i);
		await expect(renameCategoryGroup(created.id, 'Home')).rejects.toThrow(/already exists/i);
		await expect(renameCategoryGroup('stock-group:work', 'Office')).rejects.toThrow(
			/cannot be renamed/i
		);
	});

	it('persists income and expense group order in one session', async () => {
		const all = await listResolvedGroups();
		const expense = all.filter((g) => g.kind === 'expense').map((g) => g.id);
		const income = all.filter((g) => g.kind === 'income').map((g) => g.id);
		const expenseSwapped = [expense[1]!, expense[0]!, ...expense.slice(2)];
		const incomeSwapped = [income[1]!, income[0]!, ...income.slice(2)];
		await saveCategoryGroupOrder('income', incomeSwapped);
		await saveCategoryGroupOrder('expense', expenseSwapped);
		const next = await listResolvedGroups();
		expect(next.filter((g) => g.kind === 'expense').map((g) => g.id)).toEqual(expenseSwapped);
		expect(next.filter((g) => g.kind === 'income').map((g) => g.id)).toEqual(incomeSwapped);
	});

	it('hides instead of blocking when a transaction uses the category', async () => {
		const account = await ensureDefaultAccount();
		const created = await createCategory('Warung', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: created.id
		});
		await removeCategory(created.id);
		expect(await getCategoriesForType('expense')).not.toEqual(
			expect.arrayContaining([expect.objectContaining({ id: created.id })])
		);
		expect(await db.categories.get(created.id)).toBeTruthy();
	});

	it('keeps hidden custom names after void-only use', async () => {
		const account = await ensureDefaultAccount();
		const created = await createCategory('Warung', 'expense');
		const tx = await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: created.id
		});
		await voidTransaction(tx.id);
		await removeCategory(created.id);
		expect((await listAllCategories()).find((c) => c.id === created.id)?.name).toBe('Warung');
		expect((await listCategories()).some((c) => c.id === created.id)).toBe(false);
	});
});
