import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { addTransaction, getCategoriesForType } from '$lib/application/transactions';
import { captureNetWorth, listNetWorthSnapshots } from './net-worth';

describe('net worth', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('captures current balance as a snapshot', async () => {
		const account = await ensureDefaultAccount();
		const incomeCats = await getCategoriesForType('income');
		await addTransaction({
			accountId: account.id,
			type: 'income',
			amountRaw: '85000',
			categoryId: incomeCats[0]!.id
		});

		const snap = await captureNetWorth('2026-07-14');
		expect(snap.totalMinor).toBe(85_000);
		expect(snap.capturedOn).toBe('2026-07-14');

		await captureNetWorth('2026-07-14');
		expect(await listNetWorthSnapshots()).toHaveLength(1);
	});
});
