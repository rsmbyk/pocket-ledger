import { db } from '$lib/data/db';
import {
	SETTINGS_DISPLAY_CURRENCY,
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_IDLE_LEAVE_TAB,
	SETTINGS_IDLE_MINUTES,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
} from '$lib/data/db';
import { clearDataKey } from '$lib/data/session-key';
import { ensureDefaultAccount } from '$lib/application/accounts';

export type ResetLocalDataOptions = {
	preserveSettings: boolean;
	preservePassphrase: boolean;
};

const LOCK_SETTING_KEYS = new Set([
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
]);

const DISPLAY_SETTING_KEYS = new Set([
	SETTINGS_DISPLAY_CURRENCY,
	SETTINGS_IDLE_MINUTES,
	SETTINGS_IDLE_LEAVE_TAB
]);

/**
 * Wipe ledger data. Categories always go. Settings (currency + idle) and
 * the device passphrase can be kept. Recreates the default Main account.
 */
export async function resetLocalData(options: ResetLocalDataOptions): Promise<void> {
	const keepKeys = new Set<string>();
	if (options.preservePassphrase) {
		for (const key of LOCK_SETTING_KEYS) keepKeys.add(key);
	}
	if (options.preserveSettings) {
		for (const key of DISPLAY_SETTING_KEYS) keepKeys.add(key);
	}
	const preservedSettings =
		keepKeys.size > 0 ? (await db.settings.toArray()).filter((row) => keepKeys.has(row.key)) : [];

	await db.transaction(
		'rw',
		[
			db.accounts,
			db.categories,
			db.categoryGroups,
			db.transactions,
			db.goals,
			db.netWorthSnapshots,
			db.settings
		],
		async () => {
			await Promise.all([
				db.accounts.clear(),
				db.transactions.clear(),
				db.goals.clear(),
				db.netWorthSnapshots.clear(),
				db.settings.clear(),
				db.categories.clear(),
				db.categoryGroups.clear()
			]);
			if (preservedSettings.length > 0) {
				await db.settings.bulkPut(preservedSettings);
			}
		}
	);

	clearDataKey();
	await ensureDefaultAccount();
}
