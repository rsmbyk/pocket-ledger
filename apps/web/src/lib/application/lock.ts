import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
} from '$lib/data/db';
import { deleteSetting, getSetting, setSetting } from '$lib/data/settings-repo';
import { clearDataKey, getDataKey, setDataKey } from '$lib/data/session-key';
import { isSealed, sealAllSensitiveFields } from '$lib/application/field-crypto';
import { db } from '$lib/data/db';
import {
	exportRawDek,
	generateDek,
	importRawDek,
	unwrapDek,
	wrapDek,
	type WrapEnvelope
} from '$lib/application/wrap';

const LEGACY_PBKDF2_ITERATIONS = 100_000;

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

async function importPasswordKey(passphrase: string): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, [
		'deriveBits',
		'deriveKey'
	]);
}

async function deriveLegacyVerifier(passphrase: string, salt: Uint8Array): Promise<string> {
	const material = await importPasswordKey(passphrase);
	const saltCopy = Uint8Array.from(salt);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: saltCopy, iterations: LEGACY_PBKDF2_ITERATIONS, hash: 'SHA-256' },
		material,
		256
	);
	return toBase64(bits);
}

async function deriveLegacyDataKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
	const material = await importPasswordKey(passphrase);
	const saltCopy = Uint8Array.from(salt);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt: saltCopy, iterations: LEGACY_PBKDF2_ITERATIONS, hash: 'SHA-256' },
		material,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);
}

function parseEnvelope(raw: string): WrapEnvelope {
	return JSON.parse(raw) as WrapEnvelope;
}

async function migratePlaintextIfNeeded(dek: CryptoKey): Promise<void> {
	const [transactions, goals, categories] = await Promise.all([
		db.transactions.toArray(),
		db.goals.toArray(),
		db.categories.toArray()
	]);
	const needs =
		transactions.some((t) => t.note && !isSealed(t.note)) ||
		goals.some((g) => {
			const row = g as typeof g & { name?: string };
			const text = row.description || row.name || '';
			return Boolean(text) && !isSealed(text);
		}) ||
		categories.some((c) => c.name && !isSealed(c.name));
	if (needs) {
		await sealAllSensitiveFields(dek);
	}
}

export async function isLockEnabled(): Promise<boolean> {
	if ((await getSetting(SETTINGS_WRAPPED_DEK)) != null) return true;
	return (await getSetting(SETTINGS_ENCRYPTION_ENABLED)) === 'true';
}

/** Ensure a DEK exists. Passphrase-off loads it; passphrase-on waits for unlock. */
export async function ensureLocalDek(): Promise<'unlocked' | 'needs-passphrase'> {
	if (getDataKey()) {
		await migratePlaintextIfNeeded(getDataKey()!);
		return 'unlocked';
	}
	const wrapped = await getSetting(SETTINGS_WRAPPED_DEK);
	if (wrapped) return 'needs-passphrase';
	const raw = await getSetting(SETTINGS_RAW_DEK);
	if (raw) {
		const dek = await importRawDek(raw);
		setDataKey(dek);
		await migratePlaintextIfNeeded(dek);
		return 'unlocked';
	}
	if ((await getSetting(SETTINGS_LOCK_SALT)) && (await getSetting(SETTINGS_LOCK_VERIFIER))) {
		return 'needs-passphrase';
	}
	const dek = await generateDek();
	setDataKey(dek);
	await setSetting(SETTINGS_RAW_DEK, await exportRawDek(dek));
	await migratePlaintextIfNeeded(dek);
	return 'unlocked';
}

export async function enableLock(passphrase: string): Promise<void> {
	if (passphrase.length < 8) {
		throw new Error('Passphrase must be at least 8 characters');
	}
	const status = await ensureLocalDek();
	if (status === 'needs-passphrase') {
		throw new Error('Unlock this device before changing the passphrase');
	}
	const dek = getDataKey();
	if (!dek) throw new Error('Missing data key');
	const envelope = await wrapDek(dek, passphrase);
	await setSetting(SETTINGS_WRAPPED_DEK, JSON.stringify(envelope));
	await deleteSetting(SETTINGS_RAW_DEK);
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'true');
}

export async function disableLock(passphrase: string): Promise<void> {
	const unlocked = await unlockWithPassphrase(passphrase);
	if (!unlocked) throw new Error('Incorrect passphrase');
	const dek = getDataKey();
	if (!dek) throw new Error('Missing data key');
	await setSetting(SETTINGS_RAW_DEK, await exportRawDek(dek));
	await deleteSetting(SETTINGS_WRAPPED_DEK);
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'false');
	await deleteSetting(SETTINGS_LOCK_SALT);
	await deleteSetting(SETTINGS_LOCK_VERIFIER);
}

export async function verifyPassphrase(passphrase: string): Promise<boolean> {
	const wrapped = await getSetting(SETTINGS_WRAPPED_DEK);
	if (wrapped) {
		return (await unwrapDek(parseEnvelope(wrapped), passphrase)) != null;
	}
	const saltB64 = await getSetting(SETTINGS_LOCK_SALT);
	const verifier = await getSetting(SETTINGS_LOCK_VERIFIER);
	if (!saltB64 || !verifier) return false;
	const candidate = await deriveLegacyVerifier(passphrase, fromBase64(saltB64));
	return candidate === verifier;
}

export function lockSession(): void {
	clearDataKey();
}

export async function unlockWithPassphrase(passphrase: string): Promise<boolean> {
	const wrapped = await getSetting(SETTINGS_WRAPPED_DEK);
	if (wrapped) {
		const dek = await unwrapDek(parseEnvelope(wrapped), passphrase);
		if (!dek) return false;
		setDataKey(dek);
		await migratePlaintextIfNeeded(dek);
		return true;
	}
	const saltB64 = await getSetting(SETTINGS_LOCK_SALT);
	if (!saltB64) return false;
	const ok = await verifyPassphrase(passphrase);
	if (!ok) return false;
	const dek = await deriveLegacyDataKey(passphrase, fromBase64(saltB64));
	setDataKey(dek);
	const envelope = await wrapDek(dek, passphrase);
	await setSetting(SETTINGS_WRAPPED_DEK, JSON.stringify(envelope));
	await deleteSetting(SETTINGS_LOCK_VERIFIER);
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'true');
	await migratePlaintextIfNeeded(dek);
	return true;
}
