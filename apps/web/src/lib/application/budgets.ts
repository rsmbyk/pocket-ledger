import { listBudgets as listBudgetsRaw, listBudgetsForAccount, putBudget } from '$lib/data/budgets-repo';
import { db } from '$lib/data/db';
import { getAccount } from '$lib/data/account-repo';
import {
	assertBudgetLimit,
	assertBudgetStartOn,
	isActiveBudget,
	resolveAppliesTo,
	findDuplicateActiveScope,
	DUPLICATE_BUDGET_SCOPE,
	hydrateBudgetScope,
	type BudgetAppliesTo,
	type BudgetPeriod,
	type BudgetScopeCatalog,
	type PocketBudget
} from '$lib/domain/budgets';
import { parseAmountInput, todayOccurredOn } from '$lib/domain/transaction-rules';
import { pushSealedEntity } from '$lib/application/sync-client';
import { listAllCategories, listResolvedGroups } from '$lib/application/categories';

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
	groupIds?: string[];
	selectedIds?: string[];
	allSelectableIds?: string[];
	limitRaw: string;
	hardLimit?: boolean;
	period?: BudgetPeriod;
	startOn?: string;
};

function resolveScope(
	input: Pick<
		CreatePocketBudgetInput,
		'appliesTo' | 'categoryIds' | 'selectedIds' | 'allSelectableIds' | 'groupIds'
	>,
	catalog: BudgetScopeCatalog
): { appliesTo: BudgetAppliesTo; categoryIds: string[]; groupIds: string[] } {
	if (input.selectedIds && input.allSelectableIds) {
		const resolved = resolveAppliesTo(input.selectedIds, input.allSelectableIds, catalog);
		if (resolved.appliesTo === 'categories' && resolved.categoryIds.length === 0 && resolved.groupIds.length === 0) {
			throw new Error('Choose at least one category');
		}
		return resolved;
	}
	const appliesTo = input.appliesTo ?? 'categories';
	const categoryIds = appliesTo === 'pocket' ? [] : [...(input.categoryIds ?? [])];
	const groupIds = appliesTo === 'pocket' ? [] : [...(input.groupIds ?? [])];
	if (appliesTo === 'categories' && categoryIds.length === 0 && groupIds.length === 0) {
		throw new Error('Choose at least one category');
	}
	return { appliesTo, categoryIds, groupIds };
}

async function loadBudgetCatalog(): Promise<BudgetScopeCatalog> {
	const [groups, categories] = await Promise.all([listResolvedGroups(), listAllCategories()]);
	return {
		groups: groups.filter((g) => g.kind === 'expense'),
		categories: categories
			.filter((c) => c.kind === 'expense')
			.map((c) => ({ id: c.id, name: c.name, groupId: c.groupId }))
	};
}

async function assertUniqueScope(
	accountId: string,
	scope: { appliesTo: BudgetAppliesTo; groupIds: string[]; categoryIds: string[] },
	exceptId: string | null,
	catalog: BudgetScopeCatalog
): Promise<void> {
	const rows = await listBudgetsRaw();
	if (findDuplicateActiveScope(rows, accountId, scope, exceptId, catalog)) {
		throw new Error(DUPLICATE_BUDGET_SCOPE);
	}
}

export async function createPocketBudget(input: CreatePocketBudgetInput): Promise<PocketBudget> {
	const pocket = await getAccount(input.accountId);
	if (!pocket) throw new Error('Pocket not found');
	const limitMinor = parseAmountInput(input.limitRaw);
	assertBudgetLimit(limitMinor);
	const today = todayOccurredOn();
	const startOn = input.startOn?.trim() ? input.startOn.trim() : today;
	assertBudgetStartOn(startOn, today);
	const catalog = await loadBudgetCatalog();
	const scope = resolveScope(input, catalog);
	await assertUniqueScope(input.accountId, scope, null, catalog);
	const plain: PocketBudget = {
		id: createId(),
		accountId: input.accountId,
		appliesTo: scope.appliesTo,
		categoryIds: scope.categoryIds,
		groupIds: scope.groupIds,
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
	groupIds?: string[];
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
	const catalog = await loadBudgetCatalog();
	const storedScope = hydrateBudgetScope(stored, catalog);
	const scope =
		input.selectedIds && input.allSelectableIds
			? resolveScope(input, catalog)
			: input.appliesTo !== undefined || input.categoryIds !== undefined || input.groupIds !== undefined
				? resolveScope(
						{
							appliesTo: input.appliesTo ?? storedScope.appliesTo,
							categoryIds: input.categoryIds ?? storedScope.categoryIds,
							groupIds: input.groupIds ?? storedScope.groupIds
						},
						catalog
					)
				: {
						appliesTo: storedScope.appliesTo,
						categoryIds: storedScope.categoryIds,
						groupIds: storedScope.groupIds
					};
	await assertUniqueScope(stored.accountId, scope, stored.id, catalog);
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
	const catalog = await loadBudgetCatalog();
	const next: PocketBudget = {
		...hydrateBudgetScope(stored, catalog),
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
