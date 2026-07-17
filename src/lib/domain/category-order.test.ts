import { describe, expect, it } from 'vitest';
import {
	assignSortOrdersByName,
	compareCategoriesBySortOrder,
	nextSortOrderForKind
} from './category-order';

describe('category-order', () => {
	it('compares by sortOrder then name', () => {
		expect(
			compareCategoriesBySortOrder(
				{ sortOrder: 1, name: 'B' },
				{ sortOrder: 0, name: 'A' }
			)
		).toBeGreaterThan(0);
		expect(
			compareCategoriesBySortOrder(
				{ sortOrder: 0, name: 'A' },
				{ sortOrder: 0, name: 'B' }
			)
		).toBeLessThan(0);
	});

	it('assigns sortOrder by name within kind', () => {
		const assigned = assignSortOrdersByName([
			{ kind: 'expense' as const, name: 'Food' },
			{ kind: 'expense' as const, name: 'Bills' },
			{ kind: 'income' as const, name: 'Salary' }
		]);
		expect(assigned.find((c) => c.name === 'Bills')?.sortOrder).toBe(0);
		expect(assigned.find((c) => c.name === 'Food')?.sortOrder).toBe(1);
		expect(assigned.find((c) => c.name === 'Salary')?.sortOrder).toBe(0);
	});

	it('computes next sortOrder for a kind', () => {
		expect(nextSortOrderForKind([], 'expense')).toBe(0);
		expect(
			nextSortOrderForKind(
				[
					{ kind: 'expense', sortOrder: 0 },
					{ kind: 'expense', sortOrder: 2 },
					{ kind: 'income', sortOrder: 9 }
				],
				'expense'
			)
		).toBe(3);
	});
});
