import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from './accounts';
import {
	createPocketBudget,
	dropPocketBudget,
	listPocketBudgets,
	restartPocketBudget,
	updatePocketBudget
} from './budgets';
import { isActiveBudget } from '$lib/domain/budgets';
import { todayOccurredOn } from '$lib/domain/transaction-rules';

describe('budgets application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates a pocket-wide budget and a category budget', async () => {
		const account = await ensureDefaultAccount();
		const pocket = await createPocketBudget({
			accountId: account.id,
			appliesTo: 'pocket',
			limitRaw: '100000'
		});
		expect(pocket.appliesTo).toBe('pocket');
		expect(pocket.categoryIds).toEqual([]);
		expect(pocket.startOn).toBe(todayOccurredOn());
		expect(pocket.hardLimit).toBe(false);
		expect(pocket.period).toBe('ongoing');

		const cats = await createPocketBudget({
			accountId: account.id,
			selectedIds: ['g1', 'g2', 'g3'],
			allSelectableIds: ['g1', 'g2', 'g3'],
			limitRaw: '50000',
			hardLimit: true,
			period: 'monthly'
		});
		expect(cats.appliesTo).toBe('pocket');
		expect(cats.hardLimit).toBe(true);
		expect(cats.period).toBe('monthly');

		const partial = await createPocketBudget({
			accountId: account.id,
			selectedIds: ['g1'],
			allSelectableIds: ['g1', 'g2'],
			limitRaw: '25000'
		});
		expect(partial.appliesTo).toBe('categories');
		expect(partial.categoryIds).toEqual(['g1']);
		expect(await listPocketBudgets(account.id)).toHaveLength(3);
	});

	it('refuses a future start date and empty category scope', async () => {
		const account = await ensureDefaultAccount();
		await expect(
			createPocketBudget({
				accountId: account.id,
				appliesTo: 'categories',
				categoryIds: [],
				limitRaw: '1000'
			})
		).rejects.toThrow(/category/i);
		await expect(
			createPocketBudget({
				accountId: account.id,
				appliesTo: 'pocket',
				limitRaw: '1000',
				startOn: '2099-01-01'
			})
		).rejects.toThrow(/today/i);
	});

	it('updates, restarts, and drops without hard-delete', async () => {
		const account = await ensureDefaultAccount();
		const row = await createPocketBudget({
			accountId: account.id,
			appliesTo: 'pocket',
			limitRaw: '10000',
			startOn: '2026-01-01'
		});
		const updated = await updatePocketBudget({
			id: row.id,
			limitRaw: '20000',
			hardLimit: true
		});
		expect(updated.limitMinor).toBe(20_000);
		expect(updated.hardLimit).toBe(true);

		const restarted = await restartPocketBudget(row.id);
		expect(restarted.startOn).toBe(todayOccurredOn());
		expect(restarted.limitMinor).toBe(20_000);

		const dropped = await dropPocketBudget(row.id);
		expect(isActiveBudget(dropped)).toBe(false);
		expect(await db.budgets.get(row.id)).toBeTruthy();
		await expect(updatePocketBudget({ id: row.id, limitRaw: '1' })).rejects.toThrow(/dropped/i);
	});
});
