import { db, type CategoryGroupRow, type CategoryRow } from '$lib/data/db';
import { STOCK_CUSTOM_ICON } from '$lib/domain/default-category-catalog';

function normalizeCategory(row: CategoryRow): CategoryRow {
	return {
		...row,
		deletedAt: row.deletedAt ?? null,
		groupId: row.groupId ?? '',
		icon: row.icon || STOCK_CUSTOM_ICON,
		hidden: row.hidden === true || Boolean(row.deletedAt)
	};
}

function normalizeGroup(row: CategoryGroupRow): CategoryGroupRow {
	return row;
}

/** Overlay custom categories only (stock lives in the bundle). */
export async function listCustomCategories(): Promise<CategoryRow[]> {
	return (await db.categories.toArray()).map(normalizeCategory);
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

export async function listCustomGroups(): Promise<CategoryGroupRow[]> {
	return (await db.categoryGroups.toArray()).map(normalizeGroup);
}

export async function putCategoryGroup(group: CategoryGroupRow): Promise<void> {
	await db.categoryGroups.put(normalizeGroup(group));
}

export async function deleteCategoryGroup(id: string): Promise<void> {
	await db.categoryGroups.delete(id);
}

/** @deprecated Use listCustomCategories — kept for backup/reset call sites that imported the old name. */
export async function listCategories(): Promise<CategoryRow[]> {
	return listCustomCategories();
}

export async function listAllCategories(): Promise<CategoryRow[]> {
	return listCustomCategories();
}

export async function listCategoriesByKind(kind: CategoryRow['kind']): Promise<CategoryRow[]> {
	return (await listCustomCategories()).filter((c) => c.kind === kind);
}
