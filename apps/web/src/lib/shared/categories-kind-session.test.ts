import { describe, expect, it } from 'vitest';
import {
	CATEGORIES_KIND_SESSION_KEY,
	DEFAULT_CATEGORIES_KIND,
	parseCategoriesKind,
	readCategoriesKind,
	writeCategoriesKind
} from './categories-kind-session';

describe('categories-kind-session', () => {
	it('defaults to income when missing or garbage', () => {
		expect(parseCategoriesKind(null)).toBe(DEFAULT_CATEGORIES_KIND);
		expect(parseCategoriesKind('')).toBe('income');
		expect(parseCategoriesKind('not-json')).toBe('income');
		expect(parseCategoriesKind('[]')).toBe('income');
		expect(parseCategoriesKind(JSON.stringify({ kind: 'transfer' }))).toBe('income');
	});

	it('accepts a bare allowed string', () => {
		expect(parseCategoriesKind('expense')).toBe('expense');
		expect(parseCategoriesKind('"income"')).toBe('income');
	});

	it('round-trips expense through injectable storage', () => {
		const map = new Map<string, string>();
		const storage = {
			getItem: (k: string) => map.get(k) ?? null,
			setItem: (k: string, v: string) => {
				map.set(k, v);
			}
		};

		writeCategoriesKind('expense', storage);
		expect(map.has(CATEGORIES_KIND_SESSION_KEY)).toBe(true);
		expect(JSON.parse(map.get(CATEGORIES_KIND_SESSION_KEY) ?? '')).toEqual({ kind: 'expense' });
		expect(readCategoriesKind(storage)).toBe('expense');
	});
});
