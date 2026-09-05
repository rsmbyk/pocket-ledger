import 'fake-indexeddb/auto';
import {
	createPocket,
	deletePocket,
	ensureDefaultAccount,
	getAccountsOverview,
	hasOnlyDefaultAccount,
	pocketDeleteBlockers,
	reorderPockets,
	updatePocket
} from './accounts';
import { addTransaction } from './transactions';
import { createPocketGoal, dropPocketGoal, listPocketGoals } from './goals';
import { DEFAULT_ACCOUNT_NAME } from '$lib/domain/account';
import { db } from '$lib/data/db';
import { todayOccurredOn } from '$lib/domain/transaction-rules';
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

	it('rejects duplicate pocket names; allows literal Main beside fallback (201)', async () => {
		await ensureDefaultAccount();
		await createPocket({ name: 'Daily' });
		await expect(createPocket({ name: 'daily' })).rejects.toThrow(/already exists/i);
		const namedMain = await createPocket({ name: 'Main' });
		expect(namedMain.name).toBe('Main');
		expect(namedMain.isMain).toBe(false);
		await expect(createPocket({ name: 'main' })).rejects.toThrow(/already exists/i);
		const main = (await getAccountsOverview()).accounts.find((a) => a.isMain)!;
		const household = await updatePocket({ id: main.id, name: 'Household' });
		expect(household.name).toBe('Household');
		const restoredNamed = await updatePocket({ id: main.id, name: 'Main' });
		expect(restoredNamed.name).toBe(DEFAULT_ACCOUNT_NAME);
		await updatePocket({ id: main.id, name: 'Household' });
		const restored = await updatePocket({ id: main.id, name: '' });
		expect(restored.name).toBe(DEFAULT_ACCOUNT_NAME);
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

	it('rejects negative opening balance on create and update', async () => {
		await ensureDefaultAccount();
		await expect(
			createPocket({
				name: 'Overdraft',
				openingEnabled: true,
				openingBalanceMinor: -100,
				openingAsOf: '2026-01-01'
			})
		).rejects.toThrow(/zero or greater/i);

		const vac = await createPocket({
			name: 'Vacation',
			openingEnabled: true,
			openingBalanceMinor: 0,
			openingAsOf: '2026-01-01'
		});
		await expect(
			updatePocket({
				id: vac.id,
				name: vac.name,
				openingEnabled: true,
				openingBalanceMinor: -50,
				openingAsOf: '2026-01-01'
			})
		).rejects.toThrow(/zero or greater/i);
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
		await expect(deletePocket(vac.id)).rejects.toThrow(/still has transactions/i);
	});

	it('refuses to delete a pocket with active goals and cascades past rows', async () => {
		await ensureDefaultAccount();
		const vac = await createPocket({ name: 'Vacation' });
		const today = todayOccurredOn();
		await createPocketGoal({
			accountId: vac.id,
			targetRaw: '50000',
			targetOn: today
		});
		await expect(deletePocket(vac.id)).rejects.toThrow(/active goals/i);

		await dropPocketGoal((await listPocketGoals(vac.id))[0]!.id);
		expect(await pocketDeleteBlockers(vac.id)).toEqual([]);
		await deletePocket(vac.id);
		expect((await getAccountsOverview()).accounts).toHaveLength(1);
		const leftover = await db.goals.where('accountId').equals(vac.id).toArray();
		expect(leftover.length).toBeGreaterThan(0);
		expect(leftover.every((g) => g.deletedAt != null)).toBe(true);
	});
});
