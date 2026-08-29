import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount } from '$lib/application/accounts';
import { createCategory, createCategoryGroup, listCategories } from '$lib/application/categories';
import { addTransaction, listRecentTransactions } from '$lib/application/transactions';
import { enableLock, isLockEnabled } from '$lib/application/lock';
import { clearDataKey } from '$lib/data/session-key';
import {
	BACKUP_FORMAT_VERSION,
	backupFilename,
	buildBackup,
	buildEncryptedBackup,
	parseBackupJson,
	parseEncryptedBackupJson,
	restoreBackup,
	restoreEncryptedBackup
} from './backup';

describe('backup', () => {
	beforeEach(async () => {
		clearDataKey();
		await db.delete();
		await db.open();
	});

	it('builds and restores a round-trip backup', async () => {
		const account = await ensureDefaultAccount();
		const food = (await listCategories()).find((c) => c.id === 'stock:expense:food')!;
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
		expect((await listRecentTransactions(account.id))[0]?.note).toBe('lunch');
	});

	it('round-trips custom groups and categories without stock rows', async () => {
		await ensureDefaultAccount();
		await createCategoryGroup('Side', 'expense');
		await createCategory('Warung', 'expense', 'stock-group:food-drink');
		const backup = await buildBackup();
		expect(backup.categories).toHaveLength(1);
		expect(backup.categoryGroups).toHaveLength(1);
		expect(backup.categories.some((c) => c.id.startsWith('stock:'))).toBe(false);

		await db.categories.clear();
		await db.categoryGroups.clear();
		await restoreBackup(backup);
		expect((await listCategories()).some((c) => c.name === 'Warung')).toBe(true);
	});

	it('rejects bad JSON, plaintext v1, and wrong versions', () => {
		expect(() => parseBackupJson('{')).toThrow(/json/i);
		expect(() =>
			parseBackupJson(JSON.stringify({ formatVersion: 1, accounts: [], transactions: [] }))
		).toThrow(/plaintext|formatVersion 1/i);
		expect(() => parseBackupJson(JSON.stringify({ formatVersion: 99, accounts: [] }))).toThrow(
			/version/i
		);
		expect(() =>
			parseEncryptedBackupJson(JSON.stringify({ formatVersion: 1, accounts: [], transactions: [] }))
		).toThrow(/plaintext|formatVersion 1/i);
	});

	it('names export files by date', () => {
		expect(backupFilename(new Date('2026-07-14T12:00:00'))).toBe('pocket-ledger-2026-07-14.json');
	});

	it('ignores legacy recurringRules key on import', async () => {
		const account = await ensureDefaultAccount();
		const food = (await listCategories()).find((c) => c.id === 'stock:expense:food')!;
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

	it('round-trips an encrypted envelope and rejects a wrong file passphrase', async () => {
		const account = await ensureDefaultAccount();
		const food = (await listCategories()).find((c) => c.id === 'stock:expense:food')!;
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: food.id,
			note: 'secret lunch'
		});

		const file = await buildEncryptedBackup('export-pass');
		expect(file.formatVersion).toBe(2);
		expect(file.kdf).toBe('pbkdf2-sha256');
		expect(file.iterations).toBe(600_000);
		expect(file.deviceLock).toBe(false);
		expect(JSON.stringify(file)).not.toContain('secret lunch');

		const parsed = parseEncryptedBackupJson(JSON.stringify(file));
		await db.delete();
		await db.open();
		await expect(restoreEncryptedBackup(parsed, 'wrong-pass')).rejects.toThrow(/incorrect/i);

		await restoreEncryptedBackup(parsed, 'export-pass');
		expect(await isLockEnabled()).toBe(false);
		const restored = await listRecentTransactions((await db.accounts.toArray())[0]!.id);
		expect(restored[0]?.note).toBe('secret lunch');
	});

	it('does not enable device lock when exporting with a one-time passphrase', async () => {
		await ensureDefaultAccount();
		expect(await isLockEnabled()).toBe(false);
		await buildEncryptedBackup('export-only');
		expect(await isLockEnabled()).toBe(false);
	});

	it('requires the device passphrase when lock is on', async () => {
		const account = await ensureDefaultAccount();
		await enableLock('secret-pass');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			note: 'locked'
		});
		await expect(buildEncryptedBackup('wrong-pass')).rejects.toThrow(/incorrect/i);
		const file = await buildEncryptedBackup('secret-pass');
		expect(file.deviceLock).toBe(true);
	});
});
