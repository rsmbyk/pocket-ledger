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

/** Activity list sort modes (Specs 064 / 067). */
export type ActivitySortMode = 'createdAt-desc' | 'occurredOn-desc' | 'occurredOn-asc';

/** @deprecated Prefer ActivitySortMode */
export type ActivityDateSort = ActivitySortMode;

export const DEFAULT_ACTIVITY_SORT: ActivitySortMode = 'createdAt-desc';

/** Target rows per chunked reveal bundle (Spec 069). */
export const ACTIVITY_REVEAL_TARGET = 40;

export type ActivityDateGroup = {
	occurredOn: string;
	transactions: LedgerTransaction[];
};

export type ActivityListSection =
	| { kind: 'header'; occurredOn: string }
	| { kind: 'row'; tx: LedgerTransaction };

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

export function isDateActivitySort(mode: ActivitySortMode): boolean {
	return mode === 'occurredOn-desc' || mode === 'occurredOn-asc';
}

/** Sort Activity rows for the selected mode. */
export function sortTransactions(
	transactions: LedgerTransaction[],
	mode: ActivitySortMode
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

/** @deprecated Use sortTransactions */
export function sortTransactionsByDate(
	transactions: LedgerTransaction[],
	mode: ActivityDateSort
): LedgerTransaction[] {
	return sortTransactions(transactions, mode);
}

/**
 * Build date groups from a sorted list (Spec 068).
 * Only for date sort modes; Default returns a single flat section of rows.
 */
export function groupActivityByOccurredOn(
	sorted: LedgerTransaction[],
	mode: ActivitySortMode
): ActivityDateGroup[] {
	if (!isDateActivitySort(mode) || sorted.length === 0) {
		return sorted.length === 0 ? [] : [{ occurredOn: '', transactions: sorted }];
	}
	const groups: ActivityDateGroup[] = [];
	for (const tx of sorted) {
		const last = groups[groups.length - 1];
		if (last && last.occurredOn === tx.occurredOn) {
			last.transactions.push(tx);
		} else {
			groups.push({ occurredOn: tx.occurredOn, transactions: [tx] });
		}
	}
	return groups;
}

/** Flatten groups into header+row sections for date sort; flat rows for Default. */
export function activityListSections(
	sorted: LedgerTransaction[],
	mode: ActivitySortMode
): ActivityListSection[] {
	if (!isDateActivitySort(mode)) {
		return sorted.map((tx) => ({ kind: 'row' as const, tx }));
	}
	const sections: ActivityListSection[] = [];
	for (const group of groupActivityByOccurredOn(sorted, mode)) {
		sections.push({ kind: 'header', occurredOn: group.occurredOn });
		for (const tx of group.transactions) {
			sections.push({ kind: 'row', tx });
		}
	}
	return sections;
}

/**
 * Next exclusive end index for chunked reveal (Spec 069).
 * Date sorts never split an `occurredOn` day.
 */
export function nextRevealEndIndex(
	sorted: LedgerTransaction[],
	currentEnd: number,
	mode: ActivitySortMode,
	targetSize: number = ACTIVITY_REVEAL_TARGET
): number {
	const n = sorted.length;
	if (n === 0) return 0;
	if (currentEnd >= n) return n;

	if (!isDateActivitySort(mode)) {
		return Math.min(n, currentEnd + Math.max(1, targetSize));
	}

	let end = currentEnd;
	let added = 0;
	while (end < n && added < targetSize) {
		const day = sorted[end]!.occurredOn;
		while (end < n && sorted[end]!.occurredOn === day) {
			end++;
			added++;
		}
	}
	return end;
}

/** Initial reveal end index for a freshly sorted list. */
export function initialRevealEndIndex(
	sorted: LedgerTransaction[],
	mode: ActivitySortMode,
	targetSize: number = ACTIVITY_REVEAL_TARGET
): number {
	return nextRevealEndIndex(sorted, 0, mode, targetSize);
}
