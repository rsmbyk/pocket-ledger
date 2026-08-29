import { describe, expect, it } from 'vitest';
import { filterCatalogGroups } from './category-catalog-filter';

const home = { id: 'stock-group:home', name: 'Home' };
const food = { id: 'stock-group:food-drink', name: 'Food & drink' };
const rent = { id: 'stock:expense:rent', name: 'Rent', groupId: home.id };
const groceries = { id: 'stock:expense:groceries', name: 'Groceries', groupId: food.id };
const dining = { id: 'stock:expense:dining', name: 'Dining', groupId: food.id };

const groups = [home, food];
const categories = [rent, groceries, dining];

describe('filterCatalogGroups', () => {
	it('returns every group and category when the query is blank', () => {
		const result = filterCatalogGroups(groups, categories, '  ');
		expect(result.map((row) => row.group.id)).toEqual([home.id, food.id]);
		expect(result[0]?.categories.map((c) => c.id)).toEqual([rent.id]);
		expect(result[1]?.categories.map((c) => c.id)).toEqual([groceries.id, dining.id]);
	});

	it('keeps only groups that have a matching category name', () => {
		const result = filterCatalogGroups(groups, categories, 'groc');
		expect(result.map((row) => row.group.id)).toEqual([food.id]);
		expect(result[0]?.categories.map((c) => c.name)).toEqual(['Groceries']);
	});

	it('shows the whole group when the group name matches', () => {
		const result = filterCatalogGroups(groups, categories, 'home');
		expect(result.map((row) => row.group.id)).toEqual([home.id]);
		expect(result[0]?.categories.map((c) => c.name)).toEqual(['Rent']);
	});

	it('returns an empty list when nothing matches', () => {
		expect(filterCatalogGroups(groups, categories, 'zzzz')).toEqual([]);
	});
});
