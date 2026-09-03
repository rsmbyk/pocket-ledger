import type { CategoryKind } from './default-category-catalog';
import type { LedgerTransaction, TransactionType } from './transaction';
import { isVoided } from './transaction';

/** Sentinel for Activity filter: only transactions with null categoryId. */
export const UNCATEGORIZED_FILTER = '__uncategorized__';

/** Sentinel for Activity filter / month bucket: transfer admin fees (Spec 106). */
export const ADMIN_FEE_CATEGORY_ID = '__admin_fee__';

export const ADMIN_FEE_LABEL = 'Admin Fee';

/** A checked transaction type in the Filters sheet. Empty list = all types. */
export type ActivityTxType = 'income' | 'expense' | 'transfer';

/** @deprecated Session v1 single type; prefer `types`. */
export type ActivityTypeFilter = 'all' | ActivityTxType;

/** Map of user category id → kind for filter option compatibility (Spec 107). */
export type CategoryKindLookup = Record<string, CategoryKind>;

export type ActivityFilterCriteria = {
	search: string;
	/** Empty = all types. */
	types: readonly ActivityTxType[];
	/** Empty = all categories. Sentinels: `UNCATEGORIZED_FILTER`, `ADMIN_FEE_CATEGORY_ID`. */
	categoryIds: readonly string[];
	/** Empty = all pockets. Transfer matches if source or dest is selected. */
	pocketIds: readonly string[];
	startDate: string;
	endDate: string;
	/** When false (default), voided rows are hidden. */
	showVoided: boolean;
};

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilterCriteria = {
	search: '',
	types: [],
	categoryIds: [],
	pocketIds: [],
	startDate: '',
	endDate: '',
	showVoided: false
};

/** Target rows per chunked reveal bundle (Spec 069); always whole-day chunks (134). */
export const ACTIVITY_REVEAL_TARGET = 40;

export type ActivityDateGroup = {
	occurredOn: string;
	transactions: LedgerTransaction[];
};

export type ActivityListSection =
	| { kind: 'header'; occurredOn: string }
	| { kind: 'row'; tx: LedgerTransaction };

export function isCategoryFilterDisabled(
	types: readonly ActivityTxType[] | ActivityTypeFilter
): boolean {
	if (typeof types === 'string') return types === 'transfer';
	return types.length === 1 && types[0] === 'transfer';
}

export function categoryKindsForTypes(
	types: readonly ActivityTxType[] | ActivityTypeFilter
): CategoryKind[] | 'all' {
	if (typeof types === 'string') {
		if (types === 'income') return ['income'];
		if (types === 'expense') return ['expense'];
		return 'all';
	}
	const kinds = new Set<CategoryKind>();
	for (const t of types) {
		if (t === 'income') kinds.add('income');
		if (t === 'expense') kinds.add('expense');
	}
	if (kinds.size === 0) return 'all';
	return [...kinds];
}

/**
 * Whether a draft categoryId is valid for the selected type filter.
 * Empty / All is always compatible except Transfer still forces All via resolve.
 */
export function isCategoryFilterCompatible(
	categoryId: string | null | undefined,
	types: readonly ActivityTxType[] | ActivityTypeFilter,
	categoryKinds: CategoryKindLookup
): boolean {
	const id = (categoryId ?? '').trim();
	if (!id) return true;
	if (isCategoryFilterDisabled(types)) return false;
	const allowed = categoryKindsForTypes(types);
	if (id === ADMIN_FEE_CATEGORY_ID) return allowed === 'all';
	if (id === UNCATEGORIZED_FILTER) return true;
	const kind = categoryKinds[id];
	if (!kind) return allowed === 'all';
	if (allowed === 'all') return true;
	return allowed.includes(kind);
}

/** Returns categoryId if compatible with type; otherwise All (`''`). */
export function resolveCategoryIdForType(
	categoryId: string | null | undefined,
	types: readonly ActivityTxType[] | ActivityTypeFilter,
	categoryKinds: CategoryKindLookup
): string {
	const id = (categoryId ?? '').trim();
	if (isCategoryFilterCompatible(id, types, categoryKinds)) return id;
	return '';
}

export function resolveCategoryIdsForTypes(
	selected: readonly string[],
	types: readonly ActivityTxType[] | ActivityTypeFilter,
	kindsById: CategoryKindLookup
): string[] {
	if (isCategoryFilterDisabled(types)) return [];
	return selected.filter((id) => isCategoryFilterCompatible(id, types, kindsById));
}

/** Non-empty user category ids on the ledger, including voided rows (Spec 132). */
export function usedCategoryIds(transactions: LedgerTransaction[]): Set<string> {
	const ids = new Set<string>();
	for (const tx of transactions) {
		const id = tx.categoryId?.trim() ?? '';
		if (id) ids.add(id);
	}
	return ids;
}

/** True when Activity should show the Category filter (Spec 132). */
export function shouldShowActivityCategoryFilter(transactions: LedgerTransaction[]): boolean {
	return usedCategoryIds(transactions).size > 0;
}

/** True when some ledger row has a null/empty categoryId (Uncategorized / transfers). */
export function hasUncategorizedLedgerRow(transactions: LedgerTransaction[]): boolean {
	return transactions.some((tx) => !(tx.categoryId?.trim() ?? ''));
}

/** True when some transfer has a positive admin fee. */
export function hasAdminFeeLedgerRow(transactions: LedgerTransaction[]): boolean {
	return transactions.some((tx) => tx.type === 'transfer' && (tx.feeMinor ?? 0) > 0);
}

/** Digits-only form of a search query for loose amount matching. */
export function digitsOnly(value: string): string {
	return value.replace(/\D/g, '');
}

/** True when amountMinor matches a loose numeric query (ignores separators). */
export function amountDigitsMatch(amountMinor: number, query: string): boolean {
	const q = digitsOnly(query);
	if (!q) return false;
	return String(amountMinor).includes(q) || q === String(amountMinor);
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((id, i) => id === b[i]);
}

export function normalizeActivityFilters(
	criteria: Partial<ActivityFilterCriteria>
): ActivityFilterCriteria {
	return {
		search: criteria.search ?? '',
		types: [...(criteria.types ?? [])],
		categoryIds: [...(criteria.categoryIds ?? [])],
		pocketIds: [...(criteria.pocketIds ?? [])],
		startDate: criteria.startDate ?? '',
		endDate: criteria.endDate ?? '',
		showVoided: criteria.showVoided ?? false
	};
}

export function isDefaultActivityFilters(criteria: Partial<ActivityFilterCriteria>): boolean {
	const n = normalizeActivityFilters(criteria);
	return (
		n.types.length === 0 &&
		n.categoryIds.length === 0 &&
		n.pocketIds.length === 0 &&
		n.search.trim() === '' &&
		n.showVoided === false
	);
}

export function activityFiltersEqual(
	a: Partial<ActivityFilterCriteria>,
	b: Partial<ActivityFilterCriteria>,
	options?: { ignoreSearch?: boolean; ignoreDates?: boolean }
): boolean {
	const left = normalizeActivityFilters(a);
	const right = normalizeActivityFilters(b);
	const ignoreSearch = options?.ignoreSearch ?? false;
	const ignoreDates = options?.ignoreDates ?? false;
	return (
		sameIds(left.types, right.types) &&
		sameIds(left.categoryIds, right.categoryIds) &&
		sameIds(left.pocketIds, right.pocketIds) &&
		(ignoreDates || left.startDate === right.startDate) &&
		(ignoreDates || left.endDate === right.endDate) &&
		(ignoreSearch || left.search.trim() === right.search.trim()) &&
		left.showVoided === right.showVoided
	);
}

function matchesType(tx: LedgerTransaction, types: readonly ActivityTxType[]): boolean {
	if (types.length === 0) return true;
	return types.includes(tx.type as ActivityTxType);
}

function matchesCategories(tx: LedgerTransaction, categoryIds: readonly string[]): boolean {
	if (categoryIds.length === 0) return true;
	return categoryIds.some((id) => {
		if (id === ADMIN_FEE_CATEGORY_ID) {
			return tx.type === 'transfer' && (tx.feeMinor ?? 0) > 0;
		}
		if (id === UNCATEGORIZED_FILTER) return tx.categoryId == null;
		return tx.categoryId === id;
	});
}

function matchesPockets(tx: LedgerTransaction, pocketIds: readonly string[]): boolean {
	if (pocketIds.length === 0) return true;
	const set = new Set(pocketIds);
	if (tx.type === 'transfer') {
		return set.has(tx.accountId) || (tx.counterAccountId != null && set.has(tx.counterAccountId));
	}
	return set.has(tx.accountId);
}

/**
 * Filter transactions for Activity (AND across criteria; OR within multi-select fields).
 * Empty/All criteria are ignored. Dates empty = no date constraint (header range always sets them in UI).
 */
export function filterTransactions(
	transactions: LedgerTransaction[],
	criteria: Partial<ActivityFilterCriteria>
): LedgerTransaction[] {
	const n = normalizeActivityFilters(criteria);
	const search = n.search.trim() || null;
	const start = n.startDate.trim() || null;
	const end = n.endDate.trim() || null;

	return transactions.filter((tx) => {
		if (!n.showVoided && isVoided(tx)) return false;
		if (!matchesType(tx, n.types)) return false;
		if (!matchesCategories(tx, n.categoryIds)) return false;
		if (!matchesPockets(tx, n.pocketIds)) return false;
		if (start && tx.occurredOn < start) return false;
		if (end && tx.occurredOn > end) return false;
		if (search) {
			const noteHit = tx.note.toLowerCase().includes(search.toLowerCase());
			const amountHit = amountDigitsMatch(tx.amountMinor, search);
			if (!noteHit && !amountHit) return false;
		}
		return true;
	});
}

/** Newest calendar day first; within a day newest `createdAt`, then `id`. */
export function sortTransactions(txs: LedgerTransaction[]): LedgerTransaction[] {
	return [...txs].sort((a, b) => {
		if (a.occurredOn !== b.occurredOn) return a.occurredOn < b.occurredOn ? 1 : -1;
		if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
		return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
	});
}

/** Newest active txs that touch `pocketId`, capped (spec 148). */
export function latestPocketTransactions(
	txs: LedgerTransaction[],
	pocketId: string,
	limit = 10
): LedgerTransaction[] {
	return sortTransactions(
		filterTransactions(txs, { pocketIds: [pocketId], showVoided: false })
	).slice(0, limit);
}

export function groupActivityByOccurredOn(txs: LedgerTransaction[]): ActivityDateGroup[] {
	const order: string[] = [];
	const map = new Map<string, LedgerTransaction[]>();
	for (const tx of txs) {
		const list = map.get(tx.occurredOn);
		if (list) {
			list.push(tx);
		} else {
			order.push(tx.occurredOn);
			map.set(tx.occurredOn, [tx]);
		}
	}
	return order.map((occurredOn) => ({
		occurredOn,
		transactions: map.get(occurredOn) ?? []
	}));
}

export function activityListSections(txs: LedgerTransaction[]): ActivityListSection[] {
	const out: ActivityListSection[] = [];
	for (const group of groupActivityByOccurredOn(txs)) {
		out.push({ kind: 'header', occurredOn: group.occurredOn });
		for (const tx of group.transactions) {
			out.push({ kind: 'row', tx });
		}
	}
	return out;
}

export function initialRevealEndIndex(
	sorted: LedgerTransaction[],
	target = ACTIVITY_REVEAL_TARGET
): number {
	return nextRevealEndIndex(sorted, 0, target);
}

export function nextRevealEndIndex(
	sorted: LedgerTransaction[],
	currentEnd: number,
	target = ACTIVITY_REVEAL_TARGET
): number {
	if (currentEnd >= sorted.length) return sorted.length;
	if (currentEnd === 0) {
		let i = 0;
		while (i < sorted.length && i < target) {
			const day = sorted[i]!.occurredOn;
			while (i < sorted.length && sorted[i]!.occurredOn === day) i++;
		}
		return i;
	}
	const day = sorted[currentEnd]!.occurredOn;
	let i = currentEnd;
	while (i < sorted.length && sorted[i]!.occurredOn === day) i++;
	return i;
}

export function typeLabel(t: string): string {
	if (t === 'income') return 'Income';
	if (t === 'expense') return 'Expense';
	if (t === 'transfer') return 'Transfer';
	return t;
}

export function filterTriggerSummary(
	selected: readonly string[],
	labels: (id: string) => string
): string {
	if (selected.length === 0) return 'All';
	if (selected.length === 1) return labels(selected[0]!);
	return `${selected.length} selected`;
}

export function countAdvancedFilters(criteria: Partial<ActivityFilterCriteria>): number {
	const n = normalizeActivityFilters(criteria);
	let count = 0;
	if (n.types.length > 0) count++;
	if (n.categoryIds.length > 0) count++;
	if (n.pocketIds.length > 0) count++;
	if (n.showVoided) count++;
	return count;
}

/** @deprecated Use `types` array. */
export function matchesTypeFilter(txType: TransactionType, filter: ActivityTypeFilter): boolean {
	if (filter === 'all') return true;
	return txType === filter;
}
