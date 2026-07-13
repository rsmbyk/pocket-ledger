import Dexie, { type EntityTable } from 'dexie';
import type { Account } from '$lib/domain/account';
import type { LedgerTransaction } from '$lib/domain/transaction';

export type CategoryRow = {
	id: string;
	name: string;
	kind: 'income' | 'expense';
	createdAt: string;
};

export type SettingsRow = {
	key: string;
	value: string;
};

export class PocketLedgerDb extends Dexie {
	accounts!: EntityTable<Account, 'id'>;
	categories!: EntityTable<CategoryRow, 'id'>;
	transactions!: EntityTable<LedgerTransaction, 'id'>;
	settings!: EntityTable<SettingsRow, 'key'>;

	constructor() {
		super('pocket-ledger');
		this.version(1).stores({
			accounts: 'id, name',
			categories: 'id, kind, name',
			transactions: 'id, accountId, type, occurredOn, categoryId',
			settings: 'key'
		});
	}
}

export const db = new PocketLedgerDb();

/** Settings key for future optional encryption; default is off. */
export const SETTINGS_ENCRYPTION_ENABLED = 'encryption.enabled';
