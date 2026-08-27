import { describe, expect, it } from 'vitest';
import { generateDek, unwrapDek, wrapDek } from './wrap';

describe('DEK wrap', () => {
	it('round-trips a DEK through a passphrase box', async () => {
		const dek = await generateDek();
		const envelope = await wrapDek(dek, 'secret-pass');
		expect(envelope.kdf).toBe('pbkdf2-sha256');
		expect(envelope.iterations).toBe(600_000);
		const opened = await unwrapDek(envelope, 'secret-pass');
		expect(opened).not.toBeNull();
		const a = await crypto.subtle.exportKey('raw', dek);
		const b = await crypto.subtle.exportKey('raw', opened!);
		expect(new Uint8Array(b)).toEqual(new Uint8Array(a));
	});

	it('returns null for the wrong passphrase', async () => {
		const dek = await generateDek();
		const envelope = await wrapDek(dek, 'secret-pass');
		expect(await unwrapDek(envelope, 'wrong-pass')).toBeNull();
	});

	it('rejects short passphrases', async () => {
		const dek = await generateDek();
		await expect(wrapDek(dek, 'short')).rejects.toThrow(/8/);
	});
});
