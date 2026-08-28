import { describe, expect, it } from 'vitest';
import { assertTransferParties, assertTypeImmutable, buildTransferFields } from './transfer-rules';

describe('transfer rules', () => {
	it('rejects same source and dest', () => {
		expect(() => assertTransferParties('a', 'a')).toThrow(/different/);
	});

	it('builds transfer fields', () => {
		const f = buildTransferFields({
			sourceAccountId: 'main',
			destAccountId: 'vac',
			amountRaw: '10000',
			note: 'move',
			occurredOn: '2026-07-01'
		});
		expect(f).toMatchObject({
			accountId: 'main',
			counterAccountId: 'vac',
			type: 'transfer',
			amountMinor: 10_000,
			feeMinor: 0,
			categoryId: null,
			note: 'move',
			occurredOn: '2026-07-01'
		});
	});

	it('parses optional fee blank to zero and digits with grouping', () => {
		expect(
			buildTransferFields({
				sourceAccountId: 'main',
				destAccountId: 'vac',
				amountRaw: '10000',
				feeRaw: '',
				occurredOn: '2026-07-01'
			}).feeMinor
		).toBe(0);
		expect(
			buildTransferFields({
				sourceAccountId: 'main',
				destAccountId: 'vac',
				amountRaw: '10000',
				feeRaw: '250',
				occurredOn: '2026-07-01'
			}).feeMinor
		).toBe(250);
		expect(
			buildTransferFields({
				sourceAccountId: 'main',
				destAccountId: 'vac',
				amountRaw: '10000',
				feeRaw: '1,250',
				occurredOn: '2026-07-01'
			}).feeMinor
		).toBe(1_250);
	});

	it('rejects negative or non-digit fee', () => {
		expect(() =>
			buildTransferFields({
				sourceAccountId: 'main',
				destAccountId: 'vac',
				amountRaw: '10000',
				feeRaw: '-1',
				occurredOn: '2026-07-01'
			})
		).toThrow(/fee/i);
		expect(() =>
			buildTransferFields({
				sourceAccountId: 'main',
				destAccountId: 'vac',
				amountRaw: '10000',
				feeRaw: '10.5',
				occurredOn: '2026-07-01'
			})
		).toThrow(/fee/i);
	});

	it('blocks type change', () => {
		expect(() => assertTypeImmutable({ type: 'transfer' }, 'expense')).toThrow(/cannot be changed/);
		expect(() => assertTypeImmutable({ type: 'expense' }, 'income')).toThrow(/cannot be changed/);
	});
});
