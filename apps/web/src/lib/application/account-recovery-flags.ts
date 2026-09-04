import { SETTINGS_PENDING_PASSPHRASE_RESET, SETTINGS_RECOVERY_OFFERED } from '$lib/data/db';
import { getSetting, setSetting } from '$lib/data/settings-repo';

export async function loadRecoveryOffered(): Promise<boolean> {
	return (await getSetting(SETTINGS_RECOVERY_OFFERED)) === '1';
}

export async function saveRecoveryOffered(offered: boolean): Promise<void> {
	await setSetting(SETTINGS_RECOVERY_OFFERED, offered ? '1' : '0');
}

export async function loadPendingPassphraseReset(): Promise<boolean> {
	return (await getSetting(SETTINGS_PENDING_PASSPHRASE_RESET)) === '1';
}

export async function savePendingPassphraseReset(pending: boolean): Promise<void> {
	await setSetting(SETTINGS_PENDING_PASSPHRASE_RESET, pending ? '1' : '0');
}
