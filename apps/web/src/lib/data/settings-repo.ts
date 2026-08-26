import { db } from '$lib/data/db';

export async function getSetting(key: string): Promise<string | undefined> {
	return (await db.settings.get(key))?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
	await db.settings.put({ key, value });
}

export async function deleteSetting(key: string): Promise<void> {
	await db.settings.delete(key);
}

export async function listSettings(): Promise<{ key: string; value: string }[]> {
	return db.settings.toArray();
}
