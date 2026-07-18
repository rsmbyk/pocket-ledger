import { describe, expect, it } from 'vitest';
import {
	assertTransferParties,
	assertTypeImmutable,
	buildTransferFields
} from './transfer-rules';

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
			categoryId: null,
			note: 'move',
			occurredOn: '2026-07-01'
		});
	});

	it('blocks type change', () => {
		expect(() => assertTypeImmutable({ type: 'transfer' }, 'expense')).toThrow(/cannot be changed/);
		expect(() => assertTypeImmutable({ type: 'expense' }, 'income')).toThrow(/cannot be changed/);
	});
});
