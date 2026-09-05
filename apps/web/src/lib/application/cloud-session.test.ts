import { describe, expect, it } from 'vitest';
import {
	AUTH_EPOCH_STORAGE_KEY,
	bumpAuthEpoch,
	isAuthEpochStorageEvent,
	isUnauthorizedError,
	shouldDropCloudSession
} from './cloud-session';

describe('isUnauthorizedError', () => {
	it('matches a 401 with the API error code', () => {
		const err = new Error('unauthorized');
		(err as Error & { status: number }).status = 401;
		expect(isUnauthorizedError(err)).toBe(true);
	});

	it('matches the unauthorized message without a status', () => {
		expect(isUnauthorizedError(new Error('unauthorized'))).toBe(true);
	});

	it('does not match Incorrect passphrase', () => {
		expect(isUnauthorizedError(new Error('Incorrect passphrase'))).toBe(false);
	});

	it('does not match a non-Error', () => {
		expect(isUnauthorizedError('unauthorized')).toBe(false);
	});
});

describe('shouldDropCloudSession', () => {
	it('is true when signed in but me is null', () => {
		expect(shouldDropCloudSession(true, null)).toBe(true);
	});

	it('is false when signed in with a session', () => {
		expect(
			shouldDropCloudSession(true, {
				user: { googleSub: 'sub', email: 'a@b.test' },
				onboarding: 'complete'
			})
		).toBe(false);
	});

	it('is false when already signed out', () => {
		expect(shouldDropCloudSession(false, null)).toBe(false);
	});
});

describe('auth epoch', () => {
	it('writes a numeric epoch under the shared key', () => {
		const store: Record<string, string> = {};
		bumpAuthEpoch({ setItem: (key, value) => (store[key] = value) });
		expect(store[AUTH_EPOCH_STORAGE_KEY]).toMatch(/^\d+$/);
	});

	it('recognizes sibling-tab storage events', () => {
		expect(isAuthEpochStorageEvent(AUTH_EPOCH_STORAGE_KEY)).toBe(true);
		expect(isAuthEpochStorageEvent('pocket-ledger-theme')).toBe(false);
		expect(isAuthEpochStorageEvent(null)).toBe(false);
	});
});
