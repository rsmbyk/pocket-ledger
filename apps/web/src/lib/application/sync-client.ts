import { db } from '$lib/data/db';
import {
	SETTINGS_CATEGORY_OVERLAY,
	SETTINGS_DISPLAY_CURRENCY,
	SETTINGS_IDLE_LEAVE_TAB,
	SETTINGS_IDLE_MINUTES,
	SETTINGS_THEME_PREFERENCE,
	SETTINGS_WRAP_REV
} from '$lib/data/db';
import { getSetting, setSetting } from '$lib/data/settings-repo';
import * as cloudApi from '$lib/application/cloud-api';
import { SyncConflictError } from '$lib/application/sync';
import { isUnauthorizedError } from '$lib/application/cloud-session';
import { DEFAULT_ACCOUNT_NAME, type Account } from '$lib/domain/account';
import { parseThemePreference, writeStoredThemePreference } from '$lib/shared/theme';

export const SYNC_KIND_TRANSACTION = 'transaction';
export const SYNC_KIND_ACCOUNT = 'account';
export const SYNC_KIND_CATEGORY = 'category';
export const SYNC_KIND_CATEGORY_GROUP = 'categoryGroup';
export const SYNC_KIND_SETTING = 'setting';
export const SYNC_KIND_GOAL = 'goal';
export const SYNC_KIND_PLAN = 'plan';

/** Settings that follow the signed-in account (Spec 241). */
export const LEDGER_SETTING_KEYS = new Set([
	SETTINGS_THEME_PREFERENCE,
	SETTINGS_IDLE_MINUTES,
	SETTINGS_IDLE_LEAVE_TAB,
	SETTINGS_DISPLAY_CURRENCY,
	SETTINGS_CATEGORY_OVERLAY
]);

function revId(kind: string, id: string): string {
	return `${kind}:${id}`;
}

export function isLedgerSettingKey(key: string): boolean {
	return LEDGER_SETTING_KEYS.has(key);
}

export async function localRev(kind: string, id: string): Promise<number | undefined> {
	const row = await db.syncRevs.get(revId(kind, id));
	return row?.rev;
}

export async function setLocalRev(kind: string, id: string, rev: number): Promise<void> {
	await db.syncRevs.put({ id: revId(kind, id), rev });
}

export async function pushSealedEntity(
	kind: string,
	id: string,
	blob: unknown,
	deleted = false
): Promise<void> {
	const rev = (await localRev(kind, id)) ?? 0;
	const saved = await cloudApi.putCloudEntity({
		id,
		kind,
		rev,
		deleted,
		blob: blob == null ? null : JSON.stringify(blob)
	});
	await setLocalRev(kind, id, saved.rev);
}

/** Signed-out / 401 → no-op. Other PUT failures propagate (signed-in catalog is online-required). */
export async function pushSealedEntityIfSignedIn(
	kind: string,
	id: string,
	blob: unknown,
	deleted = false
): Promise<void> {
	if (!cloudApi.cloudConfigured()) return;
	try {
		await pushSealedEntity(kind, id, blob, deleted);
	} catch (err) {
		if (isUnauthorizedError(err)) return;
		throw err;
	}
}

async function applySettingEntity(id: string, deleted: boolean, blob: string | null): Promise<void> {
	if (!isLedgerSettingKey(id)) return;
	if (deleted) {
		await db.settings.delete(id);
		return;
	}
	if (!blob) return;
	const row = JSON.parse(blob) as { key: string; value: string };
	const key = row.key || id;
	if (!isLedgerSettingKey(key)) return;
	await db.settings.put({ key, value: row.value });
	if (key === SETTINGS_THEME_PREFERENCE) {
		writeStoredThemePreference(parseThemePreference(row.value));
	}
}

function isSeedMain(account: Account): boolean {
	return (
		account.isMain === true &&
		account.name === DEFAULT_ACCOUNT_NAME &&
		!(account.notes && account.notes.length > 0) &&
		account.openingEnabled !== true
	);
}

async function dropUnusedLocalSeedMain(liveCloudMains: Set<string>): Promise<void> {
	if (liveCloudMains.size === 0) return;
	const locals = await db.accounts.toArray();
	const [txs, plans, goals] = await Promise.all([
		db.transactions.toArray(),
		db.plans.toArray(),
		db.goals.toArray()
	]);
	for (const account of locals) {
		if (liveCloudMains.has(account.id)) continue;
		if (!isSeedMain(account)) continue;
		const used =
			txs.some((t) => t.accountId === account.id || t.counterAccountId === account.id) ||
			plans.some((p) => p.accountId === account.id || p.counterAccountId === account.id) ||
			goals.some((g) => g.accountId === account.id);
		if (used) continue;
		await db.accounts.delete(account.id);
		await db.syncRevs.delete(revId(SYNC_KIND_ACCOUNT, account.id));
	}
}

export async function pullAndApply(): Promise<void> {
	const entities = await cloudApi.pullCloudEntities();
	const liveCloudMains = new Set<string>();
	for (const entity of entities) {
		await setLocalRev(entity.kind, entity.id, entity.rev);
		if (entity.kind === SYNC_KIND_TRANSACTION) {
			if (entity.deleted) await db.transactions.delete(entity.id);
			else if (entity.blob) await db.transactions.put(JSON.parse(entity.blob));
		} else if (entity.kind === SYNC_KIND_ACCOUNT) {
			if (entity.deleted) await db.accounts.delete(entity.id);
			else if (entity.blob) {
				const row = JSON.parse(entity.blob) as Account;
				await db.accounts.put(row);
				if (row.isMain) liveCloudMains.add(row.id);
			}
		} else if (entity.kind === SYNC_KIND_CATEGORY) {
			if (entity.deleted) await db.categories.delete(entity.id);
			else if (entity.blob) await db.categories.put(JSON.parse(entity.blob));
		} else if (entity.kind === SYNC_KIND_CATEGORY_GROUP) {
			if (entity.deleted) await db.categoryGroups.delete(entity.id);
			else if (entity.blob) await db.categoryGroups.put(JSON.parse(entity.blob));
		} else if (entity.kind === SYNC_KIND_GOAL) {
			if (entity.deleted) await db.goals.delete(entity.id);
			else if (entity.blob) await db.goals.put(JSON.parse(entity.blob));
		} else if (entity.kind === SYNC_KIND_PLAN) {
			if (entity.deleted) await db.plans.delete(entity.id);
			else if (entity.blob) await db.plans.put(JSON.parse(entity.blob));
		} else if (entity.kind === SYNC_KIND_SETTING) {
			await applySettingEntity(entity.id, entity.deleted, entity.blob);
		}
	}
	await dropUnusedLocalSeedMain(liveCloudMains);
}

async function catchUpOne(kind: string, id: string, blob: unknown, deleted = false): Promise<void> {
	if ((await localRev(kind, id)) != null) return;
	try {
		await pushSealedEntityIfSignedIn(kind, id, blob, deleted);
	} catch (err) {
		if (err instanceof SyncConflictError) return;
		throw err;
	}
}

/** PUT local rows that the server has never seen (Spec 119 / 241). Call after a successful pull. */
export async function catchUpPushLocal(): Promise<void> {
	const [accounts, categories, groups, transactions, goals, plans, settings] = await Promise.all([
		db.accounts.toArray(),
		db.categories.toArray(),
		db.categoryGroups.toArray(),
		db.transactions.toArray(),
		db.goals.toArray(),
		db.plans.toArray(),
		db.settings.toArray()
	]);
	for (const row of accounts) await catchUpOne(SYNC_KIND_ACCOUNT, row.id, row);
	for (const row of categories) await catchUpOne(SYNC_KIND_CATEGORY, row.id, row);
	for (const row of groups) await catchUpOne(SYNC_KIND_CATEGORY_GROUP, row.id, row);
	for (const row of transactions) await catchUpOne(SYNC_KIND_TRANSACTION, row.id, row);
	for (const row of goals) await catchUpOne(SYNC_KIND_GOAL, row.id, row);
	for (const row of plans) await catchUpOne(SYNC_KIND_PLAN, row.id, row);
	const seenSettings = new Set<string>();
	for (const row of settings) {
		if (!isLedgerSettingKey(row.key)) continue;
		seenSettings.add(row.key);
		await catchUpOne(SYNC_KIND_SETTING, row.key, row);
	}
	if (!seenSettings.has(SETTINGS_THEME_PREFERENCE)) {
		const stored = parseThemePreference(
			typeof localStorage === 'undefined' ? null : localStorage.getItem('pocket-ledger-theme')
		);
		if (stored !== 'system') {
			const row = { key: SETTINGS_THEME_PREFERENCE, value: stored };
			await setSetting(SETTINGS_THEME_PREFERENCE, stored);
			await catchUpOne(SYNC_KIND_SETTING, SETTINGS_THEME_PREFERENCE, row);
		}
	}
}

/** Pull then catch-up. Use on signed-in unlock / bootstrap. */
export async function syncFromCloud(): Promise<void> {
	await pullAndApply();
	await catchUpPushLocal();
}

export async function pushTransactionById(id: string, deleted = false): Promise<void> {
	const row = deleted ? null : await db.transactions.get(id);
	await pushSealedEntityIfSignedIn(SYNC_KIND_TRANSACTION, id, row ?? null, deleted);
}

export async function pushAccountById(id: string, deleted = false): Promise<void> {
	const row = deleted ? null : await db.accounts.get(id);
	await pushSealedEntityIfSignedIn(SYNC_KIND_ACCOUNT, id, row ?? null, deleted);
}

export async function pushCategoryById(id: string, deleted = false): Promise<void> {
	const row = deleted ? null : await db.categories.get(id);
	await pushSealedEntityIfSignedIn(SYNC_KIND_CATEGORY, id, row ?? null, deleted);
}

export async function pushCategoryGroupById(id: string, deleted = false): Promise<void> {
	const row = deleted ? null : await db.categoryGroups.get(id);
	await pushSealedEntityIfSignedIn(SYNC_KIND_CATEGORY_GROUP, id, row ?? null, deleted);
}

export async function pushSettingByKey(key: string, deleted = false): Promise<void> {
	if (!isLedgerSettingKey(key)) return;
	const value = deleted ? null : await getSetting(key);
	const blob = deleted || value == null ? null : { key, value };
	await pushSealedEntityIfSignedIn(SYNC_KIND_SETTING, key, blob, deleted || value == null);
}

export async function rememberWrapRev(rev: number): Promise<void> {
	await setSetting(SETTINGS_WRAP_REV, String(rev));
}

export async function knownWrapRev(): Promise<number> {
	const raw = await getSetting(SETTINGS_WRAP_REV);
	return raw ? Number(raw) : 0;
}
