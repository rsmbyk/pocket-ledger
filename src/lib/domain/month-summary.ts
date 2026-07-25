import type { LedgerTransaction } from '$lib/domain/transaction';
import { isVoided } from '$lib/domain/transaction';
import { assertMinorUnits, type MinorUnits } from '$lib/domain/money';
import { ADMIN_FEE_CATEGORY_ID, ADMIN_FEE_LABEL } from '$lib/domain/activity-filters';

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
	incomeByCategory: CategoryTotal[];
	expenseByCategory: CategoryTotal[];
	/** Ledger balance at the start of the month (signed sum of earlier txs). */
	openingMinor: MinorUnits;
	/** openingMinor + netMinor */
	endingMinor: MinorUnits;
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

function transferFeeMinor(tx: Pick<LedgerTransaction, 'feeMinor'>): MinorUnits {
	const fee = tx.feeMinor ?? 0;
	if (!Number.isInteger(fee) || fee < 0) {
		throw new Error('Stored fee must be a non-negative integer');
	}
	return fee;
}

/** Signed effect on all-pocket ledger: income +, expense −, transfer −fee. */
function signedAmount(
	tx: Pick<LedgerTransaction, 'type' | 'amountMinor' | 'feeMinor'>
): number {
	assertMinorUnits(tx.amountMinor);
	if (tx.type === 'income') return tx.amountMinor;
	if (tx.type === 'expense') return -tx.amountMinor;
	if (tx.type === 'transfer') return -transferFeeMinor(tx);
	return 0;
}

export type CategoryMeta = {
	name: string;
	sortOrder: number;
};

const UNCATEGORIZED_SORT = Number.MAX_SAFE_INTEGER;
const ADMIN_FEE_SORT = Number.MAX_SAFE_INTEGER - 1;

function categoryTotals(
	map: Map<string, MinorUnits>,
	categoryMeta: Record<string, CategoryMeta>
): CategoryTotal[] {
	return [...map.entries()]
		.map(([key, amount]) => {
			let categoryId: string | null;
			let label: string;
			let sortOrder: number;
			if (key === '') {
				categoryId = null;
				label = 'Uncategorized';
				sortOrder = UNCATEGORIZED_SORT;
			} else if (key === ADMIN_FEE_CATEGORY_ID) {
				categoryId = ADMIN_FEE_CATEGORY_ID;
				label = ADMIN_FEE_LABEL;
				sortOrder = ADMIN_FEE_SORT;
			} else {
				categoryId = key;
				label = categoryMeta[key]?.name ?? 'Category';
				sortOrder = categoryMeta[key]?.sortOrder ?? 0;
			}
			return { categoryId, label, amountMinor: amount, sortOrder };
		})
		.sort((a, b) => {
			const byOrder = a.sortOrder - b.sortOrder;
			if (byOrder !== 0) return byOrder;
			return a.label.localeCompare(b.label);
		})
		.map(({ categoryId, label, amountMinor }) => ({ categoryId, label, amountMinor }));
}

/**
 * Build month totals, category breakdowns, and opening/ending balances.
 * @param categoryMeta Map of category id → name + sortOrder (Categories menu order).
 */
export function buildMonthSummary(
	transactions: LedgerTransaction[],
	monthKey: MonthKey,
	categoryMeta: Record<string, CategoryMeta>
): MonthSummary {
	if (!isValidMonthKey(monthKey)) {
		throw new Error('Invalid month key');
	}

	const monthStart = `${monthKey}-01`;
	let openingMinor = 0;
	let incomeMinor = 0;
	let expenseMinor = 0;
	const incomeMap = new Map<string, MinorUnits>();
	const expenseMap = new Map<string, MinorUnits>();

	for (const tx of transactions) {
		assertMinorUnits(tx.amountMinor);
		if (isVoided(tx)) continue;

		if (tx.occurredOn < monthStart) {
			openingMinor += signedAmount(tx);
			continue;
		}

		if (!transactionInMonth(tx, monthKey)) continue;

		const key = tx.categoryId ?? '';
		if (tx.type === 'income') {
			incomeMinor += tx.amountMinor;
			incomeMap.set(key, (incomeMap.get(key) ?? 0) + tx.amountMinor);
		} else if (tx.type === 'expense') {
			expenseMinor += tx.amountMinor;
			expenseMap.set(key, (expenseMap.get(key) ?? 0) + tx.amountMinor);
		} else if (tx.type === 'transfer') {
			const fee = transferFeeMinor(tx);
			if (fee > 0) {
				expenseMinor += fee;
				expenseMap.set(
					ADMIN_FEE_CATEGORY_ID,
					(expenseMap.get(ADMIN_FEE_CATEGORY_ID) ?? 0) + fee
				);
			}
		}
	}

	const netMinor = incomeMinor - expenseMinor;

	return {
		monthKey,
		incomeMinor,
		expenseMinor,
		netMinor,
		incomeByCategory: categoryTotals(incomeMap, categoryMeta),
		expenseByCategory: categoryTotals(expenseMap, categoryMeta),
		openingMinor,
		endingMinor: openingMinor + netMinor
	};
}
