import { describe, expect, it } from 'vitest';
import {
	shellNeedsLedger,
	shouldRedirectMissingPocket,
	shouldShowPocketDetailsSkeleton,
	shouldShowShellSkeleton,
	shouldShowStartupSpinner,
	type ShellSessionFlags
} from './shell-loading';

const unlockedLocal: ShellSessionFlags = {
	unlocked: true,
	signedIn: false,
	accountOnboarding: null,
	accountRecoveryOpen: false,
	pendingPassphraseReset: false,
	dekPresent: true
};

describe('shouldShowStartupSpinner', () => {
	it('is true only before the session is known', () => {
		expect(shouldShowStartupSpinner(false)).toBe(true);
		expect(shouldShowStartupSpinner(true)).toBe(false);
	});
});

describe('shouldShowShellSkeleton', () => {
	it('shows the stage skeleton when the shell is up and the ledger is not', () => {
		expect(
			shouldShowShellSkeleton({ sessionReady: true, ledgerReady: false, gated: false })
		).toBe(true);
	});

	it('hides the skeleton while the session is unknown, on a gate, or after ledger ready', () => {
		expect(
			shouldShowShellSkeleton({ sessionReady: false, ledgerReady: false, gated: false })
		).toBe(false);
		expect(
			shouldShowShellSkeleton({ sessionReady: true, ledgerReady: false, gated: true })
		).toBe(false);
		expect(
			shouldShowShellSkeleton({ sessionReady: true, ledgerReady: true, gated: false })
		).toBe(false);
	});
});

describe('shellNeedsLedger', () => {
	it('loads the ledger for an unlocked local session', () => {
		expect(shellNeedsLedger(unlockedLocal)).toBe(true);
	});

	it('skips the ledger while locked or in onboarding / recovery', () => {
		expect(shellNeedsLedger({ ...unlockedLocal, unlocked: false })).toBe(false);
		expect(
			shellNeedsLedger({
				...unlockedLocal,
				signedIn: true,
				accountOnboarding: 'needs-passphrase'
			})
		).toBe(false);
		expect(
			shellNeedsLedger({
				...unlockedLocal,
				signedIn: true,
				accountOnboarding: 'complete',
				accountRecoveryOpen: true
			})
		).toBe(false);
		expect(
			shellNeedsLedger({
				...unlockedLocal,
				signedIn: true,
				accountOnboarding: 'complete',
				pendingPassphraseReset: true,
				dekPresent: false
			})
		).toBe(false);
	});

	it('loads the ledger for a signed-in complete unlocked session', () => {
		expect(
			shellNeedsLedger({
				...unlockedLocal,
				signedIn: true,
				accountOnboarding: 'complete'
			})
		).toBe(true);
	});
});

describe('pocket details wait', () => {
	it('skeletons /pockets/:id until the ledger is ready', () => {
		expect(shouldShowPocketDetailsSkeleton({ pocketId: 'abc', ledgerReady: false })).toBe(true);
		expect(shouldShowPocketDetailsSkeleton({ pocketId: 'abc', ledgerReady: true })).toBe(false);
		expect(shouldShowPocketDetailsSkeleton({ pocketId: null, ledgerReady: false })).toBe(false);
	});

	it('redirects a missing pocket only after ledger ready', () => {
		expect(
			shouldRedirectMissingPocket({ pocketId: 'abc', pocketFound: false, ledgerReady: false })
		).toBe(false);
		expect(
			shouldRedirectMissingPocket({ pocketId: 'abc', pocketFound: false, ledgerReady: true })
		).toBe(true);
		expect(
			shouldRedirectMissingPocket({ pocketId: 'abc', pocketFound: true, ledgerReady: true })
		).toBe(false);
	});
});
