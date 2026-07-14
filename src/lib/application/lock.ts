import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER
} from '$lib/data/db';
import { deleteSetting, getSetting, setSetting } from '$lib/data/settings-repo';

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

async function deriveVerifier(passphrase: string, salt: Uint8Array): Promise<string> {
	const material = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(passphrase),
		'PBKDF2',
		false,
		['deriveBits']
	);
	// Fresh ArrayBuffer-backed view so WebCrypto typings accept BufferSource.
	const saltCopy = Uint8Array.from(salt);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: saltCopy, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		material,
		256
	);
	return toBase64(bits);
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
	await setSetting(SETTINGS_LOCK_SALT, toBase64(salt));
	await setSetting(SETTINGS_LOCK_VERIFIER, verifier);
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'true');
}

export async function disableLock(passphrase: string): Promise<void> {
	const ok = await verifyPassphrase(passphrase);
	if (!ok) throw new Error('Incorrect passphrase');
	await setSetting(SETTINGS_ENCRYPTION_ENABLED, 'false');
	await deleteSetting(SETTINGS_LOCK_SALT);
	await deleteSetting(SETTINGS_LOCK_VERIFIER);
}

export async function verifyPassphrase(passphrase: string): Promise<boolean> {
	const saltB64 = await getSetting(SETTINGS_LOCK_SALT);
	const verifier = await getSetting(SETTINGS_LOCK_VERIFIER);
	if (!saltB64 || !verifier) return false;
	const candidate = await deriveVerifier(passphrase, fromBase64(saltB64));
	return candidate === verifier;
}
