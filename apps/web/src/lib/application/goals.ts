import { listGoals as listGoalsRaw, listGoalsForAccount, putGoal, putGoals } from '$lib/data/goals-repo';
import { db } from '$lib/data/db';
import { listAccounts, putAccount } from '$lib/data/account-repo';
import {
	assertGoalDateNotPast,
	assertGoalTarget,
	isActive,
	migrateAccountGoalsToRows,
	stripAccountGoalFields,
	type PocketGoal
} from '$lib/domain/goals';
import { parseAmountInput, todayOccurredOn } from '$lib/domain/transaction-rules';
import { openField, sealField } from '$lib/application/field-crypto';
import { pushSealedEntity } from '$lib/application/sync-client';

export const SYNC_KIND_GOAL = 'goal';

function createId(): string {
	return crypto.randomUUID();
}

async function openGoal(row: PocketGoal): Promise<PocketGoal> {
	return {
		...row,
		description: await openField(row.description ?? '')
	};
}

async function sealGoal(goal: PocketGoal): Promise<PocketGoal> {
	return {
		...goal,
		description: await sealField(goal.description.trim())
	};
}

async function pushGoal(id: string): Promise<void> {
	const row = await db.goals.get(id);
	if (!row) return;
	try {
		await pushSealedEntity(SYNC_KIND_GOAL, id, row, false);
	} catch {
		/* signed-out / API down — Dexie is the ledger */
	}
}

export async function listGoals(): Promise<PocketGoal[]> {
	const rows = await listGoalsRaw();
	return Promise.all(rows.filter((g) => g.accountId).map(openGoal));
}

export async function listPocketGoals(accountId: string): Promise<PocketGoal[]> {
	const rows = await listGoalsForAccount(accountId);
	return Promise.all(rows.map(openGoal));
}

export async function migratePocketGoals(): Promise<void> {
	const accounts = await listAccounts();
	const existing = await listGoalsRaw();
	const next = migrateAccountGoalsToRows(accounts, existing, new Date().toISOString());
	const existingIds = new Set(existing.map((g) => g.id));
	const created = next.filter((g) => !existingIds.has(g.id));
	if (created.length > 0) await putGoals(created);
	for (const account of accounts) {
		if (!account.goalEnabled && account.goalTargetMinor == null) continue;
		await putAccount(stripAccountGoalFields(account));
	}
}

export type CreatePocketGoalInput = {
	accountId: string;
	description?: string;
	targetRaw: string;
	targetOn?: string | null;
};

export async function createPocketGoal(input: CreatePocketGoalInput): Promise<PocketGoal> {
	const targetMinor = parseAmountInput(input.targetRaw);
	assertGoalTarget(targetMinor);
	const today = todayOccurredOn();
	const targetOn = input.targetOn?.trim() ? input.targetOn.trim() : null;
	if (targetOn) assertGoalDateNotPast(targetOn, today);
	const plain: PocketGoal = {
		id: createId(),
		accountId: input.accountId,
		description: (input.description ?? '').trim(),
		targetMinor,
		targetOn,
		createdAt: new Date().toISOString(),
		cancelledAt: null,
		deletedAt: null
	};
	await putGoal(await sealGoal(plain));
	await pushGoal(plain.id);
	return plain;
}

export type UpdatePocketGoalInput = {
	id: string;
	description?: string;
	targetRaw?: string;
	targetOn?: string | null;
};

export async function updatePocketGoal(input: UpdatePocketGoalInput): Promise<PocketGoal> {
	const raw = await listGoalsRaw();
	const stored = raw.find((g) => g.id === input.id);
	if (!stored) throw new Error('Goal not found');
	const opened = await openGoal(stored);
	const today = todayOccurredOn();
	if (!isActive(opened, today)) throw new Error('Past goals cannot be edited');
	const targetMinor =
		input.targetRaw !== undefined ? parseAmountInput(input.targetRaw) : opened.targetMinor;
	assertGoalTarget(targetMinor);
	let targetOn = opened.targetOn;
	if (input.targetOn !== undefined) {
		targetOn = input.targetOn?.trim() ? input.targetOn.trim() : null;
		if (targetOn) assertGoalDateNotPast(targetOn, today);
	}
	const next: PocketGoal = {
		...opened,
		description:
			input.description !== undefined ? input.description.trim() : opened.description,
		targetMinor,
		targetOn
	};
	await putGoal(await sealGoal(next));
	await pushGoal(next.id);
	return next;
}

export async function dropPocketGoal(id: string): Promise<PocketGoal> {
	const raw = await listGoalsRaw();
	const stored = raw.find((g) => g.id === id);
	if (!stored) throw new Error('Goal not found');
	const opened = await openGoal(stored);
	const today = todayOccurredOn();
	if (!isActive(opened, today)) throw new Error('Past goals cannot be dropped');
	const now = new Date().toISOString();
	const next: PocketGoal = {
		...opened,
		cancelledAt: now,
		deletedAt: opened.targetOn == null ? now : null
	};
	await putGoal(await sealGoal(next));
	await pushGoal(next.id);
	return next;
}

export async function softDeleteGoalsForPocket(accountId: string): Promise<void> {
	const rows = await listGoalsForAccount(accountId);
	const now = new Date().toISOString();
	for (const row of rows) {
		if (row.deletedAt) continue;
		await putGoal({
			...row,
			cancelledAt: row.cancelledAt ?? now,
			deletedAt: now
		});
		await pushGoal(row.id);
	}
}
