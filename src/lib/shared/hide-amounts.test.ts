import { describe, expect, it } from 'vitest';
import {
	HIDE_AMOUNTS_STORAGE_KEY,
	parseHideAmounts,
	readHideAmounts,
	writeHideAmounts
} from './hide-amounts';

describe('hide-amounts storage', () => {
	it('defaults to false for missing or garbage', () => {
		expect(parseHideAmounts(null)).toBe(false);
		expect(parseHideAmounts(undefined)).toBe(false);
		expect(parseHideAmounts('')).toBe(false);
		expect(parseHideAmounts('nope')).toBe(false);
		expect(parseHideAmounts('0')).toBe(false);
	});

	it('treats 1 and true as hidden', () => {
		expect(parseHideAmounts('1')).toBe(true);
		expect(parseHideAmounts('true')).toBe(true);
	});

	it('round-trips through storage', () => {
		const map = new Map<string, string>();
		const storage = {
			getItem: (k: string) => map.get(k) ?? null,
			setItem: (k: string, v: string) => {
				map.set(k, v);
			}
		};

		expect(readHideAmounts(storage)).toBe(false);
		writeHideAmounts(true, storage);
		expect(map.get(HIDE_AMOUNTS_STORAGE_KEY)).toBe('1');
		expect(readHideAmounts(storage)).toBe(true);
		writeHideAmounts(false, storage);
		expect(map.get(HIDE_AMOUNTS_STORAGE_KEY)).toBe('0');
		expect(readHideAmounts(storage)).toBe(false);
	});
});
