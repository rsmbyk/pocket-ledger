import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, SETTINGS_DISPLAY_CURRENCY, SETTINGS_IDLE_MINUTES, SETTINGS_RAW_DEK } from '$lib/data/db';
import { clearDataKey } from '$lib/data/session-key';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { createCategory, listCategories } from '$lib/application/categories';
import { addTransaction, listRecentTransactions } from '$lib/application/transactions';
import { createPocketGoal, listGoals } from '$lib/application/goals';
import { listNetWorthSnapshots, putNetWorthSnapshot } from '$lib/data/net-worth-repo';
import {
	enableLock,
	ensureLocalDek,
	isLockEnabled,
	unlockWithPassphrase
} from '$lib/application/lock';
import { setSetting } from '$lib/data/settings-repo';
import { getDisplayCurrency } from './display-currency';
import { resetLocalData } from './reset';

describe('resetLocalData', () => {
	beforeEach(async () => {
		clearDataKey();
		await db.delete();
		await db.open();
	});

	it('always wipes txs goals snapshots and categories; recreates Main', async () => {
		const account = await ensureDefaultAccount();
		const food = (await listCategories()).find((c) => c.id === 'stock:expense:food')!;
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			categoryId: food.id
		});
		await createPocketGoal({
			accountId: account.id,
			description: 'Trip',
			targetRaw: '100000',
			targetOn: '2099-12-31'
		});
		await putNetWorthSnapshot({
			id: crypto.randomUUID(),
			capturedOn: '2026-07-14',
			totalMinor: 1000,
			createdAt: new Date().toISOString()
		});

		await resetLocalData({ preserveSettings: false, preservePassphrase: false });

		expect(await listRecentTransactions((await ensureDefaultAccount()).id)).toHaveLength(0);
		expect(await listGoals()).toHaveLength(0);
		expect(await listNetWorthSnapshots()).toHaveLength(0);
		expect(await db.categories.count()).toBe(0);
		expect(await listCategories()).toHaveLength(139);
		expect(await isLockEnabled()).toBe(false);
	});

	it('keeps currency and idle when preserveSettings is on; always wipes categories', async () => {
		const account = await ensureDefaultAccount();
		await createCategory('Warung', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000'
		});
		await setSetting(SETTINGS_DISPLAY_CURRENCY, 'USD');
		await setSetting(SETTINGS_IDLE_MINUTES, '10');

		await resetLocalData({ preserveSettings: true, preservePassphrase: false });

		expect(await db.categories.count()).toBe(0);
		expect(await getDisplayCurrency()).toBe('USD');
		expect((await db.settings.get(SETTINGS_IDLE_MINUTES))?.value).toBe('10');
		expect(await listRecentTransactions((await ensureDefaultAccount()).id)).toHaveLength(0);
	});

	it('can preserve passphrase settings', async () => {
		const account = await ensureDefaultAccount();
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000'
		});
		await enableLock('secret-pass');

		await resetLocalData({ preserveSettings: false, preservePassphrase: true });

		expect(await isLockEnabled()).toBe(true);
		expect(await unlockWithPassphrase('secret-pass')).toBe(true);
		expect(await listRecentTransactions((await ensureDefaultAccount()).id)).toHaveLength(0);
	});

	it('does not keep a raw DEK solely to preserve categories', async () => {
		await ensureDefaultAccount();
		await ensureLocalDek();
		await createCategory('Warung', 'expense');

		await resetLocalData({ preserveSettings: false, preservePassphrase: false });
		expect((await db.settings.get(SETTINGS_RAW_DEK))?.value).toBeFalsy();
	});
});
