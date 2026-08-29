import { listAllTransactions } from '$lib/data/transaction-repo';
import { listAccounts } from '$lib/data/account-repo';
import {
	buildMonthSummary,
	clampMonthKey,
	currentMonthKey,
	resolveMonthBounds,
	type MonthBounds,
	type MonthKey,
	type MonthSummary
} from '$lib/domain/month-summary';
import { listAllCategories } from '$lib/application/categories';

export type MonthSummaryLoad = {
	monthKey: MonthKey;
	summary: MonthSummary;
	bounds: MonthBounds;
};

/**
 * Load month summary clamped into [earliest ledger month … current month].
 */
export async function loadMonthSummary(
	_accountId: string,
	requestedMonthKey: MonthKey = currentMonthKey()
): Promise<MonthSummaryLoad> {
	const [transactions, categories, pockets] = await Promise.all([
		listAllTransactions(),
		listAllCategories(),
		listAccounts()
	]);
	const bounds = resolveMonthBounds(
		transactions,
		pockets.map((p) => p.openingAsOf)
	);
	const monthKey = clampMonthKey(requestedMonthKey, bounds);
	const categoryMeta = Object.fromEntries(
		categories.map((c) => [c.id, { name: c.name, sortOrder: c.sortOrder }])
	);
	return {
		monthKey,
		bounds,
		summary: buildMonthSummary(transactions, monthKey, categoryMeta, pockets)
	};
}

export async function getMonthSummary(
	accountId: string,
	monthKey: MonthKey = currentMonthKey()
): Promise<MonthSummary> {
	const loaded = await loadMonthSummary(accountId, monthKey);
	return loaded.summary;
}
