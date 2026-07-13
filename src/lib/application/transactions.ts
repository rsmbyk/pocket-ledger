import { countCategories, listCategories, listCategoriesByKind, putCategory } from '$lib/data/category-repo';
import { listTransactionsForAccount, putTransaction } from '$lib/data/transaction-repo';
import { DEFAULT_CATEGORIES } from '$lib/domain/categories';
import type { CategoryRow } from '$lib/data/db';
import type { LedgerTransaction } from '$lib/domain/transaction';
import {
	isValidOccurredOn,
	parseAmountInput,
	sumBalance,
	todayOccurredOn,
	type AddableTransactionType
} from '$lib/domain/transaction-rules';

export type AddTransactionInput = {
	accountId: string;
	type: AddableTransactionType;
	amountRaw: string;
	categoryId: string;
	note?: string;
	occurredOn?: string;
};

function createId(): string {
	return crypto.randomUUID();
}

export async function ensureSeedCategories(): Promise<CategoryRow[]> {
	if ((await countCategories()) > 0) {
		return listCategories();
	}

	const now = new Date().toISOString();
	for (const seed of DEFAULT_CATEGORIES) {
		await putCategory({
			id: createId(),
			name: seed.name,
			kind: seed.kind,
			createdAt: now
		});
	}
	return listCategories();
}

export async function getCategoriesForType(
	type: AddableTransactionType
): Promise<CategoryRow[]> {
	await ensureSeedCategories();
	return listCategoriesByKind(type);
}

export async function addTransaction(input: AddTransactionInput): Promise<LedgerTransaction> {
	const amountMinor = parseAmountInput(input.amountRaw);
	const occurredOn = input.occurredOn ?? todayOccurredOn();
	if (!isValidOccurredOn(occurredOn)) {
		throw new Error('Date must be YYYY-MM-DD');
	}

	const categories = await getCategoriesForType(input.type);
	const category = categories.find((c) => c.id === input.categoryId);
	if (!category) {
		throw new Error('Choose a category for this type');
	}

	const tx: LedgerTransaction = {
		id: createId(),
		accountId: input.accountId,
		counterAccountId: null,
		type: input.type,
		amountMinor,
		categoryId: category.id,
		note: (input.note ?? '').trim(),
		occurredOn,
		createdAt: new Date().toISOString()
	};

	await putTransaction(tx);
	return tx;
}

export async function listRecentTransactions(accountId: string): Promise<LedgerTransaction[]> {
	return listTransactionsForAccount(accountId);
}

export async function getAccountBalance(accountId: string): Promise<number> {
	const txs = await listTransactionsForAccount(accountId);
	return sumBalance(txs);
}
