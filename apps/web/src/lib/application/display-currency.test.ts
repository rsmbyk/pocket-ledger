import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { createPocket, ensureDefaultAccount, getAccountsOverview } from './accounts';
import { getDisplayCurrency, saveDisplayCurrency } from './display-currency';

describe('display currency application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('defaults to IDR and writes every pocket on save', async () => {
		await ensureDefaultAccount();
		await createPocket({ name: 'Vacation' });
		expect(await getDisplayCurrency()).toBe('IDR');
		await saveDisplayCurrency('USD');
		expect(await getDisplayCurrency()).toBe('USD');
		const { accounts } = await getAccountsOverview();
		expect(accounts.every((a) => a.currencyLabel === 'USD')).toBe(true);
	});
});
