import { db } from '$lib/data/db';
import { SETTINGS_WRAP_REV } from '$lib/data/db';
import { getSetting, setSetting } from '$lib/data/settings-repo';
import { putCloudEntity, pullCloudEntities } from '$lib/application/cloud-api';
import { SyncConflictError } from '$lib/application/sync';

function revId(kind: string, id: string): string {
	return `${kind}:${id}`;
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
	try {
		const saved = await putCloudEntity({
			id,
			kind,
			rev,
			deleted,
			blob: blob == null ? null : JSON.stringify(blob)
		});
		await setLocalRev(kind, id, saved.rev);
	} catch (err) {
		if (err instanceof SyncConflictError) throw err;
		throw err;
	}
}

export async function pullAndApply(): Promise<void> {
	const entities = await pullCloudEntities();
	for (const entity of entities) {
		await setLocalRev(entity.kind, entity.id, entity.rev);
		if (entity.kind === 'transaction') {
			if (entity.deleted) {
				await db.transactions.delete(entity.id);
			} else if (entity.blob) {
				await db.transactions.put(JSON.parse(entity.blob));
			}
		} else if (entity.kind === 'account') {
			if (entity.deleted) await db.accounts.delete(entity.id);
			else if (entity.blob) await db.accounts.put(JSON.parse(entity.blob));
		} else if (entity.kind === 'category') {
			if (entity.deleted) await db.categories.delete(entity.id);
			else if (entity.blob) await db.categories.put(JSON.parse(entity.blob));
		} else if (entity.kind === 'goal') {
			if (entity.deleted) await db.goals.delete(entity.id);
			else if (entity.blob) await db.goals.put(JSON.parse(entity.blob));
		} else if (entity.kind === 'setting') {
			if (entity.deleted) await db.settings.delete(entity.id);
			else if (entity.blob) {
				const row = JSON.parse(entity.blob) as { key: string; value: string };
				await db.settings.put(row);
			}
		}
	}
}

export async function pushTransactionById(id: string, deleted = false): Promise<void> {
	const row = deleted ? null : await db.transactions.get(id);
	await pushSealedEntity('transaction', id, row ?? null, deleted);
}

export async function rememberWrapRev(rev: number): Promise<void> {
	await setSetting(SETTINGS_WRAP_REV, String(rev));
}

export async function knownWrapRev(): Promise<number> {
	const raw = await getSetting(SETTINGS_WRAP_REV);
	return raw ? Number(raw) : 0;
}
