import { db } from '$lib/data/db';
import { withVoidedAt, type LedgerTransaction, type TransactionId } from '$lib/domain/transaction';

export async function putTransaction(tx: LedgerTransaction): Promise<void> {
	await db.transactions.put(withVoidedAt(tx));
}

export async function listTransactionsForAccount(
	accountId: string
): Promise<LedgerTransaction[]> {
	const rows = await db.transactions.where('accountId').equals(accountId).toArray();
	return rows
		.map((row) => withVoidedAt(row))
		.sort((a, b) => {
			if (a.occurredOn === b.occurredOn) {
				return b.createdAt.localeCompare(a.createdAt);
			}
			return b.occurredOn.localeCompare(a.occurredOn);
		});
}

export async function getTransaction(id: TransactionId): Promise<LedgerTransaction | undefined> {
	const row = await db.transactions.get(id);
	return row ? withVoidedAt(row) : undefined;
}

export async function deleteTransaction(id: TransactionId): Promise<void> {
	await db.transactions.delete(id);
}
