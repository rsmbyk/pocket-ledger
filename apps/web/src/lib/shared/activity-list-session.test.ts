import { describe, expect, it } from 'vitest';
import { DEFAULT_ACTIVITY_FILTERS, DEFAULT_ACTIVITY_SORT } from '$lib/domain/activity-filters';
import {
	ACTIVITY_LIST_SESSION_KEY,
	parseActivityListSession,
	readActivityListSession,
	writeActivityListSession
} from './activity-list-session';

describe('activity-list-session', () => {
	it('defaults for missing or garbage', () => {
		expect(parseActivityListSession(null)).toEqual({
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		});
		expect(parseActivityListSession('')).toEqual({
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		});
		expect(parseActivityListSession('not-json')).toEqual({
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		});
		expect(parseActivityListSession('[]')).toEqual({
			sort: DEFAULT_ACTIVITY_SORT,
			filters: { ...DEFAULT_ACTIVITY_FILTERS }
		});
	});

	it('falls back unknown sort to default', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({ sort: 'category', filters: { type: 'expense' } })
		);
		expect(parsed.sort).toBe(DEFAULT_ACTIVITY_SORT);
		expect(parsed.filters.type).toBe('expense');
	});

	it('round-trips sort and applied filters', () => {
		const map = new Map<string, string>();
		const storage = {
			getItem: (k: string) => map.get(k) ?? null,
			setItem: (k: string, v: string) => {
				map.set(k, v);
			}
		};

		writeActivityListSession(
			{
				sort: 'occurredOn-asc',
				filters: {
					...DEFAULT_ACTIVITY_FILTERS,
					type: 'expense',
					search: 'coffee',
					hideVoided: true,
					pocketId: 'vac'
				}
			},
			storage
		);

		expect(map.has(ACTIVITY_LIST_SESSION_KEY)).toBe(true);
		const restored = readActivityListSession(storage);
		expect(restored.sort).toBe('occurredOn-asc');
		expect(restored.filters.type).toBe('expense');
		expect(restored.filters.search).toBe('coffee');
		expect(restored.filters.hideVoided).toBe(true);
		expect(restored.filters.pocketId).toBe('vac');
	});

	it('ignores unknown filter keys and coerces bad fields', () => {
		const parsed = parseActivityListSession(
			JSON.stringify({
				sort: 'occurredOn-desc',
				filters: {
					type: 'nope',
					amountOp: 'eq',
					hideVoided: 'yes',
					extra: true,
					categoryId: 12
				}
			})
		);
		expect(parsed.sort).toBe('occurredOn-desc');
		expect(parsed.filters.type).toBe('all');
		expect(parsed.filters.amountOp).toBe('none');
		expect(parsed.filters.hideVoided).toBe(false);
		expect(parsed.filters.categoryId).toBe('');
	});
});
