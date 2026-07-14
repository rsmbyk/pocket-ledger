import Dexie, { type EntityTable } from 'dexie';
import type { Account } from '$lib/domain/account';
import type { LedgerTransaction } from '$lib/domain/transaction';
import type { RecurringRule } from '$lib/domain/recurring';
import type { Goal } from '$lib/domain/goals';
import type { NetWorthSnapshot } from '$lib/domain/net-worth';

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
	recurringRules!: EntityTable<RecurringRule, 'id'>;
	goals!: EntityTable<Goal, 'id'>;
	netWorthSnapshots!: EntityTable<NetWorthSnapshot, 'id'>;

	constructor() {
		super('pocket-ledger');
		this.version(1).stores({
			accounts: 'id, name',
			categories: 'id, kind, name',
			transactions: 'id, accountId, type, occurredOn, categoryId',
			settings: 'key'
		});
		this.version(2)
			.stores({
				accounts: 'id, name',
				categories: 'id, kind, name',
				transactions: 'id, accountId, type, occurredOn, categoryId',
				settings: 'key',
				recurringRules: 'id, accountId, nextOccurredOn, active',
				goals: 'id, name',
				netWorthSnapshots: 'id, capturedOn'
			})
			.upgrade(async () => {
				/* new tables only */
			});
	}
}

export const db = new PocketLedgerDb();

export const SETTINGS_ENCRYPTION_ENABLED = 'encryption.enabled';
export const SETTINGS_LOCK_SALT = 'lock.salt';
export const SETTINGS_LOCK_VERIFIER = 'lock.verifier';
