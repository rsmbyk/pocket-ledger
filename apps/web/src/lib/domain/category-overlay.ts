import type { CategoryKind } from './default-category-catalog';
import {
	STOCK_CUSTOM_ICON,
	catchAllGroupId,
	findStockCategoryByName,
	isStockCategoryId,
	isStockGroupId,
	stockCategoriesInGroup,
	stockGroupsByKind
} from './default-category-catalog';
import { normalizeCategoryName } from './categories';

export type OverlayPrefs = {
	hiddenStockIds: string[];
	groupOrderByKind: Partial<Record<CategoryKind, string[]>>;
};

export const EMPTY_OVERLAY_PREFS: OverlayPrefs = {
	hiddenStockIds: [],
	groupOrderByKind: {}
};

export type OverlayGroup = {
	id: string;
	name: string;
	kind: CategoryKind;
	createdAt: string;
	source: 'stock' | 'custom';
};

export type OverlayCategory = {
	id: string;
	name: string;
	kind: CategoryKind;
	groupId: string;
	icon: string;
	createdAt: string;
	hidden: boolean;
	source: 'stock' | 'custom';
	sortOrder: number;
	deletedAt: string | null;
};

export type CustomGroupInput = {
	id: string;
	name: string;
	kind: CategoryKind;
	createdAt: string;
};

export type CustomCategoryInput = {
	id: string;
	name: string;
	kind: CategoryKind;
	groupId: string;
	icon?: string;
	createdAt: string;
	hidden?: boolean;
	deletedAt?: string | null;
};

export function parseOverlayPrefs(raw: string | undefined | null): OverlayPrefs {
	if (!raw) return { ...EMPTY_OVERLAY_PREFS, groupOrderByKind: {} };
	try {
		const parsed = JSON.parse(raw) as Partial<OverlayPrefs>;
		return {
			hiddenStockIds: Array.isArray(parsed.hiddenStockIds)
				? parsed.hiddenStockIds.filter((id): id is string => typeof id === 'string')
				: [],
			groupOrderByKind: {
				...(Array.isArray(parsed.groupOrderByKind?.income)
					? { income: parsed.groupOrderByKind.income.filter((id) => typeof id === 'string') }
					: {}),
				...(Array.isArray(parsed.groupOrderByKind?.expense)
					? { expense: parsed.groupOrderByKind.expense.filter((id) => typeof id === 'string') }
					: {})
			}
		};
	} catch {
		return { ...EMPTY_OVERLAY_PREFS, groupOrderByKind: {} };
	}
}

export function factoryGroupIds(kind: CategoryKind, customGroups: CustomGroupInput[]): string[] {
	const stock = stockGroupsByKind(kind).map((g) => g.id);
	const custom = [...customGroups]
		.filter((g) => g.kind === kind)
		.sort(compareCreatedThenId)
		.map((g) => g.id);
	return [...stock, ...custom];
}

function compareCreatedThenId(
	a: { createdAt: string; id: string },
	b: { createdAt: string; id: string }
): number {
	const byCreated = a.createdAt.localeCompare(b.createdAt);
	if (byCreated !== 0) return byCreated;
	return a.id.localeCompare(b.id);
}

export function orderedGroupIds(
	kind: CategoryKind,
	prefs: OverlayPrefs,
	customGroups: CustomGroupInput[]
): string[] {
	const factory = factoryGroupIds(kind, customGroups);
	const saved = prefs.groupOrderByKind[kind];
	if (!saved || saved.length === 0) return factory;
	const allowed = new Set(factory);
	const next: string[] = [];
	for (const id of saved) {
		if (allowed.has(id) && !next.includes(id)) next.push(id);
	}
	for (const id of factory) {
		if (!next.includes(id)) next.push(id);
	}
	return next;
}

export function groupOrderDiffersFromFactory(
	kind: CategoryKind,
	order: string[],
	customGroups: CustomGroupInput[]
): boolean {
	const factory = factoryGroupIds(kind, customGroups);
	if (factory.length !== order.length) return true;
	return factory.some((id, i) => id !== order[i]);
}

export function prefsAfterSavingGroupOrder(
	prefs: OverlayPrefs,
	kind: CategoryKind,
	order: string[],
	customGroups: CustomGroupInput[]
): OverlayPrefs {
	const groupOrderByKind = { ...prefs.groupOrderByKind };
	if (!groupOrderDiffersFromFactory(kind, order, customGroups)) {
		delete groupOrderByKind[kind];
	} else {
		groupOrderByKind[kind] = [...order];
	}
	return { ...prefs, groupOrderByKind };
}

export function hideStockId(prefs: OverlayPrefs, id: string): OverlayPrefs {
	if (!isStockCategoryId(id) || prefs.hiddenStockIds.includes(id)) return prefs;
	return { ...prefs, hiddenStockIds: [...prefs.hiddenStockIds, id] };
}

export function showStockId(prefs: OverlayPrefs, id: string): OverlayPrefs {
	return {
		...prefs,
		hiddenStockIds: prefs.hiddenStockIds.filter((hidden) => hidden !== id)
	};
}

export function resolveGroups(
	prefs: OverlayPrefs,
	customGroups: CustomGroupInput[]
): OverlayGroup[] {
	const kinds: CategoryKind[] = ['income', 'expense'];
	const result: OverlayGroup[] = [];
	for (const kind of kinds) {
		const ids = orderedGroupIds(kind, prefs, customGroups);
		for (const id of ids) {
			if (isStockGroupId(id)) {
				const stock = stockGroupsByKind(kind).find((g) => g.id === id);
				if (!stock) continue;
				result.push({
					id: stock.id,
					name: stock.name,
					kind: stock.kind,
					createdAt: '',
					source: 'stock'
				});
				continue;
			}
			const custom = customGroups.find((g) => g.id === id);
			if (!custom) continue;
			result.push({
				id: custom.id,
				name: custom.name,
				kind: custom.kind,
				createdAt: custom.createdAt,
				source: 'custom'
			});
		}
	}
	return result;
}

export function resolveCategories(
	prefs: OverlayPrefs,
	customGroups: CustomGroupInput[],
	customCategories: CustomCategoryInput[],
	opts: { includeHidden?: boolean } = {}
): OverlayCategory[] {
	const includeHidden = opts.includeHidden ?? true;
	const hiddenStock = new Set(prefs.hiddenStockIds);
	const groups = resolveGroups(prefs, customGroups);
	const result: OverlayCategory[] = [];
	let sortOrder = 0;
	for (const group of groups) {
		const stockRows = stockCategoriesInGroup(group.id);
		for (const stock of stockRows) {
			const hidden = hiddenStock.has(stock.id);
			if (hidden && !includeHidden) continue;
			result.push({
				id: stock.id,
				name: stock.name,
				kind: stock.kind,
				groupId: stock.groupId,
				icon: stock.icon,
				createdAt: '',
				hidden,
				source: 'stock',
				sortOrder,
				deletedAt: null
			});
			sortOrder += 1;
		}
		const customs = customCategories
			.filter((c) => c.groupId === group.id && c.kind === group.kind)
			.sort(compareCreatedThenId);
		for (const custom of customs) {
			const hidden = custom.hidden === true || Boolean(custom.deletedAt);
			if (hidden && !includeHidden) continue;
			result.push({
				id: custom.id,
				name: custom.name,
				kind: custom.kind,
				groupId: custom.groupId,
				icon: STOCK_CUSTOM_ICON,
				createdAt: custom.createdAt,
				hidden,
				source: 'custom',
				sortOrder,
				deletedAt: custom.deletedAt ?? null
			});
			sortOrder += 1;
		}
	}
	return result;
}

export function assertUniqueResolvedName(
	name: string,
	kind: CategoryKind,
	existing: Array<Pick<OverlayCategory, 'id' | 'name' | 'kind'>>,
	exceptId?: string
): void {
	const needle = name.toLowerCase();
	const clash = existing.find(
		(c) => c.kind === kind && c.id !== exceptId && c.name.toLowerCase() === needle
	);
	if (clash) {
		throw new Error(`A ${kind} category named "${name}" already exists`);
	}
}

/** Match a legacy UUID row onto stock or park it as custom. */
export function planLegacyCategoryMigrate(
	name: string,
	kind: CategoryKind,
	deletedAt: string | null
): { action: 'map-stock'; stockId: string; hideStock: boolean } | { action: 'keep-custom'; groupId: string; hidden: boolean } {
	const stock = findStockCategoryByName(name, kind);
	if (stock) {
		return { action: 'map-stock', stockId: stock.id, hideStock: Boolean(deletedAt) };
	}
	return {
		action: 'keep-custom',
		groupId: catchAllGroupId(kind),
		hidden: Boolean(deletedAt)
	};
}

export function normalizeGroupName(raw: string): string {
	return normalizeCategoryName(raw);
}

export function assertUniqueGroupName(
	name: string,
	kind: CategoryKind,
	existing: Array<Pick<OverlayGroup, 'id' | 'name' | 'kind'>>,
	exceptId?: string
): void {
	const needle = name.toLowerCase();
	const clash = existing.find(
		(g) => g.kind === kind && g.id !== exceptId && g.name.toLowerCase() === needle
	);
	if (clash) {
		throw new Error(`A ${kind} group named "${name}" already exists`);
	}
}

