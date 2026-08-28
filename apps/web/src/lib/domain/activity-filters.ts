import type { LedgerTransaction } from '$lib/domain/transaction';
import { isVoided } from '$lib/domain/transaction';
import { amountDigitsOnly } from '$lib/domain/transaction-rules';

/** Sentinel for Activity filter: only transactions with null categoryId. */
export const UNCATEGORIZED_FILTER = '__uncategorized__';

/** Sentinel for Activity filter / month bucket: transfer admin fees (Spec 106). */
export const ADMIN_FEE_CATEGORY_ID = '__admin_fee__';

export const ADMIN_FEE_LABEL = 'Admin Fee';

/** Activity type filter including Transfer (Spec 107). */
export type ActivityTypeFilter = 'all' | 'income' | 'expense' | 'transfer';

/** Map of user category id → kind for filter option compatibility (Spec 107). */
export type CategoryKindLookup = Record<string, 'income' | 'expense'>;

/** True when the category filter control should be disabled (Transfer). */
export function isCategoryFilterDisabled(type: ActivityTypeFilter): boolean {
	return type === 'transfer';
}

/**
 * Whether a draft categoryId is valid for the selected type filter.
 * Empty / All is always compatible except Transfer still forces All via resolve.
 */
export function isCategoryFilterCompatible(
	categoryId: string | null | undefined,
	type: ActivityTypeFilter,
	categoryKinds: CategoryKindLookup
): boolean {
	const id = (categoryId ?? '').trim();
	if (!id) return true;
	if (type === 'transfer') return false;
	if (id === ADMIN_FEE_CATEGORY_ID) return type === 'all';
	if (id === UNCATEGORIZED_FILTER) return true;
	const kind = categoryKinds[id];
	if (!kind) return type === 'all';
	if (type === 'all') return true;
	return kind === type;
}

/** Returns categoryId if compatible with type; otherwise All (`''`). */
export function resolveCategoryIdForType(
	categoryId: string | null | undefined,
	type: ActivityTypeFilter,
	categoryKinds: CategoryKindLookup
): string {
	const id = (categoryId ?? '').trim();
	if (isCategoryFilterCompatible(id, type, categoryKinds)) return id;
	return '';
}

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
	/** Empty / `all` / omitted = all pockets; else pocket (account) id. */
	pocketId?: string | null;
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
	{ kind: 'header'; occurredOn: string } | { kind: 'row'; tx: LedgerTransaction };

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
		| 'pocketId'
	>
> = {
	type: 'all',
	categoryId: '',
	startDate: '',
	endDate: '',
	search: '',
	hideVoided: false,
	amountOp: 'none',
	amountRaw: '',
	pocketId: 'all'
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

export function isDefaultActivityFilters(criteria: ActivityFilterCriteria): boolean {
	const type = criteria.type ?? 'all';
	const categoryId = criteria.categoryId ?? '';
	const start = criteria.startDate?.trim() || '';
	const end = criteria.endDate?.trim() || '';
	const search = criteria.search?.trim() || '';
	const hideVoided = criteria.hideVoided ?? false;
	const amountOp = criteria.amountOp ?? 'none';
	const amountRaw = criteria.amountRaw?.trim() || '';
	const pocketId = criteria.pocketId?.trim() || 'all';
	return (
		type === DEFAULT_ACTIVITY_FILTERS.type &&
		(categoryId === '' || categoryId == null) &&
		start === '' &&
		end === '' &&
		search === '' &&
		hideVoided === false &&
		amountOp === 'none' &&
		amountRaw === '' &&
		(pocketId === 'all' || pocketId === '')
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
	const pocketId = criteria.pocketId?.trim() || 'all';

	return transactions.filter((tx) => {
		if (hideVoided && isVoided(tx)) return false;
		if (pocketId && pocketId !== 'all') {
			const onPocket =
				tx.accountId === pocketId ||
				(tx.counterAccountId != null && tx.counterAccountId === pocketId);
			if (!onPocket) return false;
		}
		if (type !== 'all' && tx.type !== type) return false;
		if (categoryId === ADMIN_FEE_CATEGORY_ID) {
			const fee = tx.feeMinor ?? 0;
			if (tx.type !== 'transfer' || fee <= 0) return false;
		} else if (categoryId === UNCATEGORIZED_FILTER) {
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
			const byCreated = b.createdAt.localeCompare(a.createdAt);
			if (byCreated !== 0) return byCreated;
		} else {
			const byDate = a.occurredOn.localeCompare(b.occurredOn);
			if (byDate !== 0) return byDate;
			const byCreated = a.createdAt.localeCompare(b.createdAt);
			if (byCreated !== 0) return byCreated;
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
