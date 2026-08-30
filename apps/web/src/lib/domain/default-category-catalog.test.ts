import { describe, expect, it } from 'vitest';
import {
	STOCK_CATEGORIES,
	STOCK_CATEGORY_GROUPS,
	STOCK_CUSTOM_ICON,
	catchAllGroupId,
	findStockCategoryByName,
	isStockCategoryId,
	isStockGroupId,
	stockCategoriesByKind,
	stockGroupsByKind
} from './default-category-catalog';

describe('default category catalog', () => {
	it('locks 7 income groups, 17 expense groups, 46 income cats, 93 expense cats', () => {
		expect(stockGroupsByKind('income')).toHaveLength(7);
		expect(stockGroupsByKind('expense')).toHaveLength(17);
		expect(stockCategoriesByKind('income')).toHaveLength(46);
		expect(stockCategoriesByKind('expense')).toHaveLength(93);
		expect(STOCK_CATEGORY_GROUPS).toHaveLength(24);
		expect(STOCK_CATEGORIES).toHaveLength(139);
	});

	it('uses stable stock ids', () => {
		expect(findStockCategoryByName('Groceries', 'expense')?.id).toBe('stock:expense:groceries');
		expect(findStockCategoryByName('Salary', 'income')?.id).toBe('stock:income:salary');
		expect(isStockCategoryId('stock:expense:groceries')).toBe(true);
		expect(isStockGroupId('stock-group:home')).toBe(true);
		expect(isStockCategoryId(crypto.randomUUID())).toBe(false);
	});

	it('keeps factory group order', () => {
		expect(stockGroupsByKind('income').map((g) => g.name)).toEqual([
			'Work',
			'Business & creating',
			'Investing & cashback',
			'Property & assets',
			'Benefits & support',
			'Gifts & windfalls',
			'Care, land, other'
		]);
		expect(stockGroupsByKind('expense')[0]?.name).toBe('Home');
		expect(stockGroupsByKind('expense').at(-1)?.name).toBe('Catch-all');
		expect(catchAllGroupId('expense')).toBe('stock-group:catch-all');
		expect(catchAllGroupId('income')).toBe('stock-group:care-land-other');
	});

	it('gives every catalog row a unique id and a lucide icon', () => {
		const ids = STOCK_CATEGORIES.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
		const groupIds = STOCK_CATEGORY_GROUPS.map((g) => g.id);
		expect(new Set(groupIds).size).toBe(groupIds.length);
		for (const cat of STOCK_CATEGORIES) {
			expect(cat.icon).toBeTruthy();
			expect(cat.icon).not.toBe(STOCK_CUSTOM_ICON);
			expect(STOCK_CATEGORY_GROUPS.some((g) => g.id === cat.groupId && g.kind === cat.kind)).toBe(
				true
			);
		}
	});

	it('disambiguates duplicate Other expense ids by group', () => {
		const others = STOCK_CATEGORIES.filter((c) => c.kind === 'expense' && c.name === 'Other');
		expect(others).toHaveLength(2);
		expect(others.map((c) => c.id).sort()).toEqual([
			'stock:expense:catch-all:other',
			'stock:expense:other'
		]);
	});
});
