import 'fake-indexeddb/auto';
import {
	createPocket,
	deletePocket,
	ensureDefaultAccount,
	getAccountsOverview,
	hasOnlyDefaultAccount,
	reorderPockets,
	updatePocket
} from './accounts';
import { addTransaction } from './transactions';
import { DEFAULT_ACCOUNT_NAME } from '$lib/domain/account';
import { db } from '$lib/data/db';
import { beforeEach, describe, expect, it } from 'vitest';

describe('accounts application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates the default Main account once', async () => {
		const first = await ensureDefaultAccount();
		expect(first.name).toBe(DEFAULT_ACCOUNT_NAME);
		expect(first.isMain).toBe(true);
		const second = await ensureDefaultAccount();
		expect(second.id).toBe(first.id);
		expect(await hasOnlyDefaultAccount()).toBe(true);
	});

	it('reports single-pot overview', async () => {
		const overview = await getAccountsOverview();
		expect(overview.isSinglePot).toBe(true);
		expect(overview.accounts).toHaveLength(1);
	});

	it('creates pockets and keeps Main first after reorder', async () => {
		const main = await ensureDefaultAccount();
		const a = await createPocket({ name: 'Alpha' });
		const b = await createPocket({ name: 'Beta' });
		await reorderPockets([b.id, a.id]);
		const { accounts } = await getAccountsOverview();
		expect(accounts.map((p) => p.id)).toEqual([main.id, b.id, a.id]);
	});

	it('renames Main but refuses delete', async () => {
		const main = await ensureDefaultAccount();
		const renamed = await updatePocket({ id: main.id, name: 'Household' });
		expect(renamed.isMain).toBe(true);
		expect(renamed.name).toBe('Household');
		await expect(deletePocket(main.id)).rejects.toThrow(/cannot be deleted/);
	});

	it('deletes empty non-Main pocket', async () => {
		await ensureDefaultAccount();
		const vac = await createPocket({ name: 'Vacation' });
		await deletePocket(vac.id);
		expect((await getAccountsOverview()).accounts).toHaveLength(1);
	});

	it('creates a pocket with an opening balance and as-of date', async () => {
		await ensureDefaultAccount();
		const savings = await createPocket({
			name: 'Savings',
			notes: 'Rainy day fund',
			openingEnabled: true,
			openingBalanceMinor: 15000,
			openingAsOf: '2026-01-01'
		});
		expect(savings.openingBalanceMinor).toBe(15000);
		expect(savings.openingAsOf).toBe('2026-01-01');
		expect(savings.notes).toBe('Rainy day fund');
		expect(savings.isMain).toBe(false);
	});

	it('refuses to reorder with a mismatched pocket set', async () => {
		await ensureDefaultAccount();
		await createPocket({ name: 'Alpha' });
		await createPocket({ name: 'Beta' });
		await expect(reorderPockets(['missing-id'])).rejects.toThrow(/incomplete/);
	});

	it('refuses to delete a pocket with transactions', async () => {
		await ensureDefaultAccount();
		const vac = await createPocket({ name: 'Vacation' });
		await addTransaction({ accountId: vac.id, type: 'expense', amountRaw: '1000' });
		await expect(deletePocket(vac.id)).rejects.toThrow(/before deleting/);
	});
});
