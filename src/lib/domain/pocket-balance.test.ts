import { describe, expect, it } from 'vitest';
import { derivePocketBalance, pocketDelta, sumAllPocketBalances } from './pocket-balance';
import type { LedgerTransaction } from './transaction';

function tx(
	partial: Partial<LedgerTransaction> &
		Pick<LedgerTransaction, 'type' | 'amountMinor' | 'accountId' | 'occurredOn'>
): LedgerTransaction {
	return {
		id: 't1',
		counterAccountId: null,
		categoryId: null,
		note: '',
		createdAt: '2026-01-01T00:00:00.000Z',
		voidedAt: null,
		...partial
	};
}

describe('pocketDelta', () => {
	it('applies income and expense on the pocket', () => {
		expect(
			pocketDelta(tx({ type: 'income', amountMinor: 100, accountId: 'a', occurredOn: '2026-01-01' }), 'a')
		).toBe(100);
		expect(
			pocketDelta(tx({ type: 'expense', amountMinor: 40, accountId: 'a', occurredOn: '2026-01-01' }), 'a')
		).toBe(-40);
	});

	it('applies transfer on both sides', () => {
		const xfer = tx({
			type: 'transfer',
			amountMinor: 10_000,
			accountId: 'main',
			counterAccountId: 'vac',
			occurredOn: '2026-01-01'
		});
		expect(pocketDelta(xfer, 'main')).toBe(-10_000);
		expect(pocketDelta(xfer, 'vac')).toBe(10_000);
		expect(pocketDelta(xfer, 'other')).toBe(0);
	});
});

describe('derivePocketBalance', () => {
	const pocket = {
		id: 'a',
		openingBalanceMinor: 100_000,
		openingAsOf: '2026-01-01'
	};

	it('adds later expense', () => {
		expect(
			derivePocketBalance(pocket, [
				tx({ type: 'expense', amountMinor: 25_000, accountId: 'a', occurredOn: '2026-01-15' })
			])
		).toBe(75_000);
	});

	it('ignores txs before as-of', () => {
		expect(
			derivePocketBalance(
				{ id: 'a', openingBalanceMinor: 50_000, openingAsOf: '2026-06-01' },
				[tx({ type: 'income', amountMinor: 10_000, accountId: 'a', occurredOn: '2026-05-01' })]
			)
		).toBe(50_000);
	});

	it('ignores voided', () => {
		expect(
			derivePocketBalance(pocket, [
				tx({
					type: 'expense',
					amountMinor: 25_000,
					accountId: 'a',
					occurredOn: '2026-01-15',
					voidedAt: '2026-01-16T00:00:00.000Z'
				})
			])
		).toBe(100_000);
	});
});

describe('sumAllPocketBalances', () => {
	it('cancels transfers across pockets', () => {
		const main = { id: 'm', openingBalanceMinor: 100_000, openingAsOf: '2026-01-01' };
		const vac = { id: 'v', openingBalanceMinor: 0, openingAsOf: '2026-01-01' };
		const xfer = tx({
			type: 'transfer',
			amountMinor: 10_000,
			accountId: 'm',
			counterAccountId: 'v',
			occurredOn: '2026-01-02'
		});
		expect(sumAllPocketBalances([main, vac], [xfer])).toBe(100_000);
		expect(derivePocketBalance(main, [xfer])).toBe(90_000);
		expect(derivePocketBalance(vac, [xfer])).toBe(10_000);
	});
});
