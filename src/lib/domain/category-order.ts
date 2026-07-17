import type { CategoryRow } from '$lib/data/db';

/** Sort categories by sortOrder ascending, then name. */
export function compareCategoriesBySortOrder(
	a: Pick<CategoryRow, 'sortOrder' | 'name'>,
	b: Pick<CategoryRow, 'sortOrder' | 'name'>
): number {
	const byOrder = a.sortOrder - b.sortOrder;
	if (byOrder !== 0) return byOrder;
	return a.name.localeCompare(b.name);
}

/**
 * Assign contiguous sortOrder values within each kind by current name order.
 * Used for Dexie migration and backup rows missing sortOrder.
 */
export function assignSortOrdersByName<T extends { kind: CategoryRow['kind']; name: string }>(
	rows: T[]
): Array<T & { sortOrder: number }> {
	const result: Array<T & { sortOrder: number }> = [];
	for (const kind of ['income', 'expense'] as const) {
		const ofKind = rows.filter((r) => r.kind === kind).sort((a, b) => a.name.localeCompare(b.name));
		ofKind.forEach((row, index) => {
			result.push({ ...row, sortOrder: index });
		});
	}
	return result;
}

/** Next sortOrder for a new category of the given kind. */
export function nextSortOrderForKind(
	existing: Array<Pick<CategoryRow, 'kind' | 'sortOrder'>>,
	kind: CategoryRow['kind']
): number {
	const ofKind = existing.filter((c) => c.kind === kind);
	if (ofKind.length === 0) return 0;
	return Math.max(...ofKind.map((c) => c.sortOrder)) + 1;
}
