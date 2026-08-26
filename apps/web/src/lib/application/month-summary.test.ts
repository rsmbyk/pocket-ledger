import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/data/db';
import { ensureDefaultAccount, updatePocket } from './accounts';
import { createCategory } from './categories';
import { addTransaction } from './transactions';
import { getMonthSummary, loadMonthSummary } from './month-summary';
import { currentMonthKey } from '$lib/domain/month-summary';

describe('month-summary application', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('builds a month summary for the account', async () => {
		const account = await ensureDefaultAccount();
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '15000',
			categoryId: food.id,
			occurredOn: '2026-07-15'
		});
		const summary = await getMonthSummary(account.id, '2026-07');
		expect(summary.expenseMinor).toBe(15_000);
		expect(summary.expenseByCategory.some((r) => r.label === 'Food')).toBe(true);
	});

	it('clamps requested month and returns bounds from openings and txs', async () => {
		const account = await ensureDefaultAccount();
		await updatePocket({
			id: account.id,
			name: account.name,
			openingEnabled: true,
			openingBalanceMinor: 0,
			openingAsOf: '2020-03-01'
		});

		const loaded = await loadMonthSummary(account.id, '2019-01');
		expect(loaded.bounds).toEqual({
			earliest: '2020-03',
			latest: currentMonthKey()
		});
		expect(loaded.monthKey).toBe('2020-03');
		expect(loaded.summary.monthKey).toBe('2020-03');
	});

	it('extends earliest bound with an earlier non-voided transaction', async () => {
		const account = await ensureDefaultAccount();
		await updatePocket({
			id: account.id,
			name: account.name,
			openingEnabled: true,
			openingBalanceMinor: 0,
			openingAsOf: '2020-06-01'
		});
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '1000',
			categoryId: null,
			occurredOn: '2020-04-10'
		});

		const loaded = await loadMonthSummary(account.id, currentMonthKey());
		expect(loaded.bounds.earliest).toBe('2020-04');
		expect(loaded.bounds.latest).toBe(currentMonthKey());
		expect(loaded.monthKey).toBe(currentMonthKey());
	});

	it('infers month opening from pocket opening walking mid-gap expense backward', async () => {
		const account = await ensureDefaultAccount();
		await updatePocket({
			id: account.id,
			name: account.name,
			openingEnabled: true,
			openingBalanceMinor: 100_000,
			openingAsOf: '2026-06-15'
		});
		const food = await createCategory('Food', 'expense');
		await addTransaction({
			accountId: account.id,
			type: 'expense',
			amountRaw: '25000',
			categoryId: food.id,
			occurredOn: '2026-06-05'
		});

		const summary = await getMonthSummary(account.id, '2026-06');
		expect(summary.openingMinor).toBe(125_000);
		expect(summary.expenseMinor).toBe(25_000);
		expect(summary.endingMinor).toBe(100_000);
	});
});
