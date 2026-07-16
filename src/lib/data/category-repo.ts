import { db, type CategoryRow } from '$lib/data/db';
import { compareCategoriesBySortOrder } from '$lib/domain/category-order';

function sortCategories(rows: CategoryRow[]): CategoryRow[] {
	return [...rows].sort(compareCategoriesBySortOrder);
}

export async function listCategories(): Promise<CategoryRow[]> {
	return sortCategories(await db.categories.toArray());
}

export async function listCategoriesByKind(
	kind: CategoryRow['kind']
): Promise<CategoryRow[]> {
	const rows = await db.categories.where('kind').equals(kind).toArray();
	return sortCategories(rows);
}

export async function putCategory(category: CategoryRow): Promise<void> {
	await db.categories.put(category);
}

export async function deleteCategory(id: string): Promise<void> {
	await db.categories.delete(id);
}

export async function countCategories(): Promise<number> {
	return db.categories.count();
}
