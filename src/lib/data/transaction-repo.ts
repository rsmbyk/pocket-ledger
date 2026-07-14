import { db } from '$lib/data/db';
import type { LedgerTransaction, TransactionId } from '$lib/domain/transaction';

export async function putTransaction(tx: LedgerTransaction): Promise<void> {
	await db.transactions.put(tx);
}

export async function listTransactionsForAccount(
	accountId: string
): Promise<LedgerTransaction[]> {
	const rows = await db.transactions.where('accountId').equals(accountId).toArray();
	return rows.sort((a, b) => {
		if (a.occurredOn === b.occurredOn) {
			return b.createdAt.localeCompare(a.createdAt);
		}
		return b.occurredOn.localeCompare(a.occurredOn);
	});
}

export async function getTransaction(id: TransactionId): Promise<LedgerTransaction | undefined> {
	return db.transactions.get(id);
}

export async function deleteTransaction(id: TransactionId): Promise<void> {
	await db.transactions.delete(id);
}
