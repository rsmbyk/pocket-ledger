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
	const names = Object.fromEntries(categories.map((c) => [c.id, c.name]));
	return buildMonthSummary(transactions, monthKey, names);
}
