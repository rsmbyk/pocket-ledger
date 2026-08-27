/** PBKDF2-SHA-256 wrap around a random DEK (Spec 120). */

export const KDF_ID = 'pbkdf2-sha256' as const;
export const PBKDF2_ITERATIONS = 600_000;
export const DEK_BYTES = 32;

export type WrapEnvelope = {
	kdf: typeof KDF_ID;
	iterations: number;
	saltB64: string;
	wrappedDekB64: string;
};

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
	const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let binary = '';
	for (const b of arr) binary += String.fromCharCode(b);
	return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
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
		['deriveKey']
	);
}

async function deriveBoxKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
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

export async function generateDek(): Promise<CryptoKey> {
	return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportRawDek(dek: CryptoKey): Promise<string> {
	return toBase64(await crypto.subtle.exportKey('raw', dek));
}

export async function importRawDek(rawB64: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		fromBase64(rawB64),
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);
}

export async function wrapDek(dek: CryptoKey, passphrase: string): Promise<WrapEnvelope> {
	if (passphrase.length < 8) {
		throw new Error('Passphrase must be at least 8 characters');
	}
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const boxKey = await deriveBoxKey(passphrase, salt);
	const raw = await crypto.subtle.exportKey('raw', dek);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, boxKey, raw);
	const packed = new Uint8Array(iv.length + sealed.byteLength);
	packed.set(iv, 0);
	packed.set(new Uint8Array(sealed), iv.length);
	return {
		kdf: KDF_ID,
		iterations: PBKDF2_ITERATIONS,
		saltB64: toBase64(salt),
		wrappedDekB64: toBase64(packed)
	};
}

export async function unwrapDek(envelope: WrapEnvelope, passphrase: string): Promise<CryptoKey | null> {
	try {
		const salt = fromBase64(envelope.saltB64);
		const boxKey = await deriveBoxKey(passphrase, salt);
		const packed = fromBase64(envelope.wrappedDekB64);
		const iv = packed.slice(0, 12);
		const data = packed.slice(12);
		const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, boxKey, data);
		return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, true, [
			'encrypt',
			'decrypt'
		]);
	} catch {
		return null;
	}
}
