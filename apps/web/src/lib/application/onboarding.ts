/** Account onboarding resume (Spec 119). */

export type OnboardingStep = 'needs-passphrase' | 'needs-kit' | 'needs-unlock' | 'complete';

export type AccountLockRecord = {
	wrap: unknown | null;
	recoveryWrap: unknown | null;
};

export function accountOnboardingStep(
	record: AccountLockRecord | null,
	dekInRam: boolean
): OnboardingStep {
	if (!record?.wrap) return 'needs-passphrase';
	if (!record.recoveryWrap) return 'needs-kit';
	if (!dekInRam) return 'needs-unlock';
	return 'complete';
}

export function moneyUiAllowed(step: OnboardingStep): boolean {
	return step === 'complete';
}
