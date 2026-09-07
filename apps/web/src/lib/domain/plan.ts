import { isValidOccurredOn } from '$lib/domain/transaction-rules';
import type { LedgerTransaction, TransactionType } from '$lib/domain/transaction';

export type PlanFrequency = 'once' | 'weekly' | 'monthly';

export type LedgerPlan = {
	id: string;
	description: string;
	type: TransactionType;
	amountMinor: number;
	feeMinor: number;
	categoryId: string | null;
	accountId: string;
	counterAccountId: string | null;
	note: string;
	dueOn: string;
	createdAt: string;
	frequency: PlanFrequency;
	/** 1–31 when monthly; null otherwise. Never store a clamped last-day as this. */
	monthDay: number | null;
};

const WEEKDAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
] as const;

function parseYmd(ymd: string): { year: number; month: number; day: number } {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
	if (!match) throw new Error('Date must be YYYY-MM-DD');
	return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function formatYmd(year: number, month: number, day: number): string {
	const y = String(year).padStart(4, '0');
	const m = String(month).padStart(2, '0');
	const d = String(day).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function lastDayOfMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Calendar YYYY-MM-DD plus `days` (local calendar via UTC date arithmetic). */
export function addCalendarDays(ymd: string, days: number): string {
	const { year, month, day } = parseYmd(ymd);
	const dt = new Date(Date.UTC(year, month - 1, day + days));
	return formatYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function ymdOnOrLastDay(year: number, month: number, monthDay: number): string {
	const last = lastDayOfMonth(year, month);
	return formatYmd(year, month, Math.min(monthDay, last));
}

/** Inclusive Home notice window: today-7 … today+7. */
export function isDueInHomeWindow(dueOn: string, today: string): boolean {
	if (!isValidOccurredOn(dueOn) || !isValidOccurredOn(today)) return false;
	const start = addCalendarDays(today, -7);
	const end = addCalendarDays(today, 7);
	return dueOn >= start && dueOn <= end;
}

export function weekdayName(dueOn: string): string {
	const { year, month, day } = parseYmd(dueOn);
	const dt = new Date(year, month - 1, day);
	return WEEKDAYS[dt.getDay()] ?? 'Monday';
}

export function ordinalDay(n: number): string {
	const v = n % 100;
	if (v >= 11 && v <= 13) return `${n}th`;
	switch (n % 10) {
		case 1:
			return `${n}st`;
		case 2:
			return `${n}nd`;
		case 3:
			return `${n}rd`;
		default:
			return `${n}th`;
	}
}

export function dayOfDueOn(dueOn: string): number {
	return parseYmd(dueOn).day;
}

/** Repeat select labels follow the current Due date. */
export function repeatOptionLabel(frequency: PlanFrequency, dueOn: string): string {
	if (frequency === 'once') return 'Once';
	if (frequency === 'weekly') return `Weekly (on ${weekdayName(dueOn)})`;
	return `Monthly (on the ${ordinalDay(dayOfDueOn(dueOn))})`;
}

/** List chip: word only. Once has no chip. */
export function repeatChipLabel(frequency: PlanFrequency): string | null {
	if (frequency === 'weekly') return 'Weekly';
	if (frequency === 'monthly') return 'Monthly';
	return null;
}

/**
 * Next due after completing an occurrence. Once is n/a (caller gravestones).
 * Monthly uses stored `monthDay` (1–31), clamping per target month only.
 */
export function nextDueOn(
	dueOn: string,
	frequency: PlanFrequency,
	monthDay: number | null
): string | null {
	if (frequency === 'once') return null;
	if (frequency === 'weekly') return addCalendarDays(dueOn, 7);
	const stored = monthDay ?? dayOfDueOn(dueOn);
	const { year, month } = parseYmd(dueOn);
	let nextYear = year;
	let nextMonth = month + 1;
	if (nextMonth > 12) {
		nextYear += 1;
		nextMonth = 1;
	}
	return ymdOnOrLastDay(nextYear, nextMonth, stored);
}

export function resolveMonthDay(
	frequency: PlanFrequency,
	dueOn: string,
	existing: number | null = null
): number | null {
	if (frequency !== 'monthly') return null;
	if (existing != null && existing >= 1 && existing <= 31) return existing;
	return dayOfDueOn(dueOn);
}

/** Map a Plan onto tx-row chrome (`occurredOn` = `dueOn`). */
export function planAsListTransaction(plan: LedgerPlan): LedgerTransaction {
	return {
		id: plan.id,
		accountId: plan.accountId,
		counterAccountId: plan.counterAccountId,
		type: plan.type,
		amountMinor: plan.amountMinor,
		feeMinor: plan.feeMinor,
		categoryId: plan.categoryId,
		note: plan.note,
		occurredOn: plan.dueOn,
		createdAt: plan.createdAt,
		voidedAt: null
	};
}

export type PocketSortHint = {
	id: string;
	isMain: boolean;
	sortOrder: number;
};

export function pocketSortIndex(accountId: string, pockets: readonly PocketSortHint[]): number {
	const pocket = pockets.find((p) => p.id === accountId);
	if (!pocket) return 9_999;
	if (pocket.isMain) return -1;
	return pocket.sortOrder;
}

export function planTouchesPocket(plan: LedgerPlan, pocketId: string): boolean {
	return plan.accountId === pocketId || plan.counterAccountId === pocketId;
}
