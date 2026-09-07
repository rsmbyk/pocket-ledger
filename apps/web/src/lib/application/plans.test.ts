import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { createPocket, ensureDefaultAccount } from './accounts';
import { listRecentTransactions } from './transactions';
import { todayOccurredOn } from '$lib/domain/transaction-rules';
import { addCalendarDays } from '$lib/domain/plan';
import {
	acceptPlanOccurrence,
	createPlan,
	dropPlan,
	listPlans,
	savePlanForNext,
	skipPlanOccurrence,
	updatePlan
} from './plans';

describe('plans application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates, lists, updates, and drops a Once plan without posting', async () => {
		const account = await ensureDefaultAccount();
		const dueOn = addCalendarDays(todayOccurredOn(), 3);
		const created = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000000',
			description: 'Rent',
			note: 'landlord',
			dueOn
		});
		expect(created.frequency).toBe('once');
		expect(created.monthDay).toBeNull();
		expect(await listPlans()).toHaveLength(1);
		expect((await listRecentTransactions())[0]).toBeUndefined();

		const updated = await updatePlan({
			id: created.id,
			accountId: account.id,
			type: 'expense',
			amountRaw: '1100000',
			description: 'Rent',
			dueOn
		});
		expect(updated.amountMinor).toBe(1_100_000);
		expect(await db.transactions.count()).toBe(0);

		await dropPlan(created.id);
		expect(await listPlans()).toHaveLength(0);
		expect(await db.transactions.count()).toBe(0);
	});

	it('creates an expense plan with Admin Fee category (237)', async () => {
		const account = await ensureDefaultAccount();
		const dueOn = addCalendarDays(todayOccurredOn(), 3);
		const created = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '5000',
			categoryId: '__admin_fee__',
			dueOn
		});
		expect(created.categoryId).toBe('__admin_fee__');
	});

	it('accept Save posts a tx and gravestones a Once plan', async () => {
		const account = await ensureDefaultAccount();
		const dueOn = todayOccurredOn();
		const created = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '50000',
			note: 'lunch',
			dueOn
		});
		const { tx, plan } = await acceptPlanOccurrence({
			id: created.id,
			accountId: account.id,
			type: 'expense',
			amountRaw: '55000',
			note: 'lunch',
			dueOn,
			occurredOn: dueOn
		});
		expect(tx.amountMinor).toBe(55_000);
		expect(plan).toBeNull();
		expect(await listPlans()).toHaveLength(0);
		expect(await db.transactions.count()).toBe(1);
	});

	it('Skip this occurrence gravestones Once without a tx', async () => {
		const account = await ensureDefaultAccount();
		const created = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '50000',
			dueOn: todayOccurredOn()
		});
		await skipPlanOccurrence(created.id);
		expect(await listPlans()).toHaveLength(0);
		expect(await db.transactions.count()).toBe(0);
	});

	it('advances weekly/monthly after Save or Skip and does not rewrite template amount on Save', async () => {
		const account = await ensureDefaultAccount();
		const weekly = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000000',
			dueOn: '2026-09-07',
			frequency: 'weekly'
		});
		const { plan: afterSave } = await acceptPlanOccurrence({
			id: weekly.id,
			accountId: account.id,
			type: 'expense',
			amountRaw: '1100000',
			dueOn: '2026-09-07',
			occurredOn: '2026-09-07'
		});
		expect(afterSave?.dueOn).toBe('2026-09-14');
		expect(afterSave?.amountMinor).toBe(1_000_000);
		expect(await db.transactions.count()).toBe(1);

		const monthly = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '200000',
			dueOn: '2026-01-31',
			frequency: 'monthly'
		});
		expect(monthly.monthDay).toBe(31);
		const skipped = await skipPlanOccurrence(monthly.id);
		expect(skipped?.dueOn).toBe('2026-02-28');
		expect(skipped?.monthDay).toBe(31);
		const skippedAgain = await skipPlanOccurrence(monthly.id);
		expect(skippedAgain?.dueOn).toBe('2026-03-31');
		expect(skippedAgain?.monthDay).toBe(31);
	});

	it('Save for next writes tx info only and refuses Once', async () => {
		const account = await ensureDefaultAccount();
		const vac = await createPocket({ name: 'Vacation' });
		const weekly = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000000',
			dueOn: '2026-09-07',
			frequency: 'weekly'
		});
		const next = await savePlanForNext({
			id: weekly.id,
			accountId: vac.id,
			type: 'expense',
			amountRaw: '1200000',
			dueOn: '2026-09-07',
			occurredOn: '2026-09-08',
			note: 'updated'
		});
		expect(next.amountMinor).toBe(1_200_000);
		expect(next.accountId).toBe(vac.id);
		expect(next.dueOn).toBe('2026-09-08');
		expect(next.note).toBe('updated');
		expect(await db.transactions.count()).toBe(0);

		const once = await createPlan({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			dueOn: todayOccurredOn()
		});
		await expect(
			savePlanForNext({
				id: once.id,
				accountId: account.id,
				type: 'expense',
				amountRaw: '2000',
				dueOn: once.dueOn
			})
		).rejects.toThrow(/repeating/i);
	});
});
