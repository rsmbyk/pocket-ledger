import type { CategoryKind } from '$lib/domain/default-category-catalog';

export const CATEGORIES_KIND_SESSION_KEY = 'pocket-ledger-categories-kind';

export const DEFAULT_CATEGORIES_KIND: CategoryKind = 'income';

/** Parse stored Categories kind; missing/garbage → income. */
export function parseCategoriesKind(value: string | null | undefined): CategoryKind {
	if (!value) return DEFAULT_CATEGORIES_KIND;
	const trimmed = value.trim();
	if (trimmed === 'income' || trimmed === 'expense') return trimmed;
	try {
		const parsed: unknown = JSON.parse(trimmed);
		if (parsed === 'income' || parsed === 'expense') return parsed;
		if (parsed && typeof parsed === 'object' && 'kind' in parsed) {
			const kind = (parsed as { kind: unknown }).kind;
			if (kind === 'income' || kind === 'expense') return kind;
		}
	} catch {
		return DEFAULT_CATEGORIES_KIND;
	}
	return DEFAULT_CATEGORIES_KIND;
}

export function readCategoriesKind(
	storage: Pick<Storage, 'getItem'> | null | undefined = globalThis.sessionStorage
): CategoryKind {
	try {
		return parseCategoriesKind(storage?.getItem(CATEGORIES_KIND_SESSION_KEY) ?? null);
	} catch {
		return DEFAULT_CATEGORIES_KIND;
	}
}

export function writeCategoriesKind(
	kind: CategoryKind,
	storage: Pick<Storage, 'setItem'> | null | undefined = globalThis.sessionStorage
): void {
	try {
		const next = kind === 'expense' ? 'expense' : 'income';
		storage?.setItem(CATEGORIES_KIND_SESSION_KEY, JSON.stringify({ kind: next }));
	} catch {
		// Ignore quota / private-mode failures; in-memory state still applies.
	}
}
