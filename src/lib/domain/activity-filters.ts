import type { LedgerTransaction } from '$lib/domain/transaction';
import { isVoided } from '$lib/domain/transaction';
import type { AddableTransactionType } from '$lib/domain/transaction-rules';
import { amountDigitsOnly } from '$lib/domain/transaction-rules';

/** Sentinel for Activity filter: only transactions with null categoryId. */
export const UNCATEGORIZED_FILTER = '__uncategorized__';

export type ActivityTypeFilter = 'all' | AddableTransactionType;

export type AmountCompareOp = 'none' | 'lt' | 'gt';

export type ActivityFilterCriteria = {
	type?: ActivityTypeFilter;
	/** Empty/omitted = All; `UNCATEGORIZED_FILTER` = null categoryId; else category id. */
	categoryId?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	search?: string | null;
	/** When true, exclude voided rows. */
	hideVoided?: boolean;
	amountOp?: AmountCompareOp;
	/** Digits / grouped amount string for lt/gt compare (minor units). */
	amountRaw?: string | null;
};

/** Activity list sort modes (Spec 064). */
export type ActivitySortMode =
	| 'createdAt-desc'
	| 'occurredOn-desc'
	| 'occurredOn-asc'
	| 'category';

/** @deprecated Prefer ActivitySortMode */
export type ActivityDateSort = Exclude<ActivitySortMode, 'category'>;

export type CategorySortMeta = {
	id: string;
	kind: 'income' | 'expense';
	sortOrder: number;
};

export const DEFAULT_ACTIVITY_SORT: ActivitySortMode = 'createdAt-desc';

export const DEFAULT_ACTIVITY_FILTERS: Required<
	Pick<
		ActivityFilterCriteria,
		| 'type'
		| 'categoryId'
		| 'startDate'
		| 'endDate'
		| 'search'
		| 'hideVoided'
		| 'amountOp'
		| 'amountRaw'
	>
> = {
	type: 'all',
	categoryId: '',
	startDate: '',
	endDate: '',
	search: '',
	hideVoided: false,
	amountOp: 'none',
	amountRaw: ''
};

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

function parseCompareAmount(raw: string | null | undefined): number | null {
	const digits = amountDigitsOnly(raw ?? '');
	if (!digits) return null;
	const value = Number(digits);
	if (!Number.isInteger(value) || value <= 0) return null;
	return value;
}

export function isDefaultActivityFilters(
	criteria: ActivityFilterCriteria
): boolean {
	const type = criteria.type ?? 'all';
	const categoryId = criteria.categoryId ?? '';
	const start = criteria.startDate?.trim() || '';
	const end = criteria.endDate?.trim() || '';
	const search = criteria.search?.trim() || '';
	const hideVoided = criteria.hideVoided ?? false;
	const amountOp = criteria.amountOp ?? 'none';
	const amountRaw = criteria.amountRaw?.trim() || '';
	return (
		type === DEFAULT_ACTIVITY_FILTERS.type &&
		(categoryId === '' || categoryId == null) &&
		start === '' &&
		end === '' &&
		search === '' &&
		hideVoided === false &&
		amountOp === 'none' &&
		amountRaw === ''
	);
}

/**
 * Filter transactions for Activity (AND across criteria).
 * Empty/All criteria are ignored.
 */
export function filterTransactions(
	transactions: LedgerTransaction[],
	criteria: ActivityFilterCriteria
): LedgerTransaction[] {
	const type = criteria.type ?? 'all';
	const categoryId = criteria.categoryId ?? null;
	const start = criteria.startDate?.trim() || null;
	const end = criteria.endDate?.trim() || null;
	const search = criteria.search?.trim() || null;
	const hideVoided = criteria.hideVoided ?? false;
	const amountOp = criteria.amountOp ?? 'none';
	const compareAmount = parseCompareAmount(criteria.amountRaw);

	return transactions.filter((tx) => {
		if (hideVoided && isVoided(tx)) return false;
		if (type !== 'all' && tx.type !== type) return false;
		if (categoryId === UNCATEGORIZED_FILTER) {
			if (tx.categoryId != null) return false;
		} else if (categoryId && tx.categoryId !== categoryId) {
			return false;
		}
		if (start && tx.occurredOn < start) return false;
		if (end && tx.occurredOn > end) return false;
		if (amountOp !== 'none' && compareAmount != null) {
			if (amountOp === 'lt' && !(tx.amountMinor < compareAmount)) return false;
			if (amountOp === 'gt' && !(tx.amountMinor > compareAmount)) return false;
		}
		if (search) {
			const noteHit = tx.note.toLowerCase().includes(search.toLowerCase());
			const amountHit = amountDigitsMatch(tx.amountMinor, search);
			if (!noteHit && !amountHit) return false;
		}
		return true;
	});
}

function categoryRank(
	categoryId: string | null,
	byId: Map<string, CategorySortMeta>
): number {
	if (categoryId == null) return Number.MAX_SAFE_INTEGER;
	const meta = byId.get(categoryId);
	if (!meta) return Number.MAX_SAFE_INTEGER - 1;
	const typeBias = meta.kind === 'income' ? 0 : 1_000_000;
	return typeBias + meta.sortOrder;
}

/** Sort Activity rows for the selected mode (Spec 064). */
export function sortTransactions(
	transactions: LedgerTransaction[],
	mode: ActivitySortMode,
	categories: CategorySortMeta[] = []
): LedgerTransaction[] {
	const rows = [...transactions];
	if (mode === 'category') {
		const byId = new Map(categories.map((c) => [c.id, c]));
		rows.sort((a, b) => {
			const byCat =
				categoryRank(a.categoryId, byId) - categoryRank(b.categoryId, byId);
			if (byCat !== 0) return byCat;
			const byCreated = b.createdAt.localeCompare(a.createdAt);
			if (byCreated !== 0) return byCreated;
			return a.id.localeCompare(b.id);
		});
		return rows;
	}

	rows.sort((a, b) => {
		if (mode === 'createdAt-desc') {
			const byCreated = b.createdAt.localeCompare(a.createdAt);
			if (byCreated !== 0) return byCreated;
		} else if (mode === 'occurredOn-desc') {
			const byDate = b.occurredOn.localeCompare(a.occurredOn);
			if (byDate !== 0) return byDate;
		} else {
			const byDate = a.occurredOn.localeCompare(b.occurredOn);
			if (byDate !== 0) return byDate;
		}
		return a.id.localeCompare(b.id);
	});
	return rows;
}

/** @deprecated Use sortTransactions */
export function sortTransactionsByDate(
	transactions: LedgerTransaction[],
	mode: ActivityDateSort
): LedgerTransaction[] {
	return sortTransactions(transactions, mode);
}
