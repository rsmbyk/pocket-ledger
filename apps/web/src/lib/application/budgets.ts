import { listBudgets as listBudgetsRaw, listBudgetsForAccount, putBudget } from '$lib/data/budgets-repo';
import { db } from '$lib/data/db';
import { getAccount } from '$lib/data/account-repo';
import {
	assertBudgetLimit,
	assertBudgetStartOn,
	isActiveBudget,
	resolveAppliesTo,
	type BudgetAppliesTo,
	type BudgetPeriod,
	type PocketBudget
} from '$lib/domain/budgets';
import { parseAmountInput, todayOccurredOn } from '$lib/domain/transaction-rules';
import { pushSealedEntity } from '$lib/application/sync-client';

export const SYNC_KIND_BUDGET = 'budget';

function createId(): string {
	return crypto.randomUUID();
}

async function pushBudget(id: string): Promise<void> {
	const row = await db.budgets.get(id);
	if (!row) return;
	try {
		await pushSealedEntity(SYNC_KIND_BUDGET, id, row, false);
	} catch {
		/* signed-out / API down — Dexie is the ledger */
	}
}

export async function listBudgets(): Promise<PocketBudget[]> {
	return listBudgetsRaw();
}

export async function listPocketBudgets(accountId: string): Promise<PocketBudget[]> {
	return listBudgetsForAccount(accountId);
}

export type CreatePocketBudgetInput = {
	accountId: string;
	appliesTo?: BudgetAppliesTo;
	categoryIds?: string[];
	selectedIds?: string[];
	allSelectableIds?: string[];
	limitRaw: string;
	hardLimit?: boolean;
	period?: BudgetPeriod;
	startOn?: string;
};

function resolveScope(
	input: Pick<CreatePocketBudgetInput, 'appliesTo' | 'categoryIds' | 'selectedIds' | 'allSelectableIds'>
): { appliesTo: BudgetAppliesTo; categoryIds: string[] } {
	if (input.selectedIds && input.allSelectableIds) {
		const resolved = resolveAppliesTo(input.selectedIds, input.allSelectableIds);
		if (resolved.appliesTo === 'categories' && resolved.categoryIds.length === 0) {
			throw new Error('Choose at least one category');
		}
		return resolved;
	}
	const appliesTo = input.appliesTo ?? 'categories';
	const categoryIds = appliesTo === 'pocket' ? [] : [...(input.categoryIds ?? [])];
	if (appliesTo === 'categories' && categoryIds.length === 0) {
		throw new Error('Choose at least one category');
	}
	return { appliesTo, categoryIds };
}

export async function createPocketBudget(input: CreatePocketBudgetInput): Promise<PocketBudget> {
	const pocket = await getAccount(input.accountId);
	if (!pocket) throw new Error('Pocket not found');
	const limitMinor = parseAmountInput(input.limitRaw);
	assertBudgetLimit(limitMinor);
	const today = todayOccurredOn();
	const startOn = input.startOn?.trim() ? input.startOn.trim() : today;
	assertBudgetStartOn(startOn, today);
	const scope = resolveScope(input);
	const plain: PocketBudget = {
		id: createId(),
		accountId: input.accountId,
		appliesTo: scope.appliesTo,
		categoryIds: scope.categoryIds,
		limitMinor,
		hardLimit: input.hardLimit === true,
		period: input.period === 'monthly' ? 'monthly' : 'ongoing',
		startOn,
		createdAt: new Date().toISOString(),
		cancelledAt: null,
		deletedAt: null
	};
	await putBudget(plain);
	await pushBudget(plain.id);
	return plain;
}

export type UpdatePocketBudgetInput = {
	id: string;
	appliesTo?: BudgetAppliesTo;
	categoryIds?: string[];
	selectedIds?: string[];
	allSelectableIds?: string[];
	limitRaw?: string;
	hardLimit?: boolean;
	period?: BudgetPeriod;
	startOn?: string;
};

export async function updatePocketBudget(input: UpdatePocketBudgetInput): Promise<PocketBudget> {
	const stored = (await listBudgetsRaw()).find((b) => b.id === input.id);
	if (!stored) throw new Error('Budget not found');
	if (!isActiveBudget(stored)) throw new Error('Dropped budgets cannot be edited');
	const today = todayOccurredOn();
	let limitMinor = stored.limitMinor;
	if (input.limitRaw !== undefined) {
		limitMinor = parseAmountInput(input.limitRaw);
		assertBudgetLimit(limitMinor);
	}
	let startOn = stored.startOn;
	if (input.startOn !== undefined) {
		startOn = input.startOn.trim();
		assertBudgetStartOn(startOn, today);
	}
	const scope =
		input.selectedIds && input.allSelectableIds
			? resolveScope(input)
			: input.appliesTo !== undefined || input.categoryIds !== undefined
				? resolveScope({
						appliesTo: input.appliesTo ?? stored.appliesTo,
						categoryIds: input.categoryIds ?? stored.categoryIds
					})
				: { appliesTo: stored.appliesTo, categoryIds: stored.categoryIds };
	const next: PocketBudget = {
		...stored,
		...scope,
		limitMinor,
		startOn,
		hardLimit: input.hardLimit !== undefined ? input.hardLimit : stored.hardLimit,
		period: input.period !== undefined ? input.period : stored.period
	};
	await putBudget(next);
	await pushBudget(next.id);
	return next;
}

export async function restartPocketBudget(id: string): Promise<PocketBudget> {
	const stored = (await listBudgetsRaw()).find((b) => b.id === id);
	if (!stored) throw new Error('Budget not found');
	if (!isActiveBudget(stored)) throw new Error('Dropped budgets cannot be restarted');
	const next: PocketBudget = {
		...stored,
		startOn: todayOccurredOn()
	};
	await putBudget(next);
	await pushBudget(next.id);
	return next;
}

export async function dropPocketBudget(id: string): Promise<PocketBudget> {
	const stored = (await listBudgetsRaw()).find((b) => b.id === id);
	if (!stored) throw new Error('Budget not found');
	if (!isActiveBudget(stored)) throw new Error('Dropped budgets cannot be dropped');
	const now = new Date().toISOString();
	const next: PocketBudget = {
		...stored,
		cancelledAt: now,
		deletedAt: now
	};
	await putBudget(next);
	await pushBudget(next.id);
	return next;
}

export async function softDeleteBudgetsForPocket(accountId: string): Promise<void> {
	const rows = await listBudgetsForAccount(accountId);
	const now = new Date().toISOString();
	for (const row of rows) {
		if (row.deletedAt) continue;
		await putBudget({
			...row,
			cancelledAt: row.cancelledAt ?? now,
			deletedAt: now
		});
		await pushBudget(row.id);
	}
}
