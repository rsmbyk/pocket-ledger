import {
	DEFAULT_ACTIVITY_FILTERS,
	type ActivityFilterCriteria,
	type ActivityTxType,
	normalizeActivityFilters
} from '$lib/domain/activity-filters';
import {
	defaultTransactionDateRange,
	type TransactionDateRange
} from '$lib/domain/transaction-date-range';

export const ACTIVITY_LIST_SESSION_KEY = 'pocket-ledger-activity-list';

export type ActivityListSessionState = {
	filters: ActivityFilterCriteria;
	range: TransactionDateRange;
};

const TX_TYPES: ReadonlySet<string> = new Set(['income', 'expense', 'transfer']);

function asString(value: unknown, fallback = ''): string {
	if (typeof value === 'string') return value;
	return fallback;
}

function asStringArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
	}
	return [];
}

function parseTypes(raw: Record<string, unknown>): ActivityTxType[] {
	const fromArray = asStringArray(raw.types).filter((t): t is ActivityTxType => TX_TYPES.has(t));
	if (raw.types !== undefined) return fromArray;
	const legacy = asString(raw.type);
	if (legacy && TX_TYPES.has(legacy)) return [legacy as ActivityTxType];
	return [];
}

function parseCategoryIds(raw: Record<string, unknown>): string[] {
	if (raw.categoryIds !== undefined) return asStringArray(raw.categoryIds);
	const legacy = asString(raw.categoryId).trim();
	return legacy ? [legacy] : [];
}

function parsePocketIds(raw: Record<string, unknown>): string[] {
	if (raw.pocketIds !== undefined) {
		return asStringArray(raw.pocketIds).filter((id) => id !== 'all');
	}
	const legacy = asString(raw.pocketId).trim();
	if (!legacy || legacy === 'all') return [];
	return [legacy];
}

function parseShowVoided(raw: Record<string, unknown>): boolean {
	if (typeof raw.showVoided === 'boolean') return raw.showVoided;
	if (raw.hideVoided === true) return false;
	if (raw.hideVoided === false) return true;
	return false;
}

function parseFilters(value: unknown): ActivityFilterCriteria {
	if (!value || typeof value !== 'object') {
		return { ...DEFAULT_ACTIVITY_FILTERS };
	}
	const raw = value as Record<string, unknown>;
	return normalizeActivityFilters({
		search: asString(raw.search, DEFAULT_ACTIVITY_FILTERS.search),
		types: parseTypes(raw),
		categoryIds: parseCategoryIds(raw),
		pocketIds: parsePocketIds(raw),
		startDate: '',
		endDate: '',
		showVoided: parseShowVoided(raw)
	});
}

function parseRange(obj: Record<string, unknown>, filtersRaw: unknown): TransactionDateRange {
	const fallback = defaultTransactionDateRange();
	const rangeRaw =
		obj.range && typeof obj.range === 'object' ? (obj.range as Record<string, unknown>) : null;
	const filterObj =
		filtersRaw && typeof filtersRaw === 'object' ? (filtersRaw as Record<string, unknown>) : {};

	if (rangeRaw) {
		const mode = rangeRaw.mode === 'custom' ? 'custom' : 'month';
		const startDate = asString(rangeRaw.startDate) || fallback.startDate;
		const endDate = asString(rangeRaw.endDate) || fallback.endDate;
		const monthKey = asString(rangeRaw.monthKey) || fallback.monthKey;
		if (mode === 'custom') return { mode, startDate, endDate };
		return { mode: 'month', monthKey, startDate, endDate };
	}

	const oldStart = asString(filterObj.startDate).trim();
	const oldEnd = asString(filterObj.endDate).trim();
	if (!oldStart && !oldEnd) return fallback;
	return { mode: 'custom', startDate: oldStart || fallback.startDate, endDate: oldEnd || fallback.endDate };
}

function emptySession(): ActivityListSessionState {
	return {
		filters: { ...DEFAULT_ACTIVITY_FILTERS },
		range: defaultTransactionDateRange()
	};
}

/** Parse stored Activity list session JSON; missing/garbage → defaults. */
export function parseActivityListSession(
	value: string | null | undefined
): ActivityListSessionState {
	if (!value) return emptySession();
	try {
		const parsed: unknown = JSON.parse(value);
		if (!parsed || typeof parsed !== 'object') return emptySession();
		const obj = parsed as Record<string, unknown>;
		return {
			filters: parseFilters(obj.filters),
			range: parseRange(obj, obj.filters)
		};
	} catch {
		return emptySession();
	}
}

export function readActivityListSession(
	storage: Pick<Storage, 'getItem'> | null | undefined = globalThis.sessionStorage
): ActivityListSessionState {
	try {
		return parseActivityListSession(storage?.getItem(ACTIVITY_LIST_SESSION_KEY) ?? null);
	} catch {
		return emptySession();
	}
}

export function writeActivityListSession(
	state: ActivityListSessionState,
	storage: Pick<Storage, 'setItem'> | null | undefined = globalThis.sessionStorage
): void {
	try {
		const payload: ActivityListSessionState = {
			filters: parseFilters(state.filters),
			range: state.range
		};
		storage?.setItem(ACTIVITY_LIST_SESSION_KEY, JSON.stringify(payload));
	} catch {
		// Ignore quota / private-mode failures; in-memory state still applies.
	}
}
