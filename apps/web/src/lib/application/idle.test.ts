import { describe, expect, it } from 'vitest';
import { parseIdleSettings, screensaverPrompt } from './idle';

describe('idle screensaver', () => {
	it('defaults to 30 minutes and leave-tab on', () => {
		expect(parseIdleSettings(undefined, undefined)).toEqual({ minutes: 30, leaveTab: true });
	});

	it('uses continue vs unlock copy from lock mode', () => {
		expect(screensaverPrompt({ signedIn: false, lockEnabled: false })).toBe('Click to continue');
		expect(screensaverPrompt({ signedIn: false, lockEnabled: true })).toBe('Click to unlock');
		expect(screensaverPrompt({ signedIn: true, lockEnabled: false })).toBe('Click to unlock');
	});
});
