import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER
} from '$lib/data/db';
import { deleteSetting, getSetting, setSetting } from '$lib/data/settings-repo';
import { clearDataKey, getDataKey, setDataKey } from '$lib/data/session-key';
import { openAllSensitiveFields, sealAllSensitiveFields } from '$lib/application/field-crypto';

const PBKDF2_ITERATIONS = 100_000;

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
	return crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(passphrase),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	);
}

async function deriveVerifier(passphrase: string, salt: Uint8Array): Promise<string> {
	const material = await importPasswordKey(passphrase);
	const saltCopy = Uint8Array.from(salt);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: saltCopy, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		material,
		256
	);
	return toBase64(bits);
}

async function deriveDataKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
	const material = await importPasswordKey(passphrase);
	const saltCopy = Uint8Array.from(salt);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt: saltCopy, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		material,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

export async function isLockEnabled(): Promise<boolean> {
	return (await getSetting(SETTINGS_ENCRYPTION_ENABLED)) === 'true';
}

export async function enableLock(passphrase: string): Promise<void> {
	if (passphrase.length < 8) {
		throw new Error('Passphrase must be at least 8 characters');
	}
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const verifier = await deriveVerifier(passphrase, salt);
	const dataKey = await deriveDataKey(passphrase, salt);
	await sealAllSensitiveFields(dataKey);
	await setSetting(SETTINGS_LOCK_SALT, toBase64(salt));
	await setSetting(SETTINGS_LOCK_VERIFIER, verifier);
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'true');
	setDataKey(dataKey);
}

export async function disableLock(passphrase: string): Promise<void> {
	const unlocked = await unlockWithPassphrase(passphrase);
	if (!unlocked) throw new Error('Incorrect passphrase');
	const key = getDataKey();
	if (!key) throw new Error('Missing session key');
	await openAllSensitiveFields(key);
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'false');
	await deleteSetting(SETTINGS_LOCK_SALT);
	await deleteSetting(SETTINGS_LOCK_VERIFIER);
	clearDataKey();
}

export async function verifyPassphrase(passphrase: string): Promise<boolean> {
	const saltB64 = await getSetting(SETTINGS_LOCK_SALT);
	const verifier = await getSetting(SETTINGS_LOCK_VERIFIER);
	if (!saltB64 || !verifier) return false;
	const candidate = await deriveVerifier(passphrase, fromBase64(saltB64));
	return candidate === verifier;
}

/** Verify passphrase and load the in-memory field encryption key. */
export async function unlockWithPassphrase(passphrase: string): Promise<boolean> {
	const saltB64 = await getSetting(SETTINGS_LOCK_SALT);
	if (!saltB64) return false;
	const ok = await verifyPassphrase(passphrase);
	if (!ok) return false;
	setDataKey(await deriveDataKey(passphrase, fromBase64(saltB64)));
	return true;
}
