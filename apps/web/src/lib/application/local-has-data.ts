import { db } from '$lib/data/db';
import { DEFAULT_ACCOUNT_NAME } from '$lib/domain/account';

const SYSTEM_SETTING_PREFIXES = ['lock.', 'encryption.'];

/** Spec 119: has-data = not a virgin default Main + default settings. */
export async function localHasData(): Promise<boolean> {
	const [accounts, transactions, categories, settings] = await Promise.all([
		db.accounts.toArray(),
		db.transactions.toArray(),
		db.categories.toArray(),
		db.settings.toArray()
	]);
	if (transactions.length > 0) return true;
	if (categories.length > 0) return true;
	if (accounts.length !== 1) return true;
	const main = accounts[0];
	if (!main || main.name !== DEFAULT_ACCOUNT_NAME || !main.isMain) return true;
	if (main.openingEnabled || main.goalEnabled || (main.notes && main.notes.length > 0)) return true;
	return settings.some((s) => !SYSTEM_SETTING_PREFIXES.some((p) => s.key.startsWith(p)));
}
