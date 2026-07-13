import { db } from '$lib/data/db';
import type { Account, AccountId } from '$lib/domain/account';

export async function listAccounts(): Promise<Account[]> {
	return db.accounts.orderBy('name').toArray();
}

export async function getAccount(id: AccountId): Promise<Account | undefined> {
	return db.accounts.get(id);
}

export async function putAccount(account: Account): Promise<void> {
	await db.accounts.put(account);
}

export async function countAccounts(): Promise<number> {
	return db.accounts.count();
}
