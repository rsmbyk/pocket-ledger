import { db } from '$lib/data/db';
import {
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_LOCK_SALT,
	SETTINGS_LOCK_VERIFIER,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
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
	SETTINGS_ENCRYPTION_ENABLED,
	SETTINGS_RAW_DEK,
	SETTINGS_WRAPPED_DEK
]);

/**
 * Wipe ledger data with optional preserve for categories and passphrase lock.
 * Always clears transactions, goals, net-worth, and the session key.
 * Recreates the default Main account.
 * Preserving categories also keeps the raw DEK so sealed names stay readable
 * (Spec 024 after always-on DEK).
 */
export async function resetLocalData(options: ResetLocalDataOptions): Promise<void> {
	const keepKeys = new Set<string>();
	if (options.preservePassphrase) {
		for (const key of LOCK_SETTING_KEYS) keepKeys.add(key);
	}
	if (options.preserveCategories) {
		keepKeys.add(SETTINGS_RAW_DEK);
		keepKeys.add(SETTINGS_ENCRYPTION_ENABLED);
	}
	const preservedSettings =
		keepKeys.size > 0
			? (await db.settings.toArray()).filter((row) => keepKeys.has(row.key))
			: [];

	await db.transaction(
		'rw',
		[db.accounts, db.categories, db.transactions, db.goals, db.netWorthSnapshots, db.settings],
		async () => {
			await Promise.all([
				db.accounts.clear(),
				db.transactions.clear(),
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
