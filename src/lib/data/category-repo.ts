import { db, type CategoryRow } from '$lib/data/db';

export async function listCategories(): Promise<CategoryRow[]> {
	return db.categories.orderBy('name').toArray();
}

export async function listCategoriesByKind(
	kind: CategoryRow['kind']
): Promise<CategoryRow[]> {
	return db.categories.where('kind').equals(kind).sortBy('name');
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
