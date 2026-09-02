import { describe, expect, it } from 'vitest';
import { DEFAULT_ACTIVITY_FILTERS } from '$lib/domain/activity-filters';
import { defaultTransactionDateRange } from '$lib/domain/transaction-date-range';
import {
	ACTIVITY_LIST_SESSION_KEY,
	parseActivityListSession,
	readActivityListSession,
	writeActivityListSession
} from './activity-list-session';

describe('activity-list-session', () => {
	it('defaults for missing or garbage', () => {
		const empty = {
			filters: { ...DEFAULT_ACTIVITY_FILTERS },
			range: defaultTransactionDateRange()
		};
		expect(parseActivityListSession(null)).toEqual(empty);
		expect(parseActivityListSession('')).toEqual(empty);
		expect(parseActivityListSession('not-json')).toEqual(empty);
		expect(parseActivityListSession('[]')).toEqual(empty);
	});

	it('ignores leftover sort', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({ sort: 'occurredOn-asc', filters: { types: ['expense'] } })
		);
		expect(parsed).not.toHaveProperty('sort');
		expect(parsed.filters.types).toEqual(['expense']);
	});

	it('coerces old single type / category / pocket and hideVoided', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({
				sort: 'occurredOn-desc',
				filters: {
					type: 'expense',
					categoryId: 'food',
					pocketId: 'vac',
					hideVoided: true,
					search: 'coffee'
				}
			})
		);
		expect(parsed.filters.types).toEqual(['expense']);
		expect(parsed.filters.categoryIds).toEqual(['food']);
		expect(parsed.filters.pocketIds).toEqual(['vac']);
		expect(parsed.filters.showVoided).toBe(false);
		expect(parsed.filters.search).toBe('coffee');
	});

	it('coerces hideVoided false to show voided', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({ filters: { hideVoided: false } })
		);
		expect(parsed.filters.showVoided).toBe(true);
	});

	it('missing From/To becomes current month range', () => {
		const parsed = parseActivityListSession(JSON.stringify({ filters: { type: 'all' } }));
		expect(parsed.range.mode).toBe('month');
		expect(parsed.range).toEqual(defaultTransactionDateRange());
	});

	it('round-trips filters and range', () => {
		const map = new Map<string, string>();
		const storage = {
			getItem: (k: string) => map.get(k) ?? null,
			setItem: (k: string, v: string) => {
				map.set(k, v);
			}
		};

		const range = {
			mode: 'custom' as const,
			startDate: '2026-08-01',
			endDate: '2026-08-15'
		};
		writeActivityListSession(
			{
				filters: {
					...DEFAULT_ACTIVITY_FILTERS,
					types: ['expense'],
					search: 'coffee',
					showVoided: true,
					pocketIds: ['vac']
				},
				range
			},
			storage
		);

		expect(map.has(ACTIVITY_LIST_SESSION_KEY)).toBe(true);
		const restored = readActivityListSession(storage);
		expect(restored.filters.types).toEqual(['expense']);
		expect(restored.filters.search).toBe('coffee');
		expect(restored.filters.showVoided).toBe(true);
		expect(restored.filters.pocketIds).toEqual(['vac']);
		expect(restored.range).toEqual(range);
	});

	it('loads leftover amountOp/amountRaw without keeping them', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({
				filters: { types: ['expense'], amountOp: 'lt', amountRaw: '25000' }
			})
		);
		expect(parsed.filters.types).toEqual(['expense']);
		expect(parsed.filters).not.toHaveProperty('amountOp');
		expect(parsed.filters).not.toHaveProperty('amountRaw');
	});

	it('ignores unknown filter keys and coerces bad fields', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({
				filters: {
					type: 'nope',
					amountOp: 'eq',
					hideVoided: 'yes',
					extra: true,
					categoryId: 12
				}
			})
		);
		expect(parsed.filters.types).toEqual([]);
		expect(parsed.filters).not.toHaveProperty('amountOp');
		expect(parsed.filters).not.toHaveProperty('amountRaw');
		expect(parsed.filters.showVoided).toBe(false);
		expect(parsed.filters.categoryIds).toEqual([]);
	});
});
