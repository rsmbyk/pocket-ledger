import { db, type CategoryRow } from '$lib/data/db';
import { compareCategoriesBySortOrder } from '$lib/domain/category-order';
import { isCategoryActive } from '$lib/domain/categories';

function sortCategories(rows: CategoryRow[]): CategoryRow[] {
	return [...rows].sort(compareCategoriesBySortOrder);
}

function normalizeCategory(row: CategoryRow): CategoryRow {
	return { ...row, deletedAt: row.deletedAt ?? null };
}

/** Active categories only (excludes soft-deleted). */
export async function listCategories(): Promise<CategoryRow[]> {
	const rows = (await db.categories.toArray()).map(normalizeCategory);
	return sortCategories(rows.filter(isCategoryActive));
}

/** All categories including soft-deleted (display map / backup). */
export async function listAllCategories(): Promise<CategoryRow[]> {
	return sortCategories((await db.categories.toArray()).map(normalizeCategory));
}

export async function listCategoriesByKind(
	kind: CategoryRow['kind']
): Promise<CategoryRow[]> {
	const rows = (await db.categories.where('kind').equals(kind).toArray()).map(normalizeCategory);
	return sortCategories(rows.filter(isCategoryActive));
}

export async function putCategory(category: CategoryRow): Promise<void> {
	await db.categories.put(normalizeCategory(category));
}

export async function deleteCategory(id: string): Promise<void> {
	await db.categories.delete(id);
}

export async function countCategories(): Promise<number> {
	return db.categories.count();
}
