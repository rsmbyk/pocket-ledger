import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { putAccount } from '$lib/data/account-repo';
import { ensureDefaultAccount } from './accounts';
import {
	createPocketGoal,
	dropPocketGoal,
	listGoals,
	listPocketGoals,
	migratePocketGoals,
	updatePocketGoal
} from './goals';
import { todayOccurredOn } from '$lib/domain/transaction-rules';
import { isActive, isHidden, isPast } from '$lib/domain/goals';

describe('goals application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('migrates pocket goal fields into one row', async () => {
		const account = await ensureDefaultAccount();
		await putAccount({
			...account,
			goalEnabled: true,
			goalTargetMinor: 100_000,
			goalTargetOn: '2099-01-01'
		});
		await migratePocketGoals();
		const goals = await listPocketGoals(account.id);
		expect(goals).toHaveLength(1);
		expect(goals[0]?.targetMinor).toBe(100_000);
		expect(goals[0]?.targetOn).toBe('2099-01-01');
		expect(goals[0]?.description).toBe('');
		expect(goals[0]?.cancelledAt).toBeNull();
		await migratePocketGoals();
		expect(await listPocketGoals(account.id)).toHaveLength(1);
	});

	it('creates and lists an active goal; refuses a past date', async () => {
		const account = await ensureDefaultAccount();
		const goal = await createPocketGoal({
			accountId: account.id,
			description: 'Emergency',
			targetRaw: '1000000',
			targetOn: todayOccurredOn()
		});
		expect(goal.targetMinor).toBe(1_000_000);
		expect(await listGoals()).toHaveLength(1);
		await expect(
			createPocketGoal({
				accountId: account.id,
				targetRaw: '10000',
				targetOn: '2000-01-01'
			})
		).rejects.toThrow(/earlier than today/i);
	});

	it('updates only active goals', async () => {
		const account = await ensureDefaultAccount();
		const goal = await createPocketGoal({
			accountId: account.id,
			description: 'Sooner',
			targetRaw: '200000',
			targetOn: todayOccurredOn()
		});
		const updated = await updatePocketGoal({
			id: goal.id,
			description: 'Trip',
			targetRaw: '250000'
		});
		expect(updated.description).toBe('Trip');
		expect(updated.targetMinor).toBe(250_000);
	});

	it('drops dated goals into past and no-date goals into hidden; never hard-deletes', async () => {
		const account = await ensureDefaultAccount();
		const dated = await createPocketGoal({
			accountId: account.id,
			targetRaw: '50000',
			targetOn: todayOccurredOn()
		});
		const open = await createPocketGoal({
			accountId: account.id,
			targetRaw: '80000'
		});
		const droppedDated = await dropPocketGoal(dated.id);
		expect(droppedDated.cancelledAt).toBeTruthy();
		expect(droppedDated.deletedAt).toBeNull();
		expect(isPast(droppedDated, todayOccurredOn())).toBe(true);
		expect(isActive(droppedDated, todayOccurredOn())).toBe(false);

		const droppedOpen = await dropPocketGoal(open.id);
		expect(droppedOpen.cancelledAt).toBeTruthy();
		expect(droppedOpen.deletedAt).toBeTruthy();
		expect(isHidden(droppedOpen)).toBe(true);
		expect(isPast(droppedOpen, todayOccurredOn())).toBe(false);

		expect(await db.goals.count()).toBe(2);
		await expect(updatePocketGoal({ id: dated.id, description: 'nope' })).rejects.toThrow(
			/cannot be edited/i
		);
	});
});
