import { describe, expect, it } from 'vitest';
import {
	EMPTY_OVERLAY_PREFS,
	assertUniqueResolvedName,
	factoryGroupIds,
	groupOrderDiffersFromFactory,
	hideStockId,
	orderedGroupIds,
	planLegacyCategoryMigrate,
	prefsAfterSavingGroupOrder,
	resolveCategories,
	resolveGroups,
	showStockId
} from './category-overlay';

const warung = {
	id: 'custom-warung',
	name: 'Warung',
	kind: 'expense' as const,
	groupId: 'stock-group:food-drink',
	createdAt: '2026-08-01T00:00:00.000Z',
	hidden: false
};

const sideGroup = {
	id: 'custom-side',
	name: 'Side',
	kind: 'expense' as const,
	createdAt: '2026-08-02T00:00:00.000Z'
};

describe('category overlay', () => {
	it('resolves virgin prefs to the full stock catalog', () => {
		const cats = resolveCategories(EMPTY_OVERLAY_PREFS, [], [], { includeHidden: false });
		expect(cats.filter((c) => c.kind === 'income')).toHaveLength(46);
		expect(cats.filter((c) => c.kind === 'expense')).toHaveLength(93);
		expect(cats.every((c) => c.source === 'stock')).toBe(true);
		const groups = resolveGroups(EMPTY_OVERLAY_PREFS, []);
		expect(groups.find((g) => g.kind === 'income')?.name).toBe('Work');
		expect(groups.filter((g) => g.kind === 'expense')[0]?.name).toBe('Home');
	});

	it('appends custom categories after stock in the same group', () => {
		const cats = resolveCategories(EMPTY_OVERLAY_PREFS, [], [warung], { includeHidden: false });
		const food = cats.filter((c) => c.groupId === 'stock-group:food-drink');
		expect(food.at(-1)?.name).toBe('Warung');
		expect(food.at(-1)?.icon).toBe('tag');
		expect(food.slice(0, -1).every((c) => c.source === 'stock')).toBe(true);
	});

	it('omits hidden stock and custom from pickers but keeps them when includeHidden', () => {
		const hiddenWarung = { ...warung, hidden: true };
		const prefs = hideStockId(EMPTY_OVERLAY_PREFS, 'stock:expense:groceries');
		const picker = resolveCategories(prefs, [], [hiddenWarung], { includeHidden: false });
		expect(picker.some((c) => c.id === 'stock:expense:groceries')).toBe(false);
		expect(picker.some((c) => c.id === 'custom-warung')).toBe(false);
		const listed = resolveCategories(prefs, [], [hiddenWarung], { includeHidden: true });
		expect(listed.find((c) => c.id === 'stock:expense:groceries')?.hidden).toBe(true);
		expect(listed.find((c) => c.id === 'custom-warung')?.hidden).toBe(true);
		expect(showStockId(prefs, 'stock:expense:groceries').hiddenStockIds).toEqual([]);
	});

	it('puts new custom groups last unless a saved order says otherwise', () => {
		expect(factoryGroupIds('expense', [sideGroup]).at(-1)).toBe('custom-side');
		const prefs = prefsAfterSavingGroupOrder(
			EMPTY_OVERLAY_PREFS,
			'expense',
			['stock-group:utilities', 'stock-group:home', ...factoryGroupIds('expense', [sideGroup]).slice(2)],
			[sideGroup]
		);
		expect(prefs.groupOrderByKind.expense?.[0]).toBe('stock-group:utilities');
		expect(orderedGroupIds('expense', prefs, [sideGroup])[0]).toBe('stock-group:utilities');
		expect(groupOrderDiffersFromFactory('expense', factoryGroupIds('expense', [sideGroup]), [sideGroup])).toBe(
			false
		);
	});

	it('clears group-order prefs when saving factory order', () => {
		const dirty = prefsAfterSavingGroupOrder(
			EMPTY_OVERLAY_PREFS,
			'expense',
			['stock-group:utilities', ...factoryGroupIds('expense', []).slice(1)],
			[]
		);
		const cleared = prefsAfterSavingGroupOrder(
			dirty,
			'expense',
			factoryGroupIds('expense', []),
			[]
		);
		expect(cleared.groupOrderByKind.expense).toBeUndefined();
	});

	it('maps Groceries to stock and parks Coffee in Catch-all', () => {
		expect(planLegacyCategoryMigrate('Groceries', 'expense', null)).toEqual({
			action: 'map-stock',
			stockId: 'stock:expense:groceries',
			hideStock: false
		});
		expect(planLegacyCategoryMigrate('Warung', 'expense', null)).toEqual({
			action: 'keep-custom',
			groupId: 'stock-group:catch-all',
			hidden: false
		});
		expect(planLegacyCategoryMigrate('Groceries', 'expense', '2026-01-01T00:00:00.000Z')).toEqual({
			action: 'map-stock',
			stockId: 'stock:expense:groceries',
			hideStock: true
		});
	});

	it('rejects custom names that collide with stock', () => {
		const resolved = resolveCategories(EMPTY_OVERLAY_PREFS, [], [], { includeHidden: true });
		expect(() => assertUniqueResolvedName('Groceries', 'expense', resolved)).toThrow(/already exists/i);
		expect(() => assertUniqueResolvedName('Warung', 'expense', resolved)).not.toThrow();
	});
});
