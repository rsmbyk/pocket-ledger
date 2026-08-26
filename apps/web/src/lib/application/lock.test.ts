import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { disableLock, enableLock, isLockEnabled, verifyPassphrase } from './lock';

describe('lock', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('is disabled by default', async () => {
		expect(await isLockEnabled()).toBe(false);
	});

	it('enables and verifies a passphrase', async () => {
		await enableLock('secret-pass');
		expect(await isLockEnabled()).toBe(true);
		expect(await verifyPassphrase('secret-pass')).toBe(true);
		expect(await verifyPassphrase('wrong-pass')).toBe(false);
	});

	it('disables with the correct passphrase', async () => {
		await enableLock('secret-pass');
		await disableLock('secret-pass');
		expect(await isLockEnabled()).toBe(false);
	});
});
