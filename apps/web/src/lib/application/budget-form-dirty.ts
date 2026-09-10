import { resolveAppliesTo, type BudgetAppliesTo, type BudgetPeriod, type BudgetScopeCatalog } from '$lib/domain/budgets';

export type BudgetFormLive = {
	selectedIds: string[];
	limitRaw: string;
	startOn: string;
	period: BudgetPeriod;
	hardLimit: boolean;
};

export type BudgetFormBaseline = {
	appliesTo: BudgetAppliesTo;
	categoryIds: string[];
	groupIds: string[];
	limitRaw: string;
	startOn: string;
	period: BudgetPeriod;
	hardLimit: boolean;
};

export const BUDGET_CREATE_BASELINE = (today: string): BudgetFormBaseline => ({
		appliesTo: 'categories',
		categoryIds: [],
		groupIds: [],
	limitRaw: '',
	startOn: today,
	period: 'ongoing',
	hardLimit: false
});

function sameIds(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	const as = [...a].sort();
	const bs = [...b].sort();
	return as.every((id, i) => id === bs[i]);
}

export function isBudgetFormDirty(
	live: BudgetFormLive,
	baseline: BudgetFormBaseline,
	allSelectableIds: readonly string[],
	catalog: BudgetScopeCatalog = { groups: [], categories: [] }
): boolean {
	const resolved = resolveAppliesTo(live.selectedIds, allSelectableIds, catalog);
	if (resolved.appliesTo !== baseline.appliesTo) return true;
	if (resolved.appliesTo === 'categories') {
		if (!sameIds(resolved.groupIds, baseline.groupIds ?? [])) return true;
		if (!sameIds(resolved.categoryIds, baseline.categoryIds)) return true;
	}
	return (
		live.limitRaw !== baseline.limitRaw ||
		live.startOn !== baseline.startOn ||
		live.period !== baseline.period ||
		live.hardLimit !== baseline.hardLimit
	);
}
