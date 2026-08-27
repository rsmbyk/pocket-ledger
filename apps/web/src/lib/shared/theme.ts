export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'pocket-ledger-theme';

export function parseThemePreference(value: string | null | undefined): ThemePreference {
	if (value === 'light' || value === 'dark' || value === 'system') {
		return value;
	}
	return 'system';
}

export function resolveTheme(
	preference: ThemePreference,
	systemPrefersDark: boolean
): ResolvedTheme {
	if (preference === 'system') {
		return systemPrefersDark ? 'dark' : 'light';
	}
	return preference;
}

export function readStoredThemePreference(
	storage: Pick<Storage, 'getItem'> | null | undefined = globalThis.localStorage
): ThemePreference {
	try {
		return parseThemePreference(storage?.getItem(THEME_STORAGE_KEY) ?? null);
	} catch {
		return 'system';
	}
}

export function writeStoredThemePreference(
	preference: ThemePreference,
	storage: Pick<Storage, 'setItem'> | null | undefined = globalThis.localStorage
): void {
	try {
		storage?.setItem(THEME_STORAGE_KEY, preference);
	} catch {
		// Ignore quota / private-mode failures; theme still applies in-session.
	}
}
