import type { LedgerTransaction } from '$lib/domain/transaction';
import { assertMinorUnits, type MinorUnits } from '$lib/domain/money';

export type MonthKey = string; // YYYY-MM

export type CategoryTotal = {
	categoryId: string | null;
	label: string;
	amountMinor: MinorUnits;
};

export type MonthSummary = {
	monthKey: MonthKey;
	incomeMinor: MinorUnits;
	expenseMinor: MinorUnits;
	netMinor: MinorUnits;
	expenseByCategory: CategoryTotal[];
};

export function isValidMonthKey(value: string): value is MonthKey {
	if (!/^\d{4}-\d{2}$/.test(value)) return false;
	const month = Number(value.slice(5, 7));
	return month >= 1 && month <= 12;
}

export function monthKeyFromDate(date: Date): MonthKey {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

export function currentMonthKey(now = new Date()): MonthKey {
	return monthKeyFromDate(now);
}

export function shiftMonth(monthKey: MonthKey, delta: number): MonthKey {
	if (!isValidMonthKey(monthKey)) {
		throw new Error('Invalid month key');
	}
	const [y, m] = monthKey.split('-').map(Number) as [number, number];
	const date = new Date(y, m - 1 + delta, 1);
	return monthKeyFromDate(date);
}

export function formatMonthLabel(monthKey: MonthKey, locale?: string): string {
	if (!isValidMonthKey(monthKey)) return monthKey;
	const [y, m] = monthKey.split('-').map(Number) as [number, number];
	const date = new Date(y, m - 1, 1);
	return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function transactionInMonth(
	tx: Pick<LedgerTransaction, 'occurredOn'>,
	monthKey: MonthKey
): boolean {
	return tx.occurredOn.startsWith(`${monthKey}-`);
}

export function buildMonthSummary(
	transactions: LedgerTransaction[],
	monthKey: MonthKey,
	categoryNames: Record<string, string>
): MonthSummary {
	if (!isValidMonthKey(monthKey)) {
		throw new Error('Invalid month key');
	}

	let incomeMinor = 0;
	let expenseMinor = 0;
	const expenseMap = new Map<string, MinorUnits>();

	for (const tx of transactions) {
		if (!transactionInMonth(tx, monthKey)) continue;
		assertMinorUnits(tx.amountMinor);

		if (tx.type === 'income') {
			incomeMinor += tx.amountMinor;
			continue;
		}
		if (tx.type === 'expense') {
			expenseMinor += tx.amountMinor;
			const key = tx.categoryId ?? '';
			expenseMap.set(key, (expenseMap.get(key) ?? 0) + tx.amountMinor);
		}
	}

	const expenseByCategory: CategoryTotal[] = [...expenseMap.entries()]
		.map(([key, amount]) => ({
			categoryId: key === '' ? null : key,
			label: key === '' ? 'Uncategorized' : (categoryNames[key] ?? 'Category'),
			amountMinor: amount
		}))
		.sort((a, b) => b.amountMinor - a.amountMinor || a.label.localeCompare(b.label));

	return {
		monthKey,
		incomeMinor,
		expenseMinor,
		netMinor: incomeMinor - expenseMinor,
		expenseByCategory
	};
}
