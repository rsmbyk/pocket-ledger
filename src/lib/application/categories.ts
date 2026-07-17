import { deleteCategory, listCategories as listCategoriesRaw, putCategory } from '$lib/data/category-repo';
import { db, type CategoryRow } from '$lib/data/db';
import { assertUniqueCategoryName, normalizeCategoryName } from '$lib/domain/categories';
import { nextSortOrderForKind } from '$lib/domain/category-order';
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
		sortOrder: nextSortOrderForKind(existing, kind),
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

/** True when any transaction or recurring rule references this category. */
export async function isCategoryInUse(id: string): Promise<boolean> {
	const txCount = await db.transactions.filter((t) => t.categoryId === id).count();
	if (txCount > 0) return true;
	const ruleCount = await db.recurringRules.filter((r) => r.categoryId === id).count();
	return ruleCount > 0;
}

export async function removeCategory(id: string): Promise<void> {
	const current = await db.categories.get(id);
	if (!current) throw new Error('Category not found');

	if (await isCategoryInUse(id)) {
		throw new Error('Cannot delete a category that is still used');
	}
	await deleteCategory(id);
}

/** Swap sortOrder with the neighboring category of the same kind. */
export async function reorderCategory(
	id: string,
	direction: 'up' | 'down'
): Promise<void> {
	const existing = await listCategories();
	const current = existing.find((c) => c.id === id);
	if (!current) throw new Error('Category not found');

	const siblings = existing.filter((c) => c.kind === current.kind);
	const index = siblings.findIndex((c) => c.id === id);
	const swapIndex = direction === 'up' ? index - 1 : index + 1;
	if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) return;

	const neighbor = siblings[swapIndex]!;
	const rawCurrent = await db.categories.get(id);
	const rawNeighbor = await db.categories.get(neighbor.id);
	if (!rawCurrent || !rawNeighbor) throw new Error('Category not found');

	await putCategory({ ...rawCurrent, sortOrder: rawNeighbor.sortOrder });
	await putCategory({ ...rawNeighbor, sortOrder: rawCurrent.sortOrder });
}

/** Persist a full sibling order for a kind (drag-and-drop). */
export async function reorderCategories(
	kind: CategoryRow['kind'],
	orderedIds: string[]
): Promise<void> {
	const existing = await listCategories();
	const siblings = existing.filter((c) => c.kind === kind);
	if (orderedIds.length !== siblings.length) {
		throw new Error('Category order is incomplete');
	}
	const idSet = new Set(siblings.map((c) => c.id));
	for (const id of orderedIds) {
		if (!idSet.has(id)) throw new Error('Unknown category in order');
	}
	await Promise.all(
		orderedIds.map(async (id, index) => {
			const raw = await db.categories.get(id);
			if (!raw) throw new Error('Category not found');
			if (raw.sortOrder === index) return;
			await putCategory({ ...raw, sortOrder: index });
		})
	);
}
