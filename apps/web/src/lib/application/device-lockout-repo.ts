import { SETTINGS_LOCKOUT } from '$lib/data/db';
import { getSetting, setSetting } from '$lib/data/settings-repo';
import { emptyLockout, type LockoutState } from '$lib/application/device-lockout';

export async function loadLockout(now = new Date()): Promise<LockoutState> {
	const raw = await getSetting(SETTINGS_LOCKOUT);
	if (!raw) return emptyLockout(now);
	try {
		return { ...emptyLockout(now), ...(JSON.parse(raw) as LockoutState) };
	} catch {
		return emptyLockout(now);
	}
}

export async function saveLockout(state: LockoutState): Promise<void> {
	await setSetting(SETTINGS_LOCKOUT, JSON.stringify(state));
}
