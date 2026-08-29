import { db, SETTINGS_CATEGORY_MIGRATED } from '$lib/data/db';
import { DEFAULT_ACCOUNT_NAME } from '$lib/domain/account';

const SYSTEM_SETTING_PREFIXES = ['lock.', 'encryption.'];

function isSystemSetting(key: string): boolean {
	if (key === SETTINGS_CATEGORY_MIGRATED) return true;
	return SYSTEM_SETTING_PREFIXES.some((p) => key.startsWith(p));
}

/** Spec 119: has-data = not a virgin default Main + default settings. */
export async function localHasData(): Promise<boolean> {
	const [accounts, transactions, categories, categoryGroups, settings] = await Promise.all([
		db.accounts.toArray(),
		db.transactions.toArray(),
		db.categories.toArray(),
		db.categoryGroups.toArray(),
		db.settings.toArray()
	]);
	if (transactions.length > 0) return true;
	if (categories.length > 0) return true;
	if (categoryGroups.length > 0) return true;
	if (accounts.length !== 1) return true;
	const main = accounts[0];
	if (!main || main.name !== DEFAULT_ACCOUNT_NAME || !main.isMain) return true;
	if (main.openingEnabled || main.goalEnabled || (main.notes && main.notes.length > 0)) return true;
	return settings.some((s) => !isSystemSetting(s.key));
}
