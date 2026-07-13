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
