import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import {
	createCategory,
	listAllCategories,
	listCategories,
	removeCategory
} from '$lib/application/categories';
import { addTransaction, voidTransaction } from '$lib/application/transactions';
import {
	BACKUP_FORMAT_VERSION,
	backupFilename,
	buildBackup,
	parseBackupJson,
	restoreBackup
} from './backup';

describe('backup', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('builds and restores a round-trip backup', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: food.id,
			note: 'lunch'
		});

		const backup = await buildBackup();
		expect(backup.formatVersion).toBe(BACKUP_FORMAT_VERSION);
		expect(backup.transactions).toHaveLength(1);

		await db.transactions.clear();
		expect(await db.transactions.count()).toBe(0);

		await restoreBackup(backup);
		expect(await db.transactions.count()).toBe(1);
		expect((await db.transactions.toArray())[0]?.note).toBe('lunch');
	});

	it('rejects bad JSON and wrong versions', () => {
		expect(() => parseBackupJson('{')).toThrow(/json/i);
		expect(() => parseBackupJson(JSON.stringify({ formatVersion: 99, accounts: [] }))).toThrow(
			/version/i
		);
	});

	it('names export files by date', () => {
		expect(backupFilename(new Date('2026-07-14T12:00:00'))).toBe('pocket-ledger-2026-07-14.json');
	});

	it('ignores legacy recurringRules key on import', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: food.id,
			note: 'lunch'
		});

		const backup = await buildBackup();
		const legacy = { ...backup, recurringRules: [{ id: 'legacy-rule' }] };
		const parsed = parseBackupJson(JSON.stringify(legacy));
		expect(parsed).not.toHaveProperty('recurringRules');
		expect(parsed.transactions).toHaveLength(1);

		await restoreBackup(parsed);
		expect(await db.transactions.count()).toBe(1);
	});

	it('defaults missing feeMinor to zero on parse and restore', async () => {
		const account = await ensureDefaultAccount();
		const backup = await buildBackup();
		const legacyTx = {
			id: crypto.randomUUID(),
			accountId: account.id,
			counterAccountId: null,
			type: 'expense' as const,
			amountMinor: 1_000,
			categoryId: null,
			note: 'legacy',
			occurredOn: account.openingAsOf,
			createdAt: new Date().toISOString(),
			voidedAt: null
		};
		const parsed = parseBackupJson(
			JSON.stringify({
				...backup,
				transactions: [legacyTx]
			})
		);
		expect(parsed.transactions[0]?.feeMinor).toBe(0);
		await restoreBackup(parsed);
		expect((await db.transactions.toArray())[0]?.feeMinor).toBe(0);
	});
});
