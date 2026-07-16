import { listTransactionsForAccount } from '$lib/data/transaction-repo';
import {
	buildMonthSummary,
	currentMonthKey,
	type MonthKey,
	type MonthSummary
} from '$lib/domain/month-summary';
import { listCategories } from '$lib/application/categories';

export async function getMonthSummary(
	accountId: string,
	monthKey: MonthKey = currentMonthKey()
): Promise<MonthSummary> {
	const [transactions, categories] = await Promise.all([
		listTransactionsForAccount(accountId),
		listCategories()
	]);
	const categoryMeta = Object.fromEntries(
		categories.map((c) => [c.id, { name: c.name, sortOrder: c.sortOrder }])
	);
	return buildMonthSummary(transactions, monthKey, categoryMeta);
}
