import { db } from '$lib/data/db';
import { normalizeAccount, type Account } from '$lib/domain/account';
import type { CategoryRow } from '$lib/data/db';
import type { LedgerTransaction } from '$lib/domain/transaction';
import type { Goal } from '$lib/domain/goals';
import type { NetWorthSnapshot } from '$lib/domain/net-worth';
import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER
} from '$lib/data/db';
import { openField, sealAllSensitiveFields } from '$lib/application/field-crypto';
import { isLockEnabled } from '$lib/application/lock';
import { getDataKey } from '$lib/data/session-key';
import { assignSortOrdersByName } from '$lib/domain/category-order';
import { todayOccurredOn } from '$lib/domain/transaction-rules';
import { pickNearestGoalForMigration } from '$lib/domain/goal-migrate';

export const BACKUP_FORMAT_VERSION = 1 as const;

export type LedgerBackup = {
	formatVersion: typeof BACKUP_FORMAT_VERSION;
	exportedAt: string;
	accounts: Account[];
	categories: CategoryRow[];
	transactions: LedgerTransaction[];
	goals: Goal[];
	netWorthSnapshots: NetWorthSnapshot[];
	settings: { key: string; value: string }[];
};

const SECRET_SETTING_KEYS = new Set([
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_ENCRYPTION_ENABLED
]);

export async function buildBackup(): Promise<LedgerBackup> {
	const [accounts, categories, transactions, goals, netWorthSnapshots, settings] =
		await Promise.all([
			db.accounts.toArray(),
			db.categories.toArray(),
			db.transactions.toArray(),
			db.goals.toArray(),
			db.netWorthSnapshots.toArray(),
			db.settings.toArray()
		]);

	return {
		formatVersion: BACKUP_FORMAT_VERSION,
		exportedAt: new Date().toISOString(),
		accounts,
		categories: await Promise.all(
			categories.map(async (c) => ({ ...c, name: await openField(c.name) }))
		),
		transactions: await Promise.all(
			transactions.map(async (t) => ({
				...t,
				voidedAt: t.voidedAt ?? null,
				note: await openField(t.note)
			}))
		),
		goals: await Promise.all(goals.map(async (g) => ({ ...g, name: await openField(g.name) }))),
		netWorthSnapshots,
		settings: settings.filter((s) => !SECRET_SETTING_KEYS.has(s.key))
	};
}

export function parseBackupJson(raw: string): LedgerBackup {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error('Backup file is not valid JSON');
	}
	if (!parsed || typeof parsed !== 'object') {
		throw new Error('Invalid backup');
	}
	const backup = parsed as LedgerBackup & { recurringRules?: unknown };
	if (backup.formatVersion !== BACKUP_FORMAT_VERSION) {
		throw new Error('Unsupported backup version');
	}
	if (!Array.isArray(backup.accounts) || !Array.isArray(backup.transactions)) {
		throw new Error('Backup is missing required collections');
	}
	return {
		formatVersion: BACKUP_FORMAT_VERSION,
		exportedAt: backup.exportedAt ?? new Date().toISOString(),
		accounts: backup.accounts ?? [],
		categories: backup.categories ?? [],
		transactions: backup.transactions ?? [],
		goals: (backup.goals ?? []).map((g) => ({
			...g,
			targetOn: typeof g.targetOn === 'string' && g.targetOn.trim() ? g.targetOn : '2099-12-31',
			savedMinor: typeof g.savedMinor === 'number' ? g.savedMinor : 0
		})),
		netWorthSnapshots: backup.netWorthSnapshots ?? [],
		settings: (backup.settings ?? []).filter((s) => !SECRET_SETTING_KEYS.has(s.key))
	};
}

export async function restoreBackup(backup: LedgerBackup): Promise<void> {
	const normalized = parseBackupJson(JSON.stringify(backup));
	const today = todayOccurredOn();
	let accounts = (normalized.accounts as Account[]).map((a, index) =>
		normalizeAccount(a, {
			today,
			isMain: a.isMain === true,
			sortOrder: typeof a.sortOrder === 'number' ? a.sortOrder : index
		})
	);
	if (accounts.length > 0 && !accounts.some((a) => a.isMain)) {
		const mainId =
			accounts.find((a) => a.name === 'Main')?.id ?? accounts[0]!.id;
		accounts = accounts.map((a, index) =>
			normalizeAccount(a, {
				today,
				isMain: a.id === mainId,
				sortOrder: a.id === mainId ? 0 : index
			})
		);
	}
	if (normalized.goals.length > 0) {
		const main = accounts.find((a) => a.isMain);
		if (main && main.goalTargetMinor == null) {
			const pick = pickNearestGoalForMigration(normalized.goals);
			if (pick) {
				accounts = accounts.map((a) =>
					a.id === main.id
						? {
								...a,
								goalTargetMinor: pick.targetMinor,
								goalTargetOn: pick.targetOn
							}
						: a
				);
			}
		}
	}

	await db.transaction(
		'rw',
		[db.accounts, db.categories, db.transactions, db.goals, db.netWorthSnapshots, db.settings],
		async () => {
			await Promise.all([
				db.accounts.clear(),
				db.categories.clear(),
				db.transactions.clear(),
				db.goals.clear(),
				db.netWorthSnapshots.clear(),
				db.settings.clear()
			]);
			await db.accounts.bulkPut(accounts);
			const categories = normalized.categories as Array<
				CategoryRow & { sortOrder?: number }
			>;
			const toPut = categories.every((c) => typeof c.sortOrder === 'number')
				? categories
				: assignSortOrdersByName(categories);
			await db.categories.bulkPut(toPut);
			await db.transactions.bulkPut(
				normalized.transactions.map((t) => ({ ...t, voidedAt: t.voidedAt ?? null }))
			);
			/* Goals live on pockets now; leave goals table empty after migrate. */
			await db.netWorthSnapshots.bulkPut(normalized.netWorthSnapshots);
			await db.settings.bulkPut(normalized.settings);
		}
	);
	if ((await isLockEnabled()) && getDataKey()) {
		await sealAllSensitiveFields(getDataKey()!);
	}
}

export function backupFilename(now = new Date()): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `pocket-ledger-${y}-${m}-${d}.json`;
}
