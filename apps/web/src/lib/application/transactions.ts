import {
	ensureCategoryCatalog,
	listAllCategories,
	listCategories,
	listCategoriesByKind
} from '$lib/application/categories';
import {
	getTransaction,
	listAllTransactions,
	listTransactionsForAccount,
	putTransaction
} from '$lib/data/transaction-repo';
import { listAccounts, getAccount } from '$lib/data/account-repo';
import type { CategoryRow } from '$lib/data/db';
import { isVoided, type LedgerTransaction, type TransactionId } from '$lib/domain/transaction';
import {
	isValidOccurredOn,
	parseAmountInput,
	todayOccurredOn,
	type AddableTransactionType
} from '$lib/domain/transaction-rules';
import { openField, sealField } from '$lib/application/field-crypto';
import { derivePocketBalance, sumAllPocketBalances } from '$lib/domain/pocket-balance';
import {
	assertTypeImmutable,
	buildTransferFields,
	type TransferInput
} from '$lib/domain/transfer-rules';

export type AddTransactionInput = {
	accountId: string;
	type: AddableTransactionType;
	amountRaw: string;
	/** Empty / omitted → uncategorized (`categoryId: null`). */
	categoryId?: string | null;
	note?: string;
	occurredOn?: string;
};

export type UpdateTransactionInput = AddTransactionInput & {
	id: TransactionId;
};

export type UpdateTransferInput = TransferInput & {
	id: TransactionId;
};

function createId(): string {
	return crypto.randomUUID();
}

/** Resolves the overlay catalog; never inserts stock rows (spec 123). */
export async function ensureSeedCategories(): Promise<CategoryRow[]> {
	await ensureCategoryCatalog();
	return listCategories();
}

export async function getCategoriesForType(type: AddableTransactionType): Promise<CategoryRow[]> {
	await ensureCategoryCatalog();
	return listCategoriesByKind(type);
}

export async function addTransaction(input: AddTransactionInput): Promise<LedgerTransaction> {
	const amountMinor = parseAmountInput(input.amountRaw);
	const occurredOn = input.occurredOn ?? todayOccurredOn();
	if (!isValidOccurredOn(occurredOn)) {
		throw new Error('Date must be YYYY-MM-DD');
	}

	const categoryId = await resolveCategoryId(input.type, input.categoryId);

	const notePlain = (input.note ?? '').trim();
	const tx: LedgerTransaction = {
		id: createId(),
		accountId: input.accountId,
		counterAccountId: null,
		type: input.type,
		amountMinor,
		feeMinor: 0,
		categoryId,
		note: await sealField(notePlain),
		occurredOn,
		createdAt: new Date().toISOString(),
		voidedAt: null
	};

	await putTransaction(tx);
	return { ...tx, note: notePlain };
}

export async function addTransfer(input: TransferInput): Promise<LedgerTransaction> {
	const fields = buildTransferFields(input);
	const source = await getAccount(fields.accountId);
	const dest = await getAccount(fields.counterAccountId);
	if (!source || !dest) throw new Error('Choose source and destination pockets');

	const tx: LedgerTransaction = {
		id: createId(),
		accountId: fields.accountId,
		counterAccountId: fields.counterAccountId,
		type: 'transfer',
		amountMinor: fields.amountMinor,
		feeMinor: fields.feeMinor,
		categoryId: null,
		note: await sealField(fields.note),
		occurredOn: fields.occurredOn,
		createdAt: new Date().toISOString(),
		voidedAt: null
	};
	await putTransaction(tx);
	return { ...tx, note: fields.note };
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<LedgerTransaction> {
	const existing = await getTransaction(input.id);
	if (!existing) throw new Error('Transaction not found');
	if (isVoided(existing)) throw new Error('Voided transactions cannot be edited');
	if (existing.type === 'transfer') {
		throw new Error('Use updateTransfer for transfer transactions');
	}
	assertTypeImmutable(existing, input.type);

	const amountMinor = parseAmountInput(input.amountRaw);
	const occurredOn = input.occurredOn ?? existing.occurredOn;
	if (!isValidOccurredOn(occurredOn)) {
		throw new Error('Date must be YYYY-MM-DD');
	}

	const categoryId = await resolveCategoryId(
		existing.type as AddableTransactionType,
		input.categoryId,
		existing.categoryId
	);

	const notePlain = (input.note ?? '').trim();
	const tx: LedgerTransaction = {
		...existing,
		accountId: input.accountId,
		type: existing.type,
		amountMinor,
		feeMinor: 0,
		categoryId,
		note: await sealField(notePlain),
		occurredOn,
		voidedAt: null
	};
	await putTransaction(tx);
	return { ...tx, note: notePlain };
}

export async function updateTransfer(input: UpdateTransferInput): Promise<LedgerTransaction> {
	const existing = await getTransaction(input.id);
	if (!existing) throw new Error('Transaction not found');
	if (isVoided(existing)) throw new Error('Voided transactions cannot be edited');
	assertTypeImmutable(existing, 'transfer');

	const fields = buildTransferFields(input);
	const source = await getAccount(fields.accountId);
	const dest = await getAccount(fields.counterAccountId);
	if (!source || !dest) throw new Error('Choose source and destination pockets');

	const tx: LedgerTransaction = {
		...existing,
		accountId: fields.accountId,
		counterAccountId: fields.counterAccountId,
		type: 'transfer',
		amountMinor: fields.amountMinor,
		feeMinor: fields.feeMinor,
		categoryId: null,
		note: await sealField(fields.note),
		occurredOn: fields.occurredOn,
		voidedAt: null
	};
	await putTransaction(tx);
	return { ...tx, note: fields.note };
}

async function resolveCategoryId(
	type: AddableTransactionType,
	raw: string | null | undefined,
	allowHiddenId?: string | null
): Promise<string | null> {
	const trimmed = (raw ?? '').trim();
	if (!trimmed) return null;
	const categories = await getCategoriesForType(type);
	const visible = categories.find((c) => c.id === trimmed);
	if (visible) return visible.id;
	if (allowHiddenId && allowHiddenId === trimmed) {
		const all = await listAllCategories();
		const hidden = all.find((c) => c.id === trimmed && c.kind === type);
		if (hidden) return hidden.id;
	}
	throw new Error('Choose a category for this type');
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

async function revealTxNotes(rows: LedgerTransaction[]): Promise<LedgerTransaction[]> {
	return Promise.all(
		rows.map(async (tx) => ({
			...tx,
			note: await openField(tx.note)
		}))
	);
}

/** All-pocket recent list (Activity + Home). */
export async function listRecentTransactions(_accountId?: string): Promise<LedgerTransaction[]> {
	const rows = await listAllTransactions();
	const revealed = await revealTxNotes(rows);
	return revealed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAccountBalance(accountId: string): Promise<number> {
	const [pocket, txs] = await Promise.all([getAccount(accountId), listAllTransactions()]);
	if (!pocket) return 0;
	return derivePocketBalance(pocket, txs);
}

/** Combined balance across all pockets (Home). */
export async function getAllPocketsBalance(): Promise<number> {
	const [pockets, txs] = await Promise.all([listAccounts(), listAllTransactions()]);
	return sumAllPocketBalances(pockets, txs);
}

export { listTransactionsForAccount };
