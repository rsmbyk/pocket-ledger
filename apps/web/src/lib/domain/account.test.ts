import { describe, expect, it } from 'vitest';
import {
	assignNonMainSortOrders,
	assertUniquePocketName,
	inferOpeningEnabled,
	isUnsetMainName,
	listPocketsOrdered,
	normalizeAccount,
	normalizePocketNameInput,
	pocketDisplayName,
	type Account
} from './account';

function pocket(partial: Partial<Account> & Pick<Account, 'id' | 'name'>): Account {
	return normalizeAccount({
		currencyLabel: 'IDR',
		createdAt: '2026-01-01T00:00:00.000Z',
		...partial
	});
}

describe('pocket names (197)', () => {
	it('treats Main as unset on the default pocket', () => {
		const main = pocket({ id: 'm', name: 'Main', isMain: true });
		expect(isUnsetMainName(main)).toBe(true);
		expect(pocketDisplayName(main)).toBe('Main');
		expect(normalizePocketNameInput('', true)).toBe('Main');
		expect(normalizePocketNameInput('Household', true)).toBe('Household');
	});

	it('allows literal Main beside the unset default fallback (201)', () => {
		const main = pocket({ id: 'm', name: 'Main', isMain: true });
		const daily = pocket({ id: 'd', name: 'Daily' });
		expect(() => assertUniquePocketName('daily', [main, daily])).toThrow(/already exists/i);
		expect(normalizePocketNameInput('Main', false)).toBe('Main');
		expect(() => assertUniquePocketName('Main', [main, daily])).not.toThrow();
		expect(() => assertUniquePocketName('Household', [main, daily], 'm')).not.toThrow();
		const literal = pocket({ id: 'x', name: 'Main', isMain: false });
		expect(() => assertUniquePocketName('main', [main, literal])).toThrow(/already exists/i);
		expect(() => assertUniquePocketName('Main', [main, literal], 'm')).not.toThrow();
	});
});

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
		expect(n.openingAsOf).toBe('2026-01-01');
		expect(n.openingEnabled).toBe(false);
		expect(n.goalTargetMinor).toBeNull();
		expect(n.goalEnabled).toBe(false);
		expect(n.notes).toBe('');
	});

	it('infers openingEnabled when opening differs from creation defaults', () => {
		const n = normalizeAccount({
			id: '1',
			name: 'Main',
			currencyLabel: 'IDR',
			createdAt: '2026-01-01T12:00:00.000Z',
			openingBalanceMinor: 50_000,
			openingAsOf: '2026-06-01'
		});
		expect(n.openingEnabled).toBe(true);
		expect(n.openingBalanceMinor).toBe(50_000);
	});

	it('clears goal fields when goalEnabled is false', () => {
		const n = normalizeAccount({
			id: '1',
			name: 'Main',
			currencyLabel: 'IDR',
			createdAt: '2026-01-01T00:00:00.000Z',
			goalEnabled: false,
			goalTargetMinor: 100,
			goalTargetOn: '2026-12-01'
		});
		expect(n.goalEnabled).toBe(false);
		expect(n.goalTargetMinor).toBeNull();
		expect(n.goalTargetOn).toBeNull();
	});
});

describe('inferOpeningEnabled', () => {
	it('is false for zero opening on creation date', () => {
		expect(
			inferOpeningEnabled({
				openingBalanceMinor: 0,
				openingAsOf: '2026-01-01',
				createdAt: '2026-01-01T00:00:00.000Z'
			})
		).toBe(false);
	});
});
