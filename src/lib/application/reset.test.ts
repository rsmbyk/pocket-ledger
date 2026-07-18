	import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { createCategory, listCategories } from '$lib/application/categories';
import { addTransaction, listRecentTransactions } from '$lib/application/transactions';
import { createGoal, listGoals } from '$lib/application/goals';
import { listNetWorthSnapshots, putNetWorthSnapshot } from '$lib/data/net-worth-repo';
import { enableLock, isLockEnabled, unlockWithPassphrase } from '$lib/application/lock';
import { resetLocalData } from './reset';

describe('resetLocalData', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('always wipes txs goals snapshots; recreates Main', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			categoryId: food.id
		});
		await createGoal('Trip', '100000', '2026-12-31');
		await putNetWorthSnapshot({
			id: crypto.randomUUID(),
			capturedOn: '2026-07-14',
			totalMinor: 1000,
			createdAt: new Date().toISOString()
		});

		await resetLocalData({ preserveCategories: false, preservePassphrase: false });

		expect(await listRecentTransactions((await ensureDefaultAccount()).id)).toHaveLength(0);
		expect(await listGoals()).toHaveLength(0);
		expect(await listNetWorthSnapshots()).toHaveLength(0);
		expect(await listCategories()).toHaveLength(0);
		expect(await isLockEnabled()).toBe(false);
	});

	it('can preserve categories and passphrase settings', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			categoryId: food.id
		});
		await enableLock('secret-pass');

		await resetLocalData({ preserveCategories: true, preservePassphrase: true });

		expect(await db.categories.count()).toBe(1);
		expect(await isLockEnabled()).toBe(true);
		expect(await unlockWithPassphrase('secret-pass')).toBe(true);
		const cats = await listCategories();
		expect(cats.some((c) => c.name === 'Food')).toBe(true);
		expect(await listRecentTransactions((await ensureDefaultAccount()).id)).toHaveLength(0);
	});
});
