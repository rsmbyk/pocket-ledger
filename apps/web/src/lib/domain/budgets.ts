import { isVoided, type LedgerTransaction } from './transaction';
import { goalBarFillCss } from './goals';
import { isValidOccurredOn } from './transaction-rules';

export type BudgetAppliesTo = 'pocket' | 'categories';
export type BudgetPeriod = 'ongoing' | 'monthly';

export type PocketBudget = {
	id: string;
	accountId: string;
	appliesTo: BudgetAppliesTo;
	categoryIds: string[];
	groupIds: string[];
	limitMinor: number;
	hardLimit: boolean;
	period: BudgetPeriod;
	startOn: string;
	createdAt: string;
	cancelledAt: string | null;
	deletedAt: string | null;
};

export type BudgetTx = Pick<
	LedgerTransaction,
	| 'id'
	| 'type'
	| 'accountId'
	| 'counterAccountId'
	| 'amountMinor'
	| 'feeMinor'
	| 'categoryId'
	| 'occurredOn'
	| 'voidedAt'
>;

export type BudgetCategoryRef = {
	id: string;
	name: string;
	groupId: string;
};

export type BudgetGroupRef = {
	id: string;
	name: string;
	kind: 'income' | 'expense';
};

export type GroupSelectionState = 'none' | 'some' | 'all';

export type BudgetScopeCatalog = {
	groups: readonly BudgetGroupRef[];
	categories: readonly BudgetCategoryRef[];
};

export type ResolvedBudgetScope = {
	appliesTo: BudgetAppliesTo;
	groupIds: string[];
	categoryIds: string[];
};

export const DUPLICATE_BUDGET_SCOPE = 'A budget with this scope already exists on this pocket.';

export function assertBudgetLimit(limitMinor: number): void {
	if (!Number.isInteger(limitMinor) || limitMinor <= 0) {
		throw new Error('Limit must be a positive whole number');
	}
}

export function assertBudgetStartOn(startOn: string, today: string): void {
	if (!isValidOccurredOn(startOn)) {
		throw new Error('Start date must be a valid date (YYYY-MM-DD)');
	}
	if (startOn > today) {
		throw new Error('Start date cannot be later than today');
	}
}

export function monthStartOn(isoDay: string): string {
	return `${isoDay.slice(0, 7)}-01`;
}

export function isActiveBudget(
	budget: Pick<PocketBudget, 'cancelledAt' | 'deletedAt'>
): boolean {
	return budget.cancelledAt == null && budget.deletedAt == null;
}

export function effectiveStartOn(budget: Pick<PocketBudget, 'period' | 'startOn'>, today: string): string {
	if (budget.period !== 'monthly') return budget.startOn;
	const monthStart = monthStartOn(today);
	return budget.startOn > monthStart ? budget.startOn : monthStart;
}

export function budgetProgressPercent(limitMinor: number, usedMinor: number): number {
	if (limitMinor <= 0) return 0;
	return Math.round((Math.max(0, usedMinor) / limitMinor) * 100);
}

export function budgetBarWidthPercent(percent: number): number {
	return Math.min(100, Math.max(0, percent));
}

/** Inverse of the goal bar: green empty, yellow at 30% used, red at 100%. */
export function budgetBarFillCss(percent: number): string {
	return goalBarFillCss(100 - budgetBarWidthPercent(percent));
}

function inWindow(occurredOn: string, startOn: string, today: string): boolean {
	return occurredOn >= startOn && occurredOn <= today;
}

function storedFee(tx: Pick<BudgetTx, 'feeMinor'>): number {
	const fee = tx.feeMinor ?? 0;
	return typeof fee === 'number' && Number.isInteger(fee) && fee >= 0 ? fee : 0;
}

export function txContribution(
	budget: PocketBudget,
	tx: BudgetTx,
	today: string,
	categories: readonly BudgetCategoryRef[] = []
): number {
	if (isVoided(tx)) return 0;
	if (!inWindow(tx.occurredOn, effectiveStartOn(budget, today), today)) return 0;

	if (budget.appliesTo === 'pocket') {
		if (tx.type === 'expense' && tx.accountId === budget.accountId) {
			return tx.amountMinor + storedFee(tx);
		}
		if (tx.type === 'transfer' && tx.accountId === budget.accountId) {
			return tx.amountMinor + storedFee(tx);
		}
		return 0;
	}

	if (tx.type !== 'expense' || tx.accountId !== budget.accountId) return 0;
	if (!categoryMatchesBudget(budget, tx.categoryId, categories)) return 0;
	return tx.amountMinor;
}

function categoryMatchesBudget(
	budget: PocketBudget,
	categoryId: string | null,
	categories: readonly BudgetCategoryRef[]
): boolean {
	if (!categoryId) return false;
	if (budget.categoryIds.includes(categoryId)) return true;
	const cat = categories.find((c) => c.id === categoryId);
	return Boolean(cat && (budget.groupIds ?? []).includes(cat.groupId));
}

export function budgetUsedMinor(
	budget: PocketBudget,
	txs: BudgetTx[],
	today: string,
	exceptId?: string | null,
	catalog: BudgetScopeCatalog | readonly BudgetCategoryRef[] = []
): number {
	const resolved = resolveCatalog(catalog);
	const scoped = hydrateBudgetScope(budget, resolved);
	let used = 0;
	for (const row of txs) {
		if (exceptId && row.id === exceptId) continue;
		used += txContribution(scoped, row, today, resolved.categories);
	}
	return used;
}

export function budgetWouldExceed(
	budget: PocketBudget,
	txs: BudgetTx[],
	proposed: BudgetTx,
	today: string,
	replacingId?: string | null,
	catalog: BudgetScopeCatalog | readonly BudgetCategoryRef[] = []
): boolean {
	const used = budgetUsedMinor(budget, txs, today, replacingId, catalog);
	const resolved = resolveCatalog(catalog);
	const scoped = hydrateBudgetScope(budget, resolved);
	return used + txContribution(scoped, proposed, today, resolved.categories) > budget.limitMinor;
}

export function exceededBudgets(
	budgets: PocketBudget[],
	txs: BudgetTx[],
	proposed: BudgetTx,
	today: string,
	replacingId?: string | null,
	catalog: BudgetScopeCatalog | readonly BudgetCategoryRef[] = []
): PocketBudget[] {
	return budgets.filter(
		(b) => isActiveBudget(b) && budgetWouldExceed(b, txs, proposed, today, replacingId, catalog)
	);
}

export function sortActiveBudgets<T extends PocketBudget>(
	budgets: T[],
	usedById: Record<string, number>,
	today: string
): T[] {
	return budgets
		.filter((b) => isActiveBudget(b))
		.slice()
		.sort((a, b) => {
			if (a.appliesTo !== b.appliesTo) return a.appliesTo === 'pocket' ? -1 : 1;
			const byPercent =
				budgetProgressPercent(b.limitMinor, usedById[b.id] ?? 0) -
				budgetProgressPercent(a.limitMinor, usedById[a.id] ?? 0);
			if (byPercent !== 0) return byPercent;
			if (a.limitMinor !== b.limitMinor) return b.limitMinor - a.limitMinor;
			const byStart = effectiveStartOn(a, today).localeCompare(effectiveStartOn(b, today));
			if (byStart !== 0) return byStart;
			if (a.period !== b.period) return a.period === 'monthly' ? -1 : 1;
			if (a.hardLimit !== b.hardLimit) return a.hardLimit ? -1 : 1;
			const byCreated = a.createdAt.localeCompare(b.createdAt);
			if (byCreated !== 0) return byCreated;
			return a.id.localeCompare(b.id);
		});
}

export function groupSelectionState(
	groupIds: readonly string[],
	selected: ReadonlySet<string>
): GroupSelectionState {
	if (groupIds.length === 0) return 'none';
	let hits = 0;
	for (const id of groupIds) {
		if (selected.has(id)) hits += 1;
	}
	if (hits === 0) return 'none';
	if (hits === groupIds.length) return 'all';
	return 'some';
}

export function withGroupToggled(
	groupIds: readonly string[],
	selected: ReadonlySet<string>,
	check: boolean
): string[] {
	const next = new Set(selected);
	for (const id of groupIds) {
		if (check) next.add(id);
		else next.delete(id);
	}
	return [...next];
}

export function isAllSelectable(selected: ReadonlySet<string>, allIds: readonly string[]): boolean {
	return allIds.length > 0 && allIds.every((id) => selected.has(id));
}

export function resolveAppliesTo(
	selectedIds: readonly string[],
	allSelectableIds: readonly string[],
	catalog: BudgetScopeCatalog = { groups: [], categories: [] }
): ResolvedBudgetScope {
	if (isAllSelectable(new Set(selectedIds), allSelectableIds)) {
		return { appliesTo: 'pocket', groupIds: [], categoryIds: [] };
	}
	const selected = new Set(selectedIds);
	const groupIds: string[] = [];
	const covered = new Set<string>();
	const allow = new Set(allSelectableIds);
	for (const group of catalog.groups) {
		if (group.kind !== 'expense') continue;
		const members = catalog.categories
			.filter((c) => c.groupId === group.id && allow.has(c.id))
			.map((c) => c.id);
		if (members.length === 0) continue;
		if (members.every((id) => selected.has(id))) {
			groupIds.push(group.id);
			for (const id of members) covered.add(id);
		}
	}
	return {
		appliesTo: 'categories',
		groupIds,
		categoryIds: selectedIds.filter((id) => !covered.has(id))
	};
}

export function budgetScopeKey(
	budget: Pick<PocketBudget, 'appliesTo' | 'groupIds' | 'categoryIds'>
): string {
	if (budget.appliesTo === 'pocket') return 'pocket';
	const groups = [...(budget.groupIds ?? [])].sort().join(',');
	const cats = [...budget.categoryIds].sort().join(',');
	return `g:${groups}|c:${cats}`;
}

export function hydrateBudgetScope(budget: PocketBudget, catalog: BudgetScopeCatalog): PocketBudget {
	if (budget.appliesTo === 'pocket') {
		return { ...budget, groupIds: [], categoryIds: [] };
	}
	const groupIds = new Set(budget.groupIds ?? []);
	const leftover = new Set(budget.categoryIds);
	const groups =
		catalog.groups.length > 0
			? catalog.groups
			: uniqueGroupsFromCategories(catalog.categories);
	for (const group of groups) {
		if (group.kind && group.kind !== 'expense') continue;
		const members = catalog.categories.filter((c) => c.groupId === group.id);
		if (members.length === 0) continue;
		if (members.every((m) => leftover.has(m.id))) {
			groupIds.add(group.id);
			for (const m of members) leftover.delete(m.id);
		}
	}
	return { ...budget, groupIds: [...groupIds], categoryIds: [...leftover] };
}

export function firstActiveBudgetPerScope<T extends PocketBudget>(sorted: T[]): T[] {
	const seen = new Set<string>();
	const out: T[] = [];
	for (const row of sorted) {
		const key = budgetScopeKey(row);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(row);
	}
	return out;
}

export function findDuplicateActiveScope(
	budgets: readonly PocketBudget[],
	accountId: string,
	scope: Pick<PocketBudget, 'appliesTo' | 'groupIds' | 'categoryIds'>,
	exceptId: string | null,
	catalog: BudgetScopeCatalog
): PocketBudget | null {
	const key = budgetScopeKey(scope);
	for (const row of budgets) {
		if (row.accountId !== accountId) continue;
		if (!isActiveBudget(row)) continue;
		if (exceptId && row.id === exceptId) continue;
		if (budgetScopeKey(hydrateBudgetScope(row, catalog)) === key) return row;
	}
	return null;
}

function resolveCatalog(
	catalog: BudgetScopeCatalog | readonly BudgetCategoryRef[]
): BudgetScopeCatalog {
	if ('categories' in catalog && 'groups' in catalog && !Array.isArray(catalog)) return catalog;
	return { groups: [], categories: catalog as readonly BudgetCategoryRef[] };
}

function uniqueGroupsFromCategories(categories: readonly BudgetCategoryRef[]): BudgetGroupRef[] {
	const seen = new Set<string>();
	const groups: BudgetGroupRef[] = [];
	for (const cat of categories) {
		if (seen.has(cat.groupId)) continue;
		seen.add(cat.groupId);
		groups.push({ id: cat.groupId, name: cat.groupId, kind: 'expense' });
	}
	return groups;
}

export function normalizeStoredBudget(raw: unknown): PocketBudget | null {
	if (!raw || typeof raw !== 'object') return null;
	const row = raw as Record<string, unknown>;
	const id = typeof row.id === 'string' ? row.id : '';
	const accountId = typeof row.accountId === 'string' ? row.accountId : '';
	if (!id || !accountId) return null;
	const appliesTo = row.appliesTo === 'pocket' ? 'pocket' : 'categories';
	const categoryIds = Array.isArray(row.categoryIds)
		? row.categoryIds.filter((id): id is string => typeof id === 'string')
		: [];
	const groupIds = Array.isArray(row.groupIds)
		? row.groupIds.filter((id): id is string => typeof id === 'string')
		: [];
	return {
		id,
		accountId,
		appliesTo,
		categoryIds: appliesTo === 'pocket' ? [] : categoryIds,
		groupIds: appliesTo === 'pocket' ? [] : groupIds,
		limitMinor: typeof row.limitMinor === 'number' ? row.limitMinor : 0,
		hardLimit: row.hardLimit === true,
		period: row.period === 'monthly' ? 'monthly' : 'ongoing',
		startOn: typeof row.startOn === 'string' ? row.startOn : '',
		createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
		cancelledAt: typeof row.cancelledAt === 'string' ? row.cancelledAt : null,
		deletedAt: typeof row.deletedAt === 'string' ? row.deletedAt : null
	};
}

export function formatBudgetAppliesTitle(
	budget: Pick<PocketBudget, 'appliesTo' | 'categoryIds' | 'groupIds'>,
	pocketName: string,
	categories: BudgetCategoryRef[],
	groups: BudgetGroupRef[]
): string {
	if (budget.appliesTo === 'pocket') return pocketName;
	const sticky = new Set(budget.groupIds ?? []);
	const selected = new Set(budget.categoryIds);
	const parts: string[] = [];
	for (const group of groups) {
		if (group.kind !== 'expense') continue;
		if (sticky.has(group.id)) {
			parts.push(group.name);
			continue;
		}
		const inGroup = categories.filter((c) => c.groupId === group.id);
		if (inGroup.length === 0) continue;
		const picked = inGroup.filter((c) => selected.has(c.id));
		if (picked.length === 0) continue;
		if (picked.length === inGroup.length) parts.push(group.name);
		else parts.push(...picked.map((c) => c.name));
	}
	const seen = new Set(parts);
	for (const id of budget.categoryIds) {
		if (categories.some((c) => c.id === id)) continue;
		if (!seen.has(id)) {
			parts.push(id);
			seen.add(id);
		}
	}
	return parts.join(', ');
}
