import type { LedgerTransaction } from '$lib/domain/transaction';
import { isVoided } from '$lib/domain/transaction';
import { assertMinorUnits, type MinorUnits } from '$lib/domain/money';
import { ADMIN_FEE_CATEGORY_ID, ADMIN_FEE_LABEL } from '$lib/domain/activity-filters';
import type { Account } from '$lib/domain/account';
import { balanceAtDayStart } from '$lib/domain/pocket-balance';

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
	/** Ledger balance at month start (sum of pocket balances at day 1). */
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

export type MonthBounds = {
	earliest: MonthKey;
	latest: MonthKey;
};

/** `YYYY-MM` from a calendar date string (`YYYY-MM-DD` or already `YYYY-MM`). */
export function monthKeyFromDay(day: string): MonthKey | null {
	const key = day.length >= 7 ? day.slice(0, 7) : day;
	return isValidMonthKey(key) ? key : null;
}

/**
 * Inclusive month range for Home summary navigation.
 * Earliest = min(non-voided tx occurredOn, all pocket openingAsOf); latest = current local month.
 * If earliest would be after latest, both are latest.
 */
export function resolveMonthBounds(
	transactions: Array<Pick<LedgerTransaction, 'occurredOn' | 'voidedAt'>>,
	openingAsOfDates: string[],
	now = new Date()
): MonthBounds {
	const latest = currentMonthKey(now);
	let earliestDay: string | null = null;

	for (const tx of transactions) {
		if (isVoided(tx)) continue;
		if (!earliestDay || tx.occurredOn < earliestDay) {
			earliestDay = tx.occurredOn;
		}
	}
	for (const asOf of openingAsOfDates) {
		const trimmed = asOf?.trim() ?? '';
		if (!trimmed) continue;
		if (!earliestDay || trimmed < earliestDay) {
			earliestDay = trimmed;
		}
	}

	if (!earliestDay) {
		return { earliest: latest, latest };
	}
	const fromDay = monthKeyFromDay(earliestDay);
	const earliest = fromDay && fromDay <= latest ? fromDay : latest;
	return { earliest, latest };
}

export function clampMonthKey(monthKey: MonthKey, bounds: MonthBounds): MonthKey {
	if (!isValidMonthKey(monthKey)) {
		throw new Error('Invalid month key');
	}
	if (monthKey < bounds.earliest) return bounds.earliest;
	if (monthKey > bounds.latest) return bounds.latest;
	return monthKey;
}

export function canShiftMonth(monthKey: MonthKey, delta: number, bounds: MonthBounds): boolean {
	const next = shiftMonth(monthKey, delta);
	return next >= bounds.earliest && next <= bounds.latest;
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
 * Opening = sum of each pocket’s balance at `${monthKey}-01` (Spec 110).
 * @param categoryMeta Map of category id → name + sortOrder (Categories menu order).
 * @param pockets All pockets; each contributes its day-start balance to Opening.
 * @param options.pocketId When set (spec 148), Opening and in-month totals are this pocket only.
 */
export function buildMonthSummary(
	transactions: LedgerTransaction[],
	monthKey: MonthKey,
	categoryMeta: Record<string, CategoryMeta>,
	pockets: Array<Pick<Account, 'id' | 'openingBalanceMinor' | 'openingAsOf'>> = [],
	options?: { pocketId?: string }
): MonthSummary {
	if (!isValidMonthKey(monthKey)) {
		throw new Error('Invalid month key');
	}

	const monthStart = `${monthKey}-01`;
	const scopedId = options?.pocketId;
	const openingPockets = scopedId ? pockets.filter((p) => p.id === scopedId) : pockets;
	let openingMinor = 0;
	for (const pocket of openingPockets) {
		openingMinor += balanceAtDayStart(pocket, monthStart, transactions);
	}
	let incomeMinor = 0;
	let expenseMinor = 0;
	const incomeMap = new Map<string, MinorUnits>();
	const expenseMap = new Map<string, MinorUnits>();

	for (const tx of transactions) {
		assertMinorUnits(tx.amountMinor);
		if (isVoided(tx)) continue;

		if (tx.occurredOn < monthStart) {
			continue;
		}

		if (!transactionInMonth(tx, monthKey)) continue;

		if (tx.type === 'income') {
			if (scopedId && tx.accountId !== scopedId) continue;
			const key = tx.categoryId ?? '';
			incomeMinor += tx.amountMinor;
			incomeMap.set(key, (incomeMap.get(key) ?? 0) + tx.amountMinor);
		} else if (tx.type === 'expense') {
			if (scopedId && tx.accountId !== scopedId) continue;
			const key = tx.categoryId ?? '';
			expenseMinor += tx.amountMinor;
			expenseMap.set(key, (expenseMap.get(key) ?? 0) + tx.amountMinor);
		} else if (tx.type === 'transfer') {
			if (scopedId && tx.accountId !== scopedId) continue;
			const fee = transferFeeMinor(tx);
			if (fee > 0) {
				expenseMinor += fee;
				expenseMap.set(ADMIN_FEE_CATEGORY_ID, (expenseMap.get(ADMIN_FEE_CATEGORY_ID) ?? 0) + fee);
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
