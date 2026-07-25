import {
	DEFAULT_ACTIVITY_FILTERS,
	DEFAULT_ACTIVITY_SORT,
	type ActivityFilterCriteria,
	type ActivitySortMode,
	type ActivityTypeFilter,
	type AmountCompareOp
} from '$lib/domain/activity-filters';

export const ACTIVITY_LIST_SESSION_KEY = 'pocket-ledger-activity-list';

export type ActivityListSessionState = {
	sort: ActivitySortMode;
	filters: ActivityFilterCriteria;
};

const SORT_MODES: ReadonlySet<string> = new Set([
	'createdAt-desc',
	'occurredOn-desc',
	'occurredOn-asc'
]);

const TYPE_FILTERS: ReadonlySet<string> = new Set(['all', 'income', 'expense', 'transfer']);
const AMOUNT_OPS: ReadonlySet<string> = new Set(['none', 'lt', 'gt']);

function asString(value: unknown, fallback: string | null | undefined = ''): string {
	if (typeof value === 'string') return value;
	return fallback ?? '';
}

function parseSort(value: unknown): ActivitySortMode {
	if (typeof value === 'string' && SORT_MODES.has(value)) {
		return value as ActivitySortMode;
	}
	return DEFAULT_ACTIVITY_SORT;
}

function parseType(value: unknown): ActivityTypeFilter {
	if (typeof value === 'string' && TYPE_FILTERS.has(value)) {
		return value as ActivityTypeFilter;
	}
	return DEFAULT_ACTIVITY_FILTERS.type;
}

function parseAmountOp(value: unknown): AmountCompareOp {
	if (typeof value === 'string' && AMOUNT_OPS.has(value)) {
		return value as AmountCompareOp;
	}
	return DEFAULT_ACTIVITY_FILTERS.amountOp;
}

function parseFilters(value: unknown): ActivityFilterCriteria {
	if (!value || typeof value !== 'object') {
		return { ...DEFAULT_ACTIVITY_FILTERS };
	}
	const raw = value as Record<string, unknown>;
	const pocketRaw = asString(raw.pocketId, DEFAULT_ACTIVITY_FILTERS.pocketId).trim();
	return {
		type: parseType(raw.type),
		categoryId: asString(raw.categoryId, DEFAULT_ACTIVITY_FILTERS.categoryId),
		startDate: asString(raw.startDate, DEFAULT_ACTIVITY_FILTERS.startDate),
		endDate: asString(raw.endDate, DEFAULT_ACTIVITY_FILTERS.endDate),
		search: asString(raw.search, DEFAULT_ACTIVITY_FILTERS.search),
		hideVoided: raw.hideVoided === true,
		amountOp: parseAmountOp(raw.amountOp),
		amountRaw: asString(raw.amountRaw, DEFAULT_ACTIVITY_FILTERS.amountRaw),
		pocketId: pocketRaw || 'all'
	};
}

/** Parse stored Activity list session JSON; missing/garbage → defaults. */
export function parseActivityListSession(
	value: string | null | undefined
): ActivityListSessionState {
	if (!value) {
		return {
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		};
	}
	try {
		const parsed: unknown = JSON.parse(value);
		if (!parsed || typeof parsed !== 'object') {
			return {
				sort: DEFAULT_ACTIVITY_SORT,
				filters: { ...DEFAULT_ACTIVITY_FILTERS }
			};
		}
		const obj = parsed as Record<string, unknown>;
		return {
			sort: parseSort(obj.sort),
			filters: parseFilters(obj.filters)
		};
	} catch {
		return {
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		};
	}
}

export function readActivityListSession(
	storage: Pick<Storage, 'getItem'> | null | undefined = globalThis.sessionStorage
): ActivityListSessionState {
	try {
		return parseActivityListSession(storage?.getItem(ACTIVITY_LIST_SESSION_KEY) ?? null);
	} catch {
		return {
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		};
	}
}

export function writeActivityListSession(
	state: ActivityListSessionState,
	storage: Pick<Storage, 'setItem'> | null | undefined = globalThis.sessionStorage
): void {
	try {
		const payload: ActivityListSessionState = {
			sort: parseSort(state.sort),
			filters: parseFilters(state.filters)
		};
		storage?.setItem(ACTIVITY_LIST_SESSION_KEY, JSON.stringify(payload));
	} catch {
		// Ignore quota / private-mode failures; in-memory state still applies.
	}
}
