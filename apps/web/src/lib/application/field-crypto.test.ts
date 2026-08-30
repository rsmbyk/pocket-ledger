import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { listCategories } from '$lib/application/categories';
import { addTransaction, listRecentTransactions } from '$lib/application/transactions';
import { disableLock, enableLock, unlockWithPassphrase } from '$lib/application/lock';
import { CIPHER_PREFIX, isSealed } from '$lib/application/field-crypto';
import { clearDataKey } from '$lib/data/session-key';

describe('field encryption', () => {
	beforeEach(async () => {
		clearDataKey();
		await db.delete();
		await db.open();
	});

	it('seals notes at rest when lock is enabled and reveals after unlock', async () => {
		const account = await ensureDefaultAccount();
		const food = (await listCategories()).find((c) => c.id === 'stock:expense:food')!;
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '12000',
			categoryId: food.id,
			note: 'secret lunch'
		});

		await enableLock('secret-pass');
		const raw = (await db.transactions.toArray())[0]!;
		expect(isSealed(raw.note)).toBe(true);
		expect(raw.note.startsWith(CIPHER_PREFIX)).toBe(true);
		expect(raw.note).not.toContain('secret lunch');

		clearDataKey();
		expect(await unlockWithPassphrase('secret-pass')).toBe(true);
		const listed = await listRecentTransactions(account.id);
		expect(listed[0]!.note).toBe('secret lunch');

		await disableLock('secret-pass');
		const stillSealed = (await db.transactions.toArray())[0]!;
		expect(isSealed(stillSealed.note)).toBe(true);
		expect(await listRecentTransactions(account.id)).toEqual(
			expect.arrayContaining([expect.objectContaining({ note: 'secret lunch' })])
		);
	});
});
