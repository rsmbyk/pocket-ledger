import { amountDigitsMatch, type ActivityTxType } from '$lib/domain/activity-filters';
import {
	pocketSortIndex,
	type LedgerPlan,
	type PocketSortHint
} from '$lib/domain/plan';

export type PlanFilterCriteria = {
	search: string;
	/** Empty = all types. */
	types: readonly ActivityTxType[];
	/** Empty = all pockets. Transfer matches if source or dest is selected. */
	pocketIds: readonly string[];
};

export const DEFAULT_PLAN_FILTERS: PlanFilterCriteria = {
	search: '',
	types: [],
	pocketIds: []
};

export function normalizePlanFilters(criteria: Partial<PlanFilterCriteria>): PlanFilterCriteria {
	return {
		search: criteria.search ?? '',
		types: [...(criteria.types ?? [])],
		pocketIds: [...(criteria.pocketIds ?? [])]
	};
}

export function isDefaultPlanFilters(criteria: Partial<PlanFilterCriteria>): boolean {
	const n = normalizePlanFilters(criteria);
	return n.search === '' && n.types.length === 0 && n.pocketIds.length === 0;
}

export function countPlanAdvancedFilters(criteria: Partial<PlanFilterCriteria>): number {
	const n = normalizePlanFilters(criteria);
	let count = 0;
	if (n.types.length > 0) count++;
	if (n.pocketIds.length > 0) count++;
	return count;
}

export function planFiltersEqual(a: PlanFilterCriteria, b: PlanFilterCriteria): boolean {
	if (a.search !== b.search) return false;
	if (a.types.length !== b.types.length) return false;
	if (a.types.some((t, i) => t !== b.types[i])) return false;
	if (a.pocketIds.length !== b.pocketIds.length) return false;
	return a.pocketIds.every((id, i) => id === b.pocketIds[i]);
}

export function filterPlans(
	plans: readonly LedgerPlan[],
	criteria: Partial<PlanFilterCriteria>
): LedgerPlan[] {
	const filters = normalizePlanFilters(criteria);
	const search = filters.search.trim();
	return plans.filter((plan) => {
		if (filters.types.length > 0 && !filters.types.includes(plan.type)) return false;
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
