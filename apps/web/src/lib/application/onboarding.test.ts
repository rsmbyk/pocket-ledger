import { describe, expect, it } from 'vitest';
import { accountOnboardingStep, moneyUiAllowed } from './onboarding';

describe('account onboarding', () => {
	it('returns to set-passphrase when Google succeeded with no wrap', () => {
		expect(accountOnboardingStep({ wrap: null, recoveryWrap: null }, false)).toBe(
			'needs-passphrase'
		);
		expect(moneyUiAllowed('needs-passphrase')).toBe(false);
	});

	it('returns to the hex kit when wrap exists but recovery does not', () => {
		expect(accountOnboardingStep({ wrap: { kdf: 'pbkdf2-sha256' }, recoveryWrap: null }, true)).toBe(
			'needs-kit'
		);
		expect(moneyUiAllowed('needs-kit')).toBe(false);
	});

	it('blocks the ledger until unlock after a completed kit', () => {
		expect(
			accountOnboardingStep({ wrap: {}, recoveryWrap: {} }, false)
		).toBe('needs-unlock');
		expect(accountOnboardingStep({ wrap: {}, recoveryWrap: {} }, true)).toBe('complete');
		expect(moneyUiAllowed('complete')).toBe(true);
	});
});
