import { db } from '$lib/data/db';
import type { Account } from '$lib/domain/account';
import type { CategoryRow } from '$lib/data/db';
import type { LedgerTransaction } from '$lib/domain/transaction';
import type { RecurringRule } from '$lib/domain/recurring';
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

export const BACKUP_FORMAT_VERSION = 1 as const;

export type LedgerBackup = {
	formatVersion: typeof BACKUP_FORMAT_VERSION;
	exportedAt: string;
	accounts: Account[];
	categories: CategoryRow[];
	transactions: LedgerTransaction[];
	recurringRules: RecurringRule[];
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
	const [accounts, categories, transactions, recurringRules, goals, netWorthSnapshots, settings] =
		await Promise.all([
			db.accounts.toArray(),
			db.categories.toArray(),
			db.transactions.toArray(),
			db.recurringRules.toArray(),
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
		recurringRules: await Promise.all(
			recurringRules.map(async (r) => ({ ...r, note: await openField(r.note) }))
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
	const backup = parsed as LedgerBackup;
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
		recurringRules: backup.recurringRules ?? [],
		goals: backup.goals ?? [],
		netWorthSnapshots: backup.netWorthSnapshots ?? [],
		settings: (backup.settings ?? []).filter((s) => !SECRET_SETTING_KEYS.has(s.key))
	};
}

export async function restoreBackup(backup: LedgerBackup): Promise<void> {
	const normalized = parseBackupJson(JSON.stringify(backup));
	await db.transaction(
		'rw',
		[
			db.accounts,
			db.categories,
			db.transactions,
			db.recurringRules,
			db.goals,
			db.netWorthSnapshots,
			db.settings
		],
		async () => {
			await Promise.all([
				db.accounts.clear(),
				db.categories.clear(),
				db.transactions.clear(),
				db.recurringRules.clear(),
				db.goals.clear(),
				db.netWorthSnapshots.clear(),
				db.settings.clear()
			]);
			await db.accounts.bulkPut(normalized.accounts);
			await db.categories.bulkPut(normalized.categories);
			await db.transactions.bulkPut(
				normalized.transactions.map((t) => ({ ...t, voidedAt: t.voidedAt ?? null }))
			);
			await db.recurringRules.bulkPut(normalized.recurringRules);
			await db.goals.bulkPut(normalized.goals);
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
