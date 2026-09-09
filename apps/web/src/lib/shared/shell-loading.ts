/** Session vs ledger loading for shell skeletons (spec 245). */

export type ShellSessionFlags = {
	unlocked: boolean;
	signedIn: boolean;
	accountOnboarding: string | null;
	accountRecoveryOpen: boolean;
	pendingPassphraseReset: boolean;
	dekPresent: boolean;
};

/** True when the shell should decrypt and refresh the ledger (not a full-screen gate). */
export function shellNeedsLedger(flags: ShellSessionFlags): boolean {
	if (!flags.unlocked) return false;
	if (
		flags.signedIn &&
		(flags.accountRecoveryOpen || (flags.pendingPassphraseReset && !flags.dekPresent))
	) {
		return false;
	}
	if (flags.signedIn && flags.accountOnboarding && flags.accountOnboarding !== 'complete') {
		return false;
	}
	return true;
}

/** Centered spinner (221) only while lock / cloud session is unknown. */
export function shouldShowStartupSpinner(sessionReady: boolean): boolean {
	return !sessionReady;
}

/** Destination-shaped stage skeleton while the shell is up and the ledger is not. */
export function shouldShowShellSkeleton(input: {
	sessionReady: boolean;
	ledgerReady: boolean;
	gated: boolean;
}): boolean {
	return input.sessionReady && !input.gated && !input.ledgerReady;
}

/** Keep `/pockets/:id` on a details skeleton until ledger refresh finishes. */
export function shouldShowPocketDetailsSkeleton(input: {
	pocketId: string | null;
	ledgerReady: boolean;
}): boolean {
	return Boolean(input.pocketId) && !input.ledgerReady;
}

/** Redirect a missing pocket id only after the ledger is ready. */
export function shouldRedirectMissingPocket(input: {
	pocketId: string | null;
	pocketFound: boolean;
	ledgerReady: boolean;
}): boolean {
	return input.ledgerReady && Boolean(input.pocketId) && !input.pocketFound;
}
