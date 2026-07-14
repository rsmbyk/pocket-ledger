import type { CategoryRow } from '$lib/data/db';

export const DEFAULT_CATEGORIES: Omit<CategoryRow, 'id' | 'createdAt'>[] = [
	{ name: 'Food', kind: 'expense' },
	{ name: 'Transport', kind: 'expense' },
	{ name: 'Bills', kind: 'expense' },
	{ name: 'Shopping', kind: 'expense' },
	{ name: 'Other expense', kind: 'expense' },
	{ name: 'Salary', kind: 'income' },
	{ name: 'Gift', kind: 'income' },
	{ name: 'Other income', kind: 'income' }
];

const MAX_CATEGORY_NAME = 40;

/** Trim and validate a category display name. */
export function normalizeCategoryName(raw: string): string {
	const name = raw.trim().replace(/\s+/g, ' ');
	if (!name) throw new Error('Category name is required');
	if (name.length > MAX_CATEGORY_NAME) {
		throw new Error(`Category name must be at most ${MAX_CATEGORY_NAME} characters`);
	}
	return name;
}

export function assertUniqueCategoryName(
	name: string,
	kind: CategoryRow['kind'],
	existing: CategoryRow[],
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
