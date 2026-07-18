import { db } from '$lib/data/db';
import {
	listPocketsOrdered,
	normalizeAccount,
	type Account,
	type AccountId
} from '$lib/domain/account';
import { todayOccurredOn } from '$lib/domain/transaction-rules';

export async function listAccounts(): Promise<Account[]> {
	const rows = await db.accounts.toArray();
	const today = todayOccurredOn();
	const normalized = rows.map((row) => normalizeAccount(row, { today }));
	return listPocketsOrdered(normalized);
}

export async function getAccount(id: AccountId): Promise<Account | undefined> {
	const row = await db.accounts.get(id);
	return row ? normalizeAccount(row, { today: todayOccurredOn() }) : undefined;
}

export async function putAccount(account: Account): Promise<void> {
	await db.accounts.put(normalizeAccount(account, { today: todayOccurredOn() }));
}

export async function deleteAccount(id: AccountId): Promise<void> {
	await db.accounts.delete(id);
}

export async function countAccounts(): Promise<number> {
	return db.accounts.count();
}
