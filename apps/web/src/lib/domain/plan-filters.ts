import {
	ADMIN_FEE_CATEGORY_ID,
	amountDigitsMatch,
	UNCATEGORIZED_FILTER,
	type ActivityTxType
} from '$lib/domain/activity-filters';
import {
	pocketSortIndex,
	type LedgerPlan,
	type PocketSortHint
} from '$lib/domain/plan';

export type PlanFilterCriteria = {
	search: string;
	/** Empty = all types. */
	types: readonly ActivityTxType[];
	/** Empty = all categories. Sentinels: Uncategorized / Admin Fee. */
	categoryIds: readonly string[];
	/** Empty = all pockets. Transfer matches if source or dest is selected. */
	pocketIds: readonly string[];
};

export const DEFAULT_PLAN_FILTERS: PlanFilterCriteria = {
	search: '',
	types: [],
	categoryIds: [],
	pocketIds: []
};

export function normalizePlanFilters(criteria: Partial<PlanFilterCriteria>): PlanFilterCriteria {
	return {
		search: criteria.search ?? '',
		types: [...(criteria.types ?? [])],
		categoryIds: [...(criteria.categoryIds ?? [])],
		pocketIds: [...(criteria.pocketIds ?? [])]
	};
}

export function isDefaultPlanFilters(criteria: Partial<PlanFilterCriteria>): boolean {
	const n = normalizePlanFilters(criteria);
	return (
		n.search === '' &&
		n.types.length === 0 &&
		n.categoryIds.length === 0 &&
		n.pocketIds.length === 0
	);
}

export function countPlanAdvancedFilters(criteria: Partial<PlanFilterCriteria>): number {
	const n = normalizePlanFilters(criteria);
	let count = 0;
	if (n.types.length > 0) count++;
	if (n.categoryIds.length > 0) count++;
	if (n.pocketIds.length > 0) count++;
	return count;
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((id, i) => id === b[i]);
}

export function planFiltersEqual(a: PlanFilterCriteria, b: PlanFilterCriteria): boolean {
	if (a.search !== b.search) return false;
	if (!sameIds(a.types, b.types)) return false;
	if (!sameIds(a.categoryIds, b.categoryIds)) return false;
	return sameIds(a.pocketIds, b.pocketIds);
}

/** Non-empty user category ids on active Plans (Spec 244). */
export function usedPlanCategoryIds(plans: readonly LedgerPlan[]): Set<string> {
	const ids = new Set<string>();
	for (const plan of plans) {
		const id = plan.categoryId?.trim() ?? '';
		if (id && id !== ADMIN_FEE_CATEGORY_ID) ids.add(id);
	}
	return ids;
}

/** True when some plan has a null/empty categoryId. */
export function hasUncategorizedPlanRow(plans: readonly LedgerPlan[]): boolean {
	return plans.some((plan) => !(plan.categoryId?.trim() ?? ''));
}

/** True when some plan is Admin Fee (sentinel category or a positive fee). */
export function hasAdminFeePlanRow(plans: readonly LedgerPlan[]): boolean {
	return plans.some(
		(plan) =>
			plan.categoryId === ADMIN_FEE_CATEGORY_ID ||
			((plan.type === 'transfer' || plan.type === 'expense') && (plan.feeMinor ?? 0) > 0)
	);
}

/** True when Plans Filters should show Category (Spec 244). */
export function shouldShowPlanCategoryFilter(plans: readonly LedgerPlan[]): boolean {
	return usedPlanCategoryIds(plans).size > 0 || hasAdminFeePlanRow(plans);
}

function matchesPlanCategories(plan: LedgerPlan, categoryIds: readonly string[]): boolean {
	if (categoryIds.length === 0) return true;
	return categoryIds.some((id) => {
		if (id === ADMIN_FEE_CATEGORY_ID) {
			return (
				plan.categoryId === ADMIN_FEE_CATEGORY_ID ||
				((plan.type === 'transfer' || plan.type === 'expense') && (plan.feeMinor ?? 0) > 0)
			);
		}
		if (id === UNCATEGORIZED_FILTER) return plan.categoryId == null;
		return plan.categoryId === id;
	});
}

export function filterPlans(
	plans: readonly LedgerPlan[],
	criteria: Partial<PlanFilterCriteria>
): LedgerPlan[] {
	const filters = normalizePlanFilters(criteria);
	const search = filters.search.trim();
	return plans.filter((plan) => {
		if (filters.types.length > 0 && !filters.types.includes(plan.type)) return false;
		if (!matchesPlanCategories(plan, filters.categoryIds)) return false;
		if (filters.pocketIds.length > 0) {
			const hit =
				filters.pocketIds.includes(plan.accountId) ||
				(plan.counterAccountId != null && filters.pocketIds.includes(plan.counterAccountId));
			if (!hit) return false;
		}
		if (search) {
			const q = search.toLowerCase();
			const descriptionHit = plan.description.toLowerCase().includes(q);
			const noteHit = plan.note.toLowerCase().includes(q);
			const amountHit = amountDigitsMatch(plan.amountMinor, search);
			if (!descriptionHit && !noteHit && !amountHit) return false;
		}
		return true;
	});
}

/** Soonest `dueOn` first; within a day: Main, then sortOrder, then createdAt desc, then id. */
export function sortPlansForList(
	plans: readonly LedgerPlan[],
	pockets: readonly PocketSortHint[]
): LedgerPlan[] {
	return [...plans].sort((a, b) => {
		if (a.dueOn !== b.dueOn) return a.dueOn < b.dueOn ? -1 : 1;
		const pa = pocketSortIndex(a.accountId, pockets);
		const pb = pocketSortIndex(b.accountId, pockets);
		if (pa !== pb) return pa - pb;
		if (a.createdAt !== b.createdAt) return a.createdAt > b.createdAt ? -1 : 1;
		return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
	});
}

export type PlanListSection =
	| { kind: 'header'; dueOn: string }
	| { kind: 'row'; plan: LedgerPlan };

export function planListSections(plans: readonly LedgerPlan[]): PlanListSection[] {
	const sections: PlanListSection[] = [];
	let last: string | null = null;
	for (const plan of plans) {
		if (plan.dueOn !== last) {
			sections.push({ kind: 'header', dueOn: plan.dueOn });
			last = plan.dueOn;
		}
		sections.push({ kind: 'row', plan });
	}
	return sections;
}
