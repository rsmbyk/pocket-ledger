import { db } from '$lib/data/db';
import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER
} from '$lib/data/db';
import { clearDataKey } from '$lib/data/session-key';
import { ensureDefaultAccount } from '$lib/application/accounts';

export type ResetLocalDataOptions = {
	preserveCategories: boolean;
	preservePassphrase: boolean;
};

const LOCK_SETTING_KEYS = new Set([
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_ENCRYPTION_ENABLED
]);

/**
 * Wipe ledger data with optional preserve for categories and passphrase lock.
 * Always clears transactions, recurring, goals, net-worth, and the session key.
 * Recreates the default Main account.
 */
export async function resetLocalData(options: ResetLocalDataOptions): Promise<void> {
	const preservedSettings = options.preservePassphrase
		? (await db.settings.toArray()).filter((row) => LOCK_SETTING_KEYS.has(row.key))
		: [];

	await db.transaction(
		'rw',
		[
			db.accounts,
			db.categories,
			db.transactions,
			db.recurringRules,
			db.goals,
			db.netWorthSnapshots,
			db.settings
		],
		async () => {
			await Promise.all([
				db.accounts.clear(),
				db.transactions.clear(),
				db.recurringRules.clear(),
				db.goals.clear(),
				db.netWorthSnapshots.clear(),
				db.settings.clear(),
				...(options.preserveCategories ? [] : [db.categories.clear()])
			]);
			if (preservedSettings.length > 0) {
				await db.settings.bulkPut(preservedSettings);
			}
		}
	);

	clearDataKey();
	await ensureDefaultAccount();
}
