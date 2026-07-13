import { describe, expect, it } from 'vitest';
import {
	parseThemePreference,
	resolveTheme,
	THEME_STORAGE_KEY,
	writeStoredThemePreference,
	readStoredThemePreference
} from './theme';

describe('theme', () => {
	it('defaults unknown values to system', () => {
		expect(parseThemePreference(null)).toBe('system');
		expect(parseThemePreference('nope')).toBe('system');
	});

	it('resolves system preference from OS', () => {
		expect(resolveTheme('system', true)).toBe('dark');
		expect(resolveTheme('system', false)).toBe('light');
	});

	it('honors explicit light and dark', () => {
		expect(resolveTheme('light', true)).toBe('light');
		expect(resolveTheme('dark', false)).toBe('dark');
	});

	it('persists preference through storage', () => {
		const store = new Map<string, string>();
		const storage = {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => {
				store.set(key, value);
			}
		};

		writeStoredThemePreference('dark', storage);
		expect(store.get(THEME_STORAGE_KEY)).toBe('dark');
		expect(readStoredThemePreference(storage)).toBe('dark');
	});
});
