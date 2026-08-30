import { db } from '$lib/data/db';
import { normalizeAccount, type Account } from '$lib/domain/account';
import type { CategoryGroupRow, CategoryRow } from '$lib/data/db';
import type { LedgerTransaction } from '$lib/domain/transaction';
import { withVoidedAt } from '$lib/domain/transaction';
import type { Goal } from '$lib/domain/goals';
import type { NetWorthSnapshot } from '$lib/domain/net-worth';
import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
} from '$lib/data/db';
import { sealAllSensitiveFields } from '$lib/application/field-crypto';
import { ensureLocalDek, isLockEnabled, verifyPassphrase } from '$lib/application/lock';
import { getDataKey, setDataKey } from '$lib/data/session-key';
import { assignSortOrdersByName } from '$lib/domain/category-order';
import { todayOccurredOn } from '$lib/domain/transaction-rules';
import { pickNearestGoalForMigration } from '$lib/domain/goal-migrate';
import { deleteSetting, setSetting } from '$lib/data/settings-repo';
import {
	exportRawDek,
	KDF_ID,
	PBKDF2_ITERATIONS,
	unwrapDek,
	wrapDek,
	type WrapEnvelope
} from '$lib/application/wrap';

export const BACKUP_FORMAT_VERSION = 2 as const;

export type LedgerBackup = {
	formatVersion: typeof BACKUP_FORMAT_VERSION;
	exportedAt: string;
	accounts: Account[];
	categories: CategoryRow[];
	categoryGroups: CategoryGroupRow[];
	transactions: LedgerTransaction[];
	goals: Goal[];
	netWorthSnapshots: NetWorthSnapshot[];
	settings: { key: string; value: string }[];
};

/** Encrypted file envelope (Spec 120). Rows are stored as in IndexedDB. */
export type EncryptedBackup = WrapEnvelope & {
	formatVersion: typeof BACKUP_FORMAT_VERSION;
	deviceLock: boolean;
	exportedAt: string;
	accounts: Account[];
	categories: CategoryRow[];
	categoryGroups: CategoryGroupRow[];
	transactions: LedgerTransaction[];
	goals: Goal[];
	netWorthSnapshots: NetWorthSnapshot[];
	settings: { key: string; value: string }[];
};

const SECRET_SETTING_KEYS = new Set([
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
]);

async function collectSealedSnapshot(): Promise<
	Omit<LedgerBackup, 'formatVersion' | 'exportedAt'>
> {
	const [accounts, categories, categoryGroups, transactions, goals, netWorthSnapshots, settings] =
		await Promise.all([
			db.accounts.toArray(),
			db.categories.toArray(),
			db.categoryGroups.toArray(),
			db.transactions.toArray(),
			db.goals.toArray(),
			db.netWorthSnapshots.toArray(),
			db.settings.toArray()
		]);

	return {
		accounts,
		categories: categories.map((c) => ({
			...c,
			deletedAt: c.deletedAt ?? null,
			groupId: c.groupId ?? '',
			icon: c.icon || 'tag',
			hidden: c.hidden === true
		})),
		categoryGroups,
		transactions: transactions.map((t) => withVoidedAt(t)),
		goals,
		netWorthSnapshots,
		settings: settings.filter((s) => !SECRET_SETTING_KEYS.has(s.key))
	};
}

/** Sealed-row snapshot (not a downloadable file). */
export async function buildBackup(): Promise<LedgerBackup> {
	const collections = await collectSealedSnapshot();
	return {
		formatVersion: BACKUP_FORMAT_VERSION,
		exportedAt: new Date().toISOString(),
		...collections
	};
}

export async function buildEncryptedBackup(passphrase: string): Promise<EncryptedBackup> {
	if (passphrase.length < 8) {
		throw new Error('Passphrase must be at least 8 characters');
	}
	const status = await ensureLocalDek();
	if (status === 'needs-passphrase') {
		throw new Error('Unlock this device before exporting');
	}
	const dek = getDataKey();
	if (!dek) throw new Error('Missing data key');
	if ((await isLockEnabled()) && !(await verifyPassphrase(passphrase))) {
		throw new Error('Incorrect passphrase');
	}
	const envelope = await wrapDek(dek, passphrase);
	const collections = await collectSealedSnapshot();
	return {
		formatVersion: BACKUP_FORMAT_VERSION,
		deviceLock: await isLockEnabled(),
		exportedAt: new Date().toISOString(),
		...envelope,
		...collections
	};
}

export function parseBackupJson(raw: string): LedgerBackup {
	return snapshotFromUnknown(parseJsonObject(raw));
}

export function parseEncryptedBackupJson(raw: string): EncryptedBackup {
	const backup = parseJsonObject(raw);
	if (backup.formatVersion === 1) {
		throw new Error('Plaintext backups (formatVersion 1) are no longer supported');
	}
	if (backup.formatVersion !== BACKUP_FORMAT_VERSION) {
		throw new Error('Unsupported backup version');
	}
	if (
		backup.kdf !== KDF_ID ||
		typeof backup.saltB64 !== 'string' ||
		typeof backup.wrappedDekB64 !== 'string' ||
		typeof backup.iterations !== 'number'
	) {
		throw new Error('Backup is missing encryption envelope');
	}
	const snapshot = snapshotFromUnknown(backup);
	return {
		...snapshot,
		kdf: KDF_ID,
		iterations: backup.iterations,
		saltB64: backup.saltB64,
		wrappedDekB64: backup.wrappedDekB64,
		deviceLock: backup.deviceLock === true
	};
}

export async function restoreEncryptedBackup(
	file: EncryptedBackup,
	passphrase: string
): Promise<void> {
	const dek = await unwrapDek(file, passphrase);
	if (!dek) throw new Error('Incorrect passphrase');
	setDataKey(dek);
	await restoreBackup(file);
	if (file.deviceLock) {
		const envelope = await wrapDek(dek, passphrase);
		await setSetting(SETTINGS_WRAPPED_DEK, JSON.stringify(envelope));
		await deleteSetting(SETTINGS_RAW_DEK);
		await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'true');
	} else {
		await setSetting(SETTINGS_RAW_DEK, await exportRawDek(dek));
		await deleteSetting(SETTINGS_WRAPPED_DEK);
		await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'false');
	}
}

export async function restoreBackup(backup: LedgerBackup): Promise<void> {
	const normalized = snapshotFromUnknown(backup);
	const today = todayOccurredOn();
	let accounts = (normalized.accounts as Account[]).map((a, index) =>
		normalizeAccount(a, {
			today,
			isMain: a.isMain === true,
			sortOrder: typeof a.sortOrder === 'number' ? a.sortOrder : index
		})
	);
	if (accounts.length > 0 && !accounts.some((a) => a.isMain)) {
		const mainId = accounts.find((a) => a.name === 'Main')?.id ?? accounts[0]!.id;
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
		[
			db.accounts,
			db.categories,
			db.categoryGroups,
			db.transactions,
			db.goals,
			db.netWorthSnapshots,
			db.settings
		],
		async () => {
			await Promise.all([
				db.accounts.clear(),
				db.categories.clear(),
				db.categoryGroups.clear(),
				db.transactions.clear(),
				db.goals.clear(),
				db.netWorthSnapshots.clear(),
				db.settings.clear()
			]);
			await db.accounts.bulkPut(accounts);
			const categories = (
				normalized.categories as Array<
					CategoryRow & { sortOrder?: number; deletedAt?: string | null; groupId?: string; icon?: string; hidden?: boolean }
				>
			).map((c) => ({
				...c,
				deletedAt: typeof c.deletedAt === 'string' && c.deletedAt ? c.deletedAt : null,
				groupId: typeof c.groupId === 'string' ? c.groupId : '',
				icon: typeof c.icon === 'string' && c.icon ? c.icon : 'tag',
				hidden: c.hidden === true
			}));
			const toPut = categories.every((c) => typeof c.sortOrder === 'number')
				? categories
				: assignSortOrdersByName(categories);
			await db.categories.bulkPut(toPut);
			await db.categoryGroups.bulkPut(normalized.categoryGroups ?? []);
			await db.transactions.bulkPut(
				normalized.transactions.map((t) =>
					withVoidedAt({ ...t, voidedAt: t.voidedAt ?? null, feeMinor: t.feeMinor })
				)
			);
			/* Goals live on pockets now; leave goals table empty after migrate. */
			await db.netWorthSnapshots.bulkPut(normalized.netWorthSnapshots);
			await db.settings.bulkPut(normalized.settings.filter((s) => !SECRET_SETTING_KEYS.has(s.key)));
		}
	);
	if (getDataKey()) {
		await sealAllSensitiveFields(getDataKey()!);
	}
}

export function backupFilename(now = new Date()): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `pocket-ledger-${y}-${m}-${d}.json`;
}

function parseJsonObject(raw: string): Record<string, unknown> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error('Backup file is not valid JSON');
	}
	if (!parsed || typeof parsed !== 'object') {
		throw new Error('Invalid backup');
	}
	return parsed as Record<string, unknown>;
}

function snapshotFromUnknown(parsed: object): LedgerBackup {
	const backup = parsed as {
		formatVersion?: unknown;
		exportedAt?: string;
		accounts?: Account[];
		categories?: CategoryRow[];
		categoryGroups?: CategoryGroupRow[];
		transactions?: LedgerTransaction[];
		goals?: Goal[];
		netWorthSnapshots?: NetWorthSnapshot[];
		settings?: { key: string; value: string }[];
		recurringRules?: unknown;
	};
	if (backup.formatVersion === 1) {
		throw new Error('Plaintext backups (formatVersion 1) are no longer supported');
	}
	if (backup.formatVersion != null && backup.formatVersion !== BACKUP_FORMAT_VERSION) {
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
		categoryGroups: backup.categoryGroups ?? [],
		transactions: (backup.transactions ?? []).map((t) => withVoidedAt(t as LedgerTransaction)),
		goals: (backup.goals ?? []).map((g) => ({
			...g,
			targetOn: typeof g.targetOn === 'string' && g.targetOn.trim() ? g.targetOn : '2099-12-31',
			savedMinor: typeof g.savedMinor === 'number' ? g.savedMinor : 0
		})),
		netWorthSnapshots: backup.netWorthSnapshots ?? [],
		settings: (backup.settings ?? []).filter((s) => !SECRET_SETTING_KEYS.has(s.key))
	};
}
