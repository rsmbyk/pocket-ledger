import Dexie, { type EntityTable } from 'dexie';
import { normalizeAccount, type Account } from '$lib/domain/account';
import type { LedgerTransaction } from '$lib/domain/transaction';
import type { RecurringRule } from '$lib/domain/recurring';
import type { Goal } from '$lib/domain/goals';
import type { NetWorthSnapshot } from '$lib/domain/net-worth';
import { assignSortOrdersByName } from '$lib/domain/category-order';
import { pickNearestGoalForMigration } from '$lib/domain/goal-migrate';
import { todayOccurredOn } from '$lib/domain/transaction-rules';

export type CategoryRow = {
	id: string;
	name: string;
	kind: 'income' | 'expense';
	sortOrder: number;
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
		this.version(3)
			.stores({
				accounts: 'id, name',
				categories: 'id, kind, name, sortOrder',
				transactions: 'id, accountId, type, occurredOn, categoryId',
				settings: 'key',
				recurringRules: 'id, accountId, nextOccurredOn, active',
				goals: 'id, name',
				netWorthSnapshots: 'id, capturedOn'
			})
			.upgrade(async (tx) => {
				const table = tx.table('categories');
				const rows = (await table.toArray()) as Array<{
					id: string;
					name: string;
					kind: 'income' | 'expense';
					createdAt: string;
					sortOrder?: number;
				}>;
				const assigned = assignSortOrdersByName(rows);
				for (const row of assigned) {
					await table.put(row);
				}
			});
		this.version(4)
			.stores({
				accounts: 'id, name, sortOrder, isMain',
				categories: 'id, kind, name, sortOrder',
				transactions: 'id, accountId, type, occurredOn, categoryId',
				settings: 'key',
				recurringRules: 'id, accountId, nextOccurredOn, active',
				goals: 'id, name',
				netWorthSnapshots: 'id, capturedOn'
			})
			.upgrade(async (tx) => {
				const today = todayOccurredOn();
				const accounts = tx.table('accounts');
				const rows = (await accounts.toArray()) as Array<Record<string, unknown>>;
				if (rows.length === 0) return;

				let mainId: string | null = null;
				const namedMain = rows.find((r) => r.name === 'Main');
				if (namedMain && typeof namedMain.id === 'string') {
					mainId = namedMain.id;
				} else if (typeof rows[0]?.id === 'string') {
					mainId = rows[0].id;
				}

				const nonMain = rows.filter((r) => r.id !== mainId);
				nonMain.sort((a, b) =>
					String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''))
				);

				for (const row of rows) {
					const id = String(row.id);
					const isMain = id === mainId;
					const sortOrder = isMain
						? 0
						: nonMain.findIndex((r) => r.id === id);
					const normalized = normalizeAccount(
						{
							id,
							name: String(row.name ?? 'Pocket'),
							currencyLabel: String(row.currencyLabel ?? 'IDR'),
							createdAt: String(row.createdAt ?? new Date().toISOString()),
							isMain,
							sortOrder: sortOrder < 0 ? 0 : sortOrder,
							notes: typeof row.notes === 'string' ? row.notes : '',
							openingBalanceMinor:
								typeof row.openingBalanceMinor === 'number' ? row.openingBalanceMinor : 0,
							openingAsOf:
								typeof row.openingAsOf === 'string' && row.openingAsOf
									? row.openingAsOf
									: today,
							goalTargetMinor:
								typeof row.goalTargetMinor === 'number' ? row.goalTargetMinor : null,
							goalTargetOn:
								typeof row.goalTargetOn === 'string' ? row.goalTargetOn : null
						},
						{ today, isMain, sortOrder: sortOrder < 0 ? 0 : sortOrder }
					);
					await accounts.put(normalized);
				}

				const goalsTable = tx.table('goals');
				const goals = (await goalsTable.toArray()) as Goal[];
				if (goals.length > 0 && mainId) {
					const main = (await accounts.get(mainId)) as Account | undefined;
					if (main && main.goalTargetMinor == null) {
						const pick = pickNearestGoalForMigration(goals);
						if (pick) {
							await accounts.put({
								...main,
								goalTargetMinor: pick.targetMinor,
								goalTargetOn: pick.targetOn
							});
						}
					}
					await goalsTable.clear();
				}
			});
	}
}

export const db = new PocketLedgerDb();

export const SETTINGS_ENCRYPTION_ENABLED = 'encryption.enabled';
export const SETTINGS_LOCK_SALT = 'lock.salt';
export const SETTINGS_LOCK_VERIFIER = 'lock.verifier';
