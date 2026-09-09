import { describe, expect, it } from 'vitest';
import { DEFAULT_PLAN_FILTERS } from '$lib/domain/plan-filters';
import {
	PLANS_LIST_SESSION_KEY,
	parsePlansListSession,
	readPlansListSession,
	writePlansListSession
} from './plans-list-session';

describe('plans-list-session', () => {
	it('defaults for missing or garbage', () => {
		expect(parsePlansListSession(null)).toEqual({ ...DEFAULT_PLAN_FILTERS });
		expect(parsePlansListSession('')).toEqual({ ...DEFAULT_PLAN_FILTERS });
		expect(parsePlansListSession('not-json')).toEqual({ ...DEFAULT_PLAN_FILTERS });
		expect(parsePlansListSession('[]')).toEqual({ ...DEFAULT_PLAN_FILTERS });
	});

	it('parses categoryIds with types and pockets', () => {
		const parsed = parsePlansListSession(
			JSON.stringify({
				filters: {
					types: ['expense'],
					categoryIds: ['food', '__uncategorized__'],
					pocketIds: ['main'],
					search: 'rent'
				}
			})
		);
		expect(parsed.types).toEqual(['expense']);
		expect(parsed.categoryIds).toEqual(['food', '__uncategorized__']);
		expect(parsed.pocketIds).toEqual(['main']);
		expect(parsed.search).toBe('rent');
	});

	it('round-trips categoryIds', () => {
		const map = new Map<string, string>();
		const storage = {
			getItem: (k: string) => map.get(k) ?? null,
			setItem: (k: string, v: string) => {
				map.set(k, v);
			}
		};
		const state = {
			...DEFAULT_PLAN_FILTERS,
			types: ['income'] as const,
			categoryIds: ['sal'],
			pocketIds: ['main']
		};
		writePlansListSession(state, storage);
		expect(map.get(PLANS_LIST_SESSION_KEY)).toBeTruthy();
		expect(readPlansListSession(storage).categoryIds).toEqual(['sal']);
		expect(readPlansListSession(storage).types).toEqual(['income']);
	});
});
