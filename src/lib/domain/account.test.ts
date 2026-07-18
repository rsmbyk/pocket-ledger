import { describe, expect, it } from 'vitest';
import {
	assignNonMainSortOrders,
	listPocketsOrdered,
	normalizeAccount,
	type Account
} from './account';

function pocket(
	partial: Partial<Account> & Pick<Account, 'id' | 'name'>
): Account {
	return normalizeAccount({
		currencyLabel: 'IDR',
		createdAt: '2026-01-01T00:00:00.000Z',
		...partial
	});
}

describe('listPocketsOrdered', () => {
	it('puts Main first regardless of sortOrder or name', () => {
		const main = pocket({ id: 'm', name: 'Zebra', isMain: true, sortOrder: 99 });
		const a = pocket({ id: 'a', name: 'Alpha', sortOrder: 1 });
		const b = pocket({ id: 'b', name: 'Beta', sortOrder: 0 });
		expect(listPocketsOrdered([a, main, b]).map((p) => p.id)).toEqual(['m', 'b', 'a']);
	});
});

describe('assignNonMainSortOrders', () => {
	it('rewrites non-Main sortOrder from ordered ids', () => {
		const main = pocket({ id: 'm', name: 'Main', isMain: true });
		const a = pocket({ id: 'a', name: 'A', sortOrder: 0 });
		const b = pocket({ id: 'b', name: 'B', sortOrder: 1 });
		const next = assignNonMainSortOrders([main, a, b], ['b', 'a']);
		expect(listPocketsOrdered(next).map((p) => p.id)).toEqual(['m', 'b', 'a']);
	});

	it('rejects Main in the reorder list', () => {
		const main = pocket({ id: 'm', name: 'Main', isMain: true });
		expect(() => assignNonMainSortOrders([main], ['m'])).toThrow(/Invalid/);
	});
});

describe('normalizeAccount', () => {
	it('fills defaults for legacy rows', () => {
		const n = normalizeAccount(
			{
				id: '1',
				name: 'Main',
				currencyLabel: 'IDR',
				createdAt: '2026-01-01T00:00:00.000Z'
			},
			{ today: '2026-07-18', isMain: true }
		);
		expect(n.isMain).toBe(true);
		expect(n.openingBalanceMinor).toBe(0);
		expect(n.openingAsOf).toBe('2026-07-18');
		expect(n.goalTargetMinor).toBeNull();
		expect(n.notes).toBe('');
	});
});
