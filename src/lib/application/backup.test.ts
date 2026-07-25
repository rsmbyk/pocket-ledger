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

	it('round-trips soft-deleted categories and defaults missing deletedAt', async () => {
		const account = await ensureDefaultAccount();
		const coffee = await createCategory('Coffee', 'expense');
		const tx = await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			categoryId: coffee.id
		});
		await voidTransaction(tx.id);
		await removeCategory(coffee.id);

		const backup = await buildBackup();
		const soft = backup.categories.find((c) => c.id === coffee.id);
		expect(soft?.deletedAt).toBeTruthy();

		await restoreBackup(backup);
		expect((await listCategories()).some((c) => c.id === coffee.id)).toBe(false);
		expect((await listAllCategories()).find((c) => c.id === coffee.id)?.deletedAt).toBeTruthy();

		const legacyCats = backup.categories.map(({ deletedAt: _d, ...rest }) => rest);
		await restoreBackup({ ...backup, categories: legacyCats as typeof backup.categories });
		const restored = await db.categories.get(coffee.id);
		expect(restored?.deletedAt ?? null).toBeNull();
	});
});
