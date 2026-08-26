import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { createCategory } from '$lib/application/categories';
import { localHasData } from './local-has-data';
import { setSetting } from '$lib/data/settings-repo';

describe('localHasData', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('treats a fresh Main pocket as virgin', async () => {
		await ensureDefaultAccount();
		expect(await localHasData()).toBe(false);
	});

	it('counts categories or settings-only changes as data', async () => {
		await ensureDefaultAccount();
		await createCategory('Food', 'expense');
		expect(await localHasData()).toBe(true);
	});

	it('counts theme settings as data', async () => {
		await ensureDefaultAccount();
		await setSetting('theme.preference', 'dark');
		expect(await localHasData()).toBe(true);
	});
});
