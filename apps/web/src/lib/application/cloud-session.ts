/** Detect a dead Google session so signed-in gates can drop to local-only (Spec 211). */

import type { AuthMe } from './cloud-api';

export const AUTH_EPOCH_STORAGE_KEY = 'pocket-ledger-auth-epoch';

export function isUnauthorizedError(err: unknown): boolean {
	if (!(err instanceof Error)) return false;
	if ('status' in err && (err as Error & { status: number }).status === 401) return true;
	return err.message === 'unauthorized';
}

export function shouldDropCloudSession(signedIn: boolean, me: AuthMe | null): boolean {
	return signedIn && me === null;
}

export function bumpAuthEpoch(storage: { setItem(key: string, value: string): void }): void {
	storage.setItem(AUTH_EPOCH_STORAGE_KEY, String(Date.now()));
}

export function isAuthEpochStorageEvent(key: string | null): boolean {
	return key === AUTH_EPOCH_STORAGE_KEY;
}
