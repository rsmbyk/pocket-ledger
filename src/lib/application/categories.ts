import { deleteCategory, listCategories as listCategoriesRaw, putCategory } from '$lib/data/category-repo';
import { db, type CategoryRow } from '$lib/data/db';
import { assertUniqueCategoryName, normalizeCategoryName } from '$lib/domain/categories';
import { ensureSeedCategories } from '$lib/application/transactions';
import { openField, sealField } from '$lib/application/field-crypto';

function createId(): string {
	return crypto.randomUUID();
}

async function revealCategories(rows: CategoryRow[]): Promise<CategoryRow[]> {
	return Promise.all(
		rows.map(async (c) => ({
			...c,
			name: await openField(c.name)
		}))
	);
}

export async function listCategories(): Promise<CategoryRow[]> {
	await ensureSeedCategories();
	return revealCategories(await listCategoriesRaw());
}

export async function createCategory(
	nameRaw: string,
	kind: CategoryRow['kind']
): Promise<CategoryRow> {
	await ensureSeedCategories();
	const name = normalizeCategoryName(nameRaw);
	const existing = await listCategories();
	assertUniqueCategoryName(name, kind, existing);
	const category: CategoryRow = {
		id: createId(),
		name: await sealField(name),
		kind,
		createdAt: new Date().toISOString()
	};
	await putCategory(category);
	return { ...category, name };
}

export async function renameCategory(id: string, nameRaw: string): Promise<CategoryRow> {
	const existing = await listCategories();
	const current = existing.find((c) => c.id === id);
	if (!current) throw new Error('Category not found');
	const name = normalizeCategoryName(nameRaw);
	assertUniqueCategoryName(name, current.kind, existing, id);
	const updated = { ...current, name: await sealField(name) };
	await putCategory(updated);
	return { ...updated, name };
}

export async function removeCategory(id: string): Promise<void> {
	const current = await db.categories.get(id);
	if (!current) throw new Error('Category not found');

	const txCount = await db.transactions.filter((t) => t.categoryId === id).count();
	const ruleCount = await db.recurringRules.filter((r) => r.categoryId === id).count();
	if (txCount > 0 || ruleCount > 0) {
		throw new Error('Cannot delete a category that is still used');
	}
	await deleteCategory(id);
}
