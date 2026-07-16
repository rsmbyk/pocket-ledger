import { countCategories, listCategories, listCategoriesByKind, putCategory } from '$lib/data/category-repo';
import {
	getTransaction,
	listTransactionsForAccount,
	putTransaction
} from '$lib/data/transaction-repo';
import { DEFAULT_CATEGORIES } from '$lib/domain/categories';
import type { CategoryRow } from '$lib/data/db';
import { isVoided, type LedgerTransaction, type TransactionId } from '$lib/domain/transaction';
import {
	isValidOccurredOn,
	parseAmountInput,
	sumBalance,
	todayOccurredOn,
	type AddableTransactionType
} from '$lib/domain/transaction-rules';
import { openField, sealField } from '$lib/application/field-crypto';

export type AddTransactionInput = {
	accountId: string;
	type: AddableTransactionType;
	amountRaw: string;
	categoryId: string;
	note?: string;
	occurredOn?: string;
};

export type UpdateTransactionInput = AddTransactionInput & {
	id: TransactionId;
};

function createId(): string {
	return crypto.randomUUID();
}

async function revealCategories(rows: CategoryRow[]): Promise<CategoryRow[]> {
	return Promise.all(
		rows.map(async (c) => ({
			...c,
			name: await openField(c.name)
		}))
	);
}

export async function ensureSeedCategories(): Promise<CategoryRow[]> {
	if ((await countCategories()) > 0) {
		return revealCategories(await listCategories());
	}

	const now = new Date().toISOString();
	for (const seed of DEFAULT_CATEGORIES) {
		await putCategory({
			id: createId(),
			name: await sealField(seed.name),
			kind: seed.kind,
			createdAt: now
		});
	}
	return revealCategories(await listCategories());
}

export async function getCategoriesForType(
	type: AddableTransactionType
): Promise<CategoryRow[]> {
	await ensureSeedCategories();
	return revealCategories(await listCategoriesByKind(type));
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

	const notePlain = (input.note ?? '').trim();
	const tx: LedgerTransaction = {
		id: createId(),
		accountId: input.accountId,
		counterAccountId: null,
		type: input.type,
		amountMinor,
		categoryId: category.id,
		note: await sealField(notePlain),
		occurredOn,
		createdAt: new Date().toISOString(),
		voidedAt: null
	};

	await putTransaction(tx);
	return { ...tx, note: notePlain };
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<LedgerTransaction> {
	const existing = await getTransaction(input.id);
	if (!existing) throw new Error('Transaction not found');
	if (isVoided(existing)) throw new Error('Voided transactions cannot be edited');

	const amountMinor = parseAmountInput(input.amountRaw);
	const occurredOn = input.occurredOn ?? existing.occurredOn;
	if (!isValidOccurredOn(occurredOn)) {
		throw new Error('Date must be YYYY-MM-DD');
	}

	const categories = await getCategoriesForType(input.type);
	const category = categories.find((c) => c.id === input.categoryId);
	if (!category) {
		throw new Error('Choose a category for this type');
	}

	const notePlain = (input.note ?? '').trim();
	const tx: LedgerTransaction = {
		...existing,
		accountId: input.accountId,
		type: input.type,
		amountMinor,
		categoryId: category.id,
		note: await sealField(notePlain),
		occurredOn,
		voidedAt: null
	};
	await putTransaction(tx);
	return { ...tx, note: notePlain };
}

/** Irreversibly void a transaction (keeps the row; excludes from balances). */
export async function voidTransaction(id: TransactionId): Promise<void> {
	const existing = await getTransaction(id);
	if (!existing) throw new Error('Transaction not found');
	if (isVoided(existing)) throw new Error('Transaction is already voided');
	await putTransaction({
		...existing,
		voidedAt: new Date().toISOString()
	});
}

/** @deprecated Use voidTransaction — hard delete removed from UI. */
export async function removeTransaction(id: TransactionId): Promise<void> {
	await voidTransaction(id);
}

export async function listRecentTransactions(accountId: string): Promise<LedgerTransaction[]> {
	const rows = await listTransactionsForAccount(accountId);
	return Promise.all(
		rows.map(async (tx) => ({
			...tx,
			note: await openField(tx.note)
		}))
	);
}

export async function getAccountBalance(accountId: string): Promise<number> {
	const txs = await listTransactionsForAccount(accountId);
	return sumBalance(txs);
}
