import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount, getAccountsOverview, hasOnlyDefaultAccount } from './accounts';
import { DEFAULT_ACCOUNT_NAME } from '$lib/domain/account';

describe('accounts application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('creates the default Main account once', async () => {
		const first = await ensureDefaultAccount();
		expect(first.name).toBe(DEFAULT_ACCOUNT_NAME);
		const second = await ensureDefaultAccount();
		expect(second.id).toBe(first.id);
		expect(await hasOnlyDefaultAccount()).toBe(true);
	});

	it('reports single-pot overview', async () => {
		const overview = await getAccountsOverview();
		expect(overview.isSinglePot).toBe(true);
		expect(overview.accounts).toHaveLength(1);
	});
});
