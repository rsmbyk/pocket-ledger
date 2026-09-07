import {
	DEFAULT_PLAN_FILTERS,
	normalizePlanFilters,
	type PlanFilterCriteria
} from '$lib/domain/plan-filters';
import type { ActivityTxType } from '$lib/domain/activity-filters';

export const PLANS_LIST_SESSION_KEY = 'pocket-ledger-plans-list';

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
	return asStringArray(raw.types).filter((t): t is ActivityTxType => TX_TYPES.has(t));
}

function parseFilters(value: unknown): PlanFilterCriteria {
	if (!value || typeof value !== 'object') {
		return { ...DEFAULT_PLAN_FILTERS };
	}
	const raw = value as Record<string, unknown>;
	return normalizePlanFilters({
		search: asString(raw.search, DEFAULT_PLAN_FILTERS.search),
		types: parseTypes(raw),
		pocketIds: asStringArray(raw.pocketIds)
	});
}

function emptySession(): PlanFilterCriteria {
	return { ...DEFAULT_PLAN_FILTERS };
}

export function parsePlansListSession(value: string | null | undefined): PlanFilterCriteria {
	if (!value) return emptySession();
	try {
		const parsed: unknown = JSON.parse(value);
		if (!parsed || typeof parsed !== 'object') return emptySession();
		const obj = parsed as Record<string, unknown>;
		return parseFilters(obj.filters ?? obj);
	} catch {
		return emptySession();
	}
}

export function readPlansListSession(
	storage: Pick<Storage, 'getItem'> | null | undefined = globalThis.sessionStorage
): PlanFilterCriteria {
	try {
		return parsePlansListSession(storage?.getItem(PLANS_LIST_SESSION_KEY) ?? null);
	} catch {
		return emptySession();
	}
}

export function writePlansListSession(
	state: PlanFilterCriteria,
	storage: Pick<Storage, 'setItem'> | null | undefined = globalThis.sessionStorage
): void {
	try {
		storage?.setItem(
			PLANS_LIST_SESSION_KEY,
			JSON.stringify({ filters: normalizePlanFilters(state) })
		);
	} catch {
		/* quota / private-mode */
	}
}
