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

export type ActivityDateSort = 'createdAt-desc' | 'occurredOn-desc' | 'occurredOn-asc';

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

export function nextActivityDateSort(current: ActivityDateSort): ActivityDateSort {
	if (current === 'createdAt-desc') return 'occurredOn-desc';
	if (current === 'occurredOn-desc') return 'occurredOn-asc';
	return 'createdAt-desc';
}

/** Sort Activity rows for the Date column cycle. */
export function sortTransactionsByDate(
	transactions: LedgerTransaction[],
	mode: ActivityDateSort
): LedgerTransaction[] {
	const rows = [...transactions];
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
