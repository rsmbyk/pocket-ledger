import type { LedgerTransaction } from '$lib/domain/transaction';
import type { AddableTransactionType } from '$lib/domain/transaction-rules';

/** Sentinel for Activity filter: only transactions with null categoryId. */
export const UNCATEGORIZED_FILTER = '__uncategorized__';

export type ActivityTypeFilter = 'all' | AddableTransactionType;

export type ActivityFilterCriteria = {
	type?: ActivityTypeFilter;
	/** Empty/omitted = All; `UNCATEGORIZED_FILTER` = null categoryId; else category id. */
	categoryId?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	search?: string | null;
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

	return transactions.filter((tx) => {
		if (type !== 'all' && tx.type !== type) return false;
		if (categoryId === UNCATEGORIZED_FILTER) {
			if (tx.categoryId != null) return false;
		} else if (categoryId && tx.categoryId !== categoryId) {
			return false;
		}
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
