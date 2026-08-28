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
	/** Positive minor units; sign comes from type for balance. */
	amountMinor: number;
	/**
	 * Transfer admin fee in minor units (Spec 106). Always `0` for income/expense.
	 * Source loses amount+fee; dest receives amount; fee counts as Admin Fee expense.
	 */
	feeMinor: number;
	categoryId: string | null;
	note: string;
	occurredOn: string;
	createdAt: string;
	/** ISO timestamp when voided; null = active. */
	voidedAt: string | null;
};

/** True when the transaction has been voided. */
export function isVoided(tx: Pick<LedgerTransaction, 'voidedAt'>): boolean {
	return Boolean(tx.voidedAt);
}

/** Normalize legacy rows missing voidedAt and/or feeMinor. */
export function withVoidedAt(
	tx: Omit<LedgerTransaction, 'voidedAt' | 'feeMinor'> & {
		voidedAt?: string | null;
		feeMinor?: number | null;
	}
): LedgerTransaction {
	const fee = tx.feeMinor;
	const feeMinor =
		typeof fee === 'number' && Number.isInteger(fee) && fee >= 0 ? fee : 0;
	return { ...tx, voidedAt: tx.voidedAt ?? null, feeMinor };
}
