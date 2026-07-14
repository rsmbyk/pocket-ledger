import { getDataKey } from '$lib/data/session-key';
import { db } from '$lib/data/db';

export const CIPHER_PREFIX = 'enc:v1:';

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
	const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let binary = '';
	for (const b of arr) binary += String.fromCharCode(b);
	return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
	const binary = atob(value);
	const out = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
	return out;
}

export function isSealed(value: string): boolean {
	return value.startsWith(CIPHER_PREFIX);
}

/** Encrypt a string when a session data key is present. Empty strings stay empty. */
export async function sealField(plain: string, key: CryptoKey | null = getDataKey()): Promise<string> {
	if (!key || plain === '') return plain;
	if (isSealed(plain)) return plain;
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		new TextEncoder().encode(plain)
	);
	const packed = new Uint8Array(iv.length + encrypted.byteLength);
	packed.set(iv, 0);
	packed.set(new Uint8Array(encrypted), iv.length);
	return CIPHER_PREFIX + toBase64(packed);
}

/** Decrypt a sealed string; plaintext values pass through. */
export async function openField(
	stored: string,
	key: CryptoKey | null = getDataKey()
): Promise<string> {
	if (!isSealed(stored)) return stored;
	if (!key) throw new Error('Encrypted data requires unlock');
	const packed = fromBase64(stored.slice(CIPHER_PREFIX.length));
	const iv = packed.slice(0, 12);
	const data = packed.slice(12);
	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
	return new TextDecoder().decode(decrypted);
}

/** Seal every sensitive field currently stored in plaintext. */
export async function sealAllSensitiveFields(key: CryptoKey): Promise<void> {
	const [transactions, rules, goals, categories] = await Promise.all([
		db.transactions.toArray(),
		db.recurringRules.toArray(),
		db.goals.toArray(),
		db.categories.toArray()
	]);

	// Crypto work stays outside Dexie transactions (avoids PrematureCommitError).
	const nextTx = await Promise.all(
		transactions.map(async (tx) => ({ ...tx, note: await sealField(tx.note, key) }))
	);
	const nextRules = await Promise.all(
		rules.map(async (rule) => ({ ...rule, note: await sealField(rule.note, key) }))
	);
	const nextGoals = await Promise.all(
		goals.map(async (goal) => ({ ...goal, name: await sealField(goal.name, key) }))
	);
	const nextCats = await Promise.all(
		categories.map(async (cat) => ({ ...cat, name: await sealField(cat.name, key) }))
	);

	await db.transaction('rw', db.transactions, db.recurringRules, db.goals, db.categories, async () => {
		await db.transactions.bulkPut(nextTx);
		await db.recurringRules.bulkPut(nextRules);
		await db.goals.bulkPut(nextGoals);
		await db.categories.bulkPut(nextCats);
	});
}

/** Open every sealed sensitive field back to plaintext. */
export async function openAllSensitiveFields(key: CryptoKey): Promise<void> {
	const [transactions, rules, goals, categories] = await Promise.all([
		db.transactions.toArray(),
		db.recurringRules.toArray(),
		db.goals.toArray(),
		db.categories.toArray()
	]);

	const nextTx = await Promise.all(
		transactions.map(async (tx) => ({ ...tx, note: await openField(tx.note, key) }))
	);
	const nextRules = await Promise.all(
		rules.map(async (rule) => ({ ...rule, note: await openField(rule.note, key) }))
	);
	const nextGoals = await Promise.all(
		goals.map(async (goal) => ({ ...goal, name: await openField(goal.name, key) }))
	);
	const nextCats = await Promise.all(
		categories.map(async (cat) => ({ ...cat, name: await openField(cat.name, key) }))
	);

	await db.transaction('rw', db.transactions, db.recurringRules, db.goals, db.categories, async () => {
		await db.transactions.bulkPut(nextTx);
		await db.recurringRules.bulkPut(nextRules);
		await db.goals.bulkPut(nextGoals);
		await db.categories.bulkPut(nextCats);
	});
}
