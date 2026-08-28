/** Screensaver copy and idle choices (Spec 119). */

export const IDLE_MINUTES = [5, 10, 15, 30] as const;
export const DEFAULT_IDLE_MINUTES = 30;
export const DEFAULT_LEAVE_TAB = true;

export type IdleSettings = {
	minutes: (typeof IDLE_MINUTES)[number];
	leaveTab: boolean;
};

export function parseIdleSettings(
	minutesRaw: string | undefined,
	leaveTabRaw: string | undefined
): IdleSettings {
	const minutes = Number(minutesRaw);
	return {
		minutes: (IDLE_MINUTES as readonly number[]).includes(minutes)
			? (minutes as IdleSettings['minutes'])
			: DEFAULT_IDLE_MINUTES,
		leaveTab: leaveTabRaw === undefined ? DEFAULT_LEAVE_TAB : leaveTabRaw === 'true'
	};
}

/** Signed-out without passphrase → continue. Passphrase on or signed in → unlock. */
export function screensaverPrompt(opts: { signedIn: boolean; lockEnabled: boolean }): string {
	if (opts.signedIn || opts.lockEnabled) return 'Click to unlock';
	return 'Click to continue';
}
