/**
 * Transaction shape for a simple ledger, left open for double-entry later.
 * Transfers can become a dedicated type without rewriting storage.
 */
export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionId = string;

export type LedgerTransaction = {
	id: TransactionId;
	accountId: string;
	/** Counterparty account for future transfers; null for simple income/expense. */
	counterAccountId: string | null;
	type: TransactionType;
	/** Signed minor units relative to accountId (expense negative or use type). */
	amountMinor: number;
	categoryId: string | null;
	note: string;
	occurredOn: string;
	createdAt: string;
};
