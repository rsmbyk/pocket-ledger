export const HIDE_AMOUNTS_STORAGE_KEY = 'pocket-ledger-hide-amounts';

/** Parse stored hide-amounts preference; missing/garbage → false (show amounts). */
export function parseHideAmounts(value: string | null | undefined): boolean {
	if (value === '1' || value === 'true') return true;
	return false;
}

export function readHideAmounts(
	storage: Pick<Storage, 'getItem'> | null | undefined = globalThis.localStorage
): boolean {
	try {
		return parseHideAmounts(storage?.getItem(HIDE_AMOUNTS_STORAGE_KEY) ?? null);
	} catch {
		return false;
	}
}

export function writeHideAmounts(
	hidden: boolean,
	storage: Pick<Storage, 'setItem'> | null | undefined = globalThis.localStorage
): void {
	try {
		storage?.setItem(HIDE_AMOUNTS_STORAGE_KEY, hidden ? '1' : '0');
	} catch {
		// Ignore quota / private-mode failures; preference still applies in-session.
	}
}
