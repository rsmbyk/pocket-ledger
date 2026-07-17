import { describe, expect, it } from 'vitest';
import { assertUniqueCategoryName, normalizeCategoryName } from './categories';
import type { CategoryRow } from '$lib/data/db';

describe('category names', () => {
	it('normalizes whitespace', () => {
		expect(normalizeCategoryName('  Cafe  latte ')).toBe('Cafe latte');
	});

	it('rejects empty names', () => {
		expect(() => normalizeCategoryName('   ')).toThrow(/required/i);
	});

	it('rejects duplicate names within kind', () => {
		const existing: CategoryRow[] = [
			{ id: '1', name: 'Coffee', kind: 'expense', sortOrder: 0, createdAt: 't' }
		];
		expect(() => assertUniqueCategoryName('coffee', 'expense', existing)).toThrow(/already exists/i);
		expect(() => assertUniqueCategoryName('Coffee', 'income', existing)).not.toThrow();
	});
});
