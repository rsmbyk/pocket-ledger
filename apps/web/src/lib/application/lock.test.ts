import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { SETTINGS_RAW_DEK, SETTINGS_WRAPPED_DEK } from '$lib/data/db';
import { getSetting } from '$lib/data/settings-repo';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { listCategories } from '$lib/application/categories';
import { addTransaction } from '$lib/application/transactions';
import { clearDataKey } from '$lib/data/session-key';
import { disableLock, enableLock, ensureLocalDek, isLockEnabled, verifyPassphrase } from './lock';

describe('lock', () => {
	beforeEach(async () => {
		clearDataKey();
		await db.delete();
		await db.open();
	});

	it('is disabled by default', async () => {
		expect(await isLockEnabled()).toBe(false);
	});

	it('enables and verifies a passphrase', async () => {
		await enableLock('secret-pass');
		expect(await isLockEnabled()).toBe(true);
		expect(await verifyPassphrase('secret-pass')).toBe(true);
		expect(await verifyPassphrase('wrong-pass')).toBe(false);
	});

	it('disables with the correct passphrase', async () => {
		await enableLock('secret-pass');
		await disableLock('secret-pass');
		expect(await isLockEnabled()).toBe(false);
	});

	it('stores a raw DEK when passphrase is off and wraps without rewriting rows', async () => {
		const account = await ensureDefaultAccount();
		const food = (await listCategories()).find((c) => c.id === 'stock:expense:food')!;
		await ensureLocalDek();
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '12000',
			categoryId: food.id,
			note: 'keep-me'
		});
		const before = (await db.transactions.toArray())[0]!.note;
		expect(await getSetting(SETTINGS_RAW_DEK)).toBeTruthy();
		expect(await getSetting(SETTINGS_WRAPPED_DEK)).toBeUndefined();

		await enableLock('secret-pass');
		expect(await getSetting(SETTINGS_RAW_DEK)).toBeUndefined();
		expect(await getSetting(SETTINGS_WRAPPED_DEK)).toBeTruthy();
		expect((await db.transactions.toArray())[0]!.note).toBe(before);

		await disableLock('secret-pass');
		expect(await getSetting(SETTINGS_RAW_DEK)).toBeTruthy();
		expect(await getSetting(SETTINGS_WRAPPED_DEK)).toBeUndefined();
		expect((await db.transactions.toArray())[0]!.note).toBe(before);
	});

	it('migrates leftover plaintext notes once a DEK exists', async () => {
		const account = await ensureDefaultAccount();
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			note: 'plain leftover'
		});
		expect((await db.transactions.toArray())[0]!.note).toBe('plain leftover');
		await ensureLocalDek();
		expect((await db.transactions.toArray())[0]!.note).not.toBe('plain leftover');
	});
});
