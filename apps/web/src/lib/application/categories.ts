import {
	deleteCategory,
	listCustomCategories,
	listCustomGroups,
	putCategory,
	putCategoryGroup
} from '$lib/data/category-repo';
import {
	db,
	SETTINGS_CATEGORY_MIGRATED,
	SETTINGS_CATEGORY_OVERLAY,
	type CategoryGroupRow,
	type CategoryRow
} from '$lib/data/db';
import { getSetting, setSetting } from '$lib/data/settings-repo';
import { normalizeCategoryName } from '$lib/domain/categories';
import { isVoided } from '$lib/domain/transaction';
import {
	STOCK_CUSTOM_ICON,
	catchAllGroupId,
	isStockCategoryId,
	stockGroupById
} from '$lib/domain/default-category-catalog';
import {
	assertUniqueGroupName,
	assertUniqueResolvedName,
	EMPTY_OVERLAY_PREFS,
	factoryGroupIds,
	hideStockId,
	normalizeGroupName,
	parseOverlayPrefs,
	planLegacyCategoryMigrate,
	prefsAfterSavingGroupOrder,
	resolveCategories,
	resolveGroups,
	showStockId,
	type OverlayGroup,
	type OverlayPrefs
} from '$lib/domain/category-overlay';
import { openField, sealField } from '$lib/application/field-crypto';

function createId(): string {
	return crypto.randomUUID();
}

function toCategoryRow(row: {
	id: string;
	name: string;
	kind: CategoryRow['kind'];
	groupId: string;
	icon: string;
	createdAt: string;
	hidden: boolean;
	source: 'stock' | 'custom';
	sortOrder: number;
	deletedAt: string | null;
}): CategoryRow {
	return {
		id: row.id,
		name: row.name,
		kind: row.kind,
		sortOrder: row.sortOrder,
		createdAt: row.createdAt || new Date(0).toISOString(),
		deletedAt: row.deletedAt,
		groupId: row.groupId,
		icon: row.icon,
		hidden: row.hidden,
		source: row.source
	};
}

async function revealCustomCategories(rows: CategoryRow[]): Promise<CategoryRow[]> {
	return Promise.all(
		rows.map(async (c) => ({
			...c,
			name: await openField(c.name)
		}))
	);
}

async function revealCustomGroups(rows: CategoryGroupRow[]): Promise<CategoryGroupRow[]> {
	return Promise.all(
		rows.map(async (g) => ({
			...g,
			name: await openField(g.name)
		}))
	);
}

async function loadPrefs(): Promise<OverlayPrefs> {
	return parseOverlayPrefs(await getSetting(SETTINGS_CATEGORY_OVERLAY));
}

async function savePrefs(prefs: OverlayPrefs): Promise<void> {
	const empty =
		prefs.hiddenStockIds.length === 0 &&
		!prefs.groupOrderByKind.income &&
		!prefs.groupOrderByKind.expense;
	if (empty) {
		await db.settings.delete(SETTINGS_CATEGORY_OVERLAY);
		return;
	}
	await setSetting(SETTINGS_CATEGORY_OVERLAY, JSON.stringify(prefs));
}

let migrateGate: Promise<void> | null = null;

export async function ensureCategoryCatalog(): Promise<void> {
	if (!migrateGate) {
		migrateGate = migrateLegacyCategoriesOnce().finally(() => {
			migrateGate = null;
		});
	}
	await migrateGate;
}

async function migrateLegacyCategoriesOnce(): Promise<void> {
	if ((await getSetting(SETTINGS_CATEGORY_MIGRATED)) === '123') return;

	const raw = await listCustomCategories();
	const revealed = await revealCustomCategories(raw);
	let prefs = await loadPrefs();

	const ordered = [...revealed].sort((a, b) => {
		const aDel = a.deletedAt ? 0 : 1;
		const bDel = b.deletedAt ? 0 : 1;
		return aDel - bDel;
	});

	for (const row of ordered) {
		if (isStockCategoryId(row.id)) {
			await deleteCategory(row.id);
			continue;
		}
		const plan = planLegacyCategoryMigrate(row.name, row.kind, row.deletedAt);
		if (plan.action === 'map-stock') {
			const txs = await db.transactions.toArray();
			for (const tx of txs) {
				if (tx.categoryId === row.id) {
					await db.transactions.put({ ...tx, categoryId: plan.stockId });
				}
			}
			await deleteCategory(row.id);
			prefs = plan.hideStock
				? hideStockId(prefs, plan.stockId)
				: showStockId(prefs, plan.stockId);
			continue;
		}
		const sealedName = raw.find((c) => c.id === row.id)?.name ?? (await sealField(row.name));
		await putCategory({
			...row,
			name: sealedName,
			groupId: row.groupId || plan.groupId,
			icon: STOCK_CUSTOM_ICON,
			hidden: plan.hidden,
			deletedAt: null,
			source: 'custom'
		});
	}

	await savePrefs(prefs);
	await setSetting(SETTINGS_CATEGORY_MIGRATED, '123');
}

async function overlayInputs(): Promise<{
	prefs: OverlayPrefs;
	groups: CategoryGroupRow[];
	custom: CategoryRow[];
}> {
	await ensureCategoryCatalog();
	const [prefs, groups, custom] = await Promise.all([
		loadPrefs(),
		revealCustomGroups(await listCustomGroups()),
		revealCustomCategories(await listCustomCategories())
	]);
	return { prefs, groups, custom };
}

/** Visible categories for pickers (stock + custom, hidden omitted). */
export async function listCategories(): Promise<CategoryRow[]> {
	const { prefs, groups, custom } = await overlayInputs();
	return resolveCategories(prefs, groups, custom, { includeHidden: false }).map(toCategoryRow);
}

/** All resolved categories including hidden (id→name display / month charts). */
export async function listAllCategories(): Promise<CategoryRow[]> {
	const { prefs, groups, custom } = await overlayInputs();
	return resolveCategories(prefs, groups, custom, { includeHidden: true }).map(toCategoryRow);
}

export async function listResolvedGroups(): Promise<OverlayGroup[]> {
	const { prefs, groups } = await overlayInputs();
	return resolveGroups(prefs, groups);
}

export async function listCategoriesByKind(kind: CategoryRow['kind']): Promise<CategoryRow[]> {
	return (await listCategories()).filter((c) => c.kind === kind);
}

export async function createCategory(
	nameRaw: string,
	kind: CategoryRow['kind'],
	groupId?: string
): Promise<CategoryRow> {
	const name = normalizeCategoryName(nameRaw);
	const { prefs, groups, custom } = await overlayInputs();
	const resolved = resolveCategories(prefs, groups, custom, { includeHidden: true });
	assertUniqueResolvedName(name, kind, resolved);
	const targetGroupId = groupId ?? catchAllGroupId(kind);
	const group =
		resolveGroups(prefs, groups).find((g) => g.id === targetGroupId) ?? stockGroupById(targetGroupId);
	if (!group || group.kind !== kind) {
		throw new Error('Choose a group for this category');
	}
	const now = new Date().toISOString();
	const category: CategoryRow = {
		id: createId(),
		name: await sealField(name),
		kind,
		sortOrder: 0,
		createdAt: now,
		deletedAt: null,
		groupId: targetGroupId,
		icon: STOCK_CUSTOM_ICON,
		hidden: false,
		source: 'custom'
	};
	await putCategory(category);
	return { ...category, name };
}

export async function createCategoryGroup(
	nameRaw: string,
	kind: CategoryRow['kind']
): Promise<CategoryGroupRow> {
	const name = normalizeGroupName(nameRaw);
	const { prefs, groups } = await overlayInputs();
	assertUniqueGroupName(name, kind, resolveGroups(prefs, groups));
	const group: CategoryGroupRow = {
		id: createId(),
		name: await sealField(name),
		kind,
		createdAt: new Date().toISOString()
	};
	await putCategoryGroup(group);
	return { ...group, name };
}

export async function renameCategory(id: string, nameRaw: string): Promise<CategoryRow> {
	if (isStockCategoryId(id)) throw new Error('Stock categories cannot be renamed');
	const name = normalizeCategoryName(nameRaw);
	const { prefs, groups, custom } = await overlayInputs();
	const current = custom.find((c) => c.id === id);
	if (!current) throw new Error('Category not found');
	const resolved = resolveCategories(prefs, groups, custom, { includeHidden: true });
	assertUniqueResolvedName(name, current.kind, resolved, id);
	const raw = await db.categories.get(id);
	if (!raw) throw new Error('Category not found');
	await putCategory({ ...raw, name: await sealField(name), icon: STOCK_CUSTOM_ICON });
	return {
		...toCategoryRow({
			id: current.id,
			name,
			kind: current.kind,
			groupId: current.groupId,
			icon: STOCK_CUSTOM_ICON,
			createdAt: current.createdAt,
			hidden: current.hidden,
			source: 'custom',
			sortOrder: 0,
			deletedAt: null
		})
	};
}

export async function hideCategory(id: string): Promise<void> {
	if (isStockCategoryId(id)) {
		await savePrefs(hideStockId(await loadPrefs(), id));
		return;
	}
	const raw = await db.categories.get(id);
	if (!raw) throw new Error('Category not found');
	await putCategory({ ...raw, hidden: true, deletedAt: null });
}

export async function showCategory(id: string): Promise<void> {
	if (isStockCategoryId(id)) {
		await savePrefs(showStockId(await loadPrefs(), id));
		return;
	}
	const raw = await db.categories.get(id);
	if (!raw) throw new Error('Category not found');
	await putCategory({ ...raw, hidden: false, deletedAt: null });
}

/** Hide (never hard-delete). Replaces Spec 103 remove. */
export async function removeCategory(id: string): Promise<void> {
	await hideCategory(id);
}

export async function saveCategoryGroupOrder(
	kind: CategoryRow['kind'],
	orderedIds: string[]
): Promise<void> {
	const { prefs, groups } = await overlayInputs();
	const allowed = new Set(factoryGroupIds(kind, groups));
	if (orderedIds.length !== allowed.size || orderedIds.some((id) => !allowed.has(id))) {
		throw new Error('Group order is incomplete');
	}
	await savePrefs(prefsAfterSavingGroupOrder(prefs, kind, orderedIds, groups));
}

export async function overlayPrefs(): Promise<OverlayPrefs> {
	await ensureCategoryCatalog();
	return loadPrefs();
}

/** True when any non-voided transaction references this category. */
export async function isCategoryInUse(id: string): Promise<boolean> {
	const txCount = await db.transactions.filter((t) => t.categoryId === id && !isVoided(t)).count();
	return txCount > 0;
}

/** @deprecated Category order is catalog-then-custom (spec 123). */
export async function reorderCategory(_id: string, _direction: 'up' | 'down'): Promise<void> {}

/** @deprecated Category order is catalog-then-custom (spec 123). */
export async function reorderCategories(
	_kind: CategoryRow['kind'],
	_orderedIds: string[]
): Promise<void> {}

export type { OverlayGroup, OverlayPrefs };
export { EMPTY_OVERLAY_PREFS };
