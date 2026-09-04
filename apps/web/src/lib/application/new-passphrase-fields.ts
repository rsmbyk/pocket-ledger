/** Live new-passphrase pair (Specs 157, 163, 169, 183). */

export type NewPassphraseLiveState = {
	passLongEnough: boolean;
	passMatch: boolean;
	canSubmit: boolean;
	showPassIcon: boolean;
	showConfirmIcon: boolean;
	showRequirements: boolean;
};

export function newPassphraseLiveState(pass: string, confirm: string): NewPassphraseLiveState {
	const passLongEnough = pass.length >= 8;
	const passMatch = pass.length > 0 && pass === confirm;
	return {
		passLongEnough,
		passMatch,
		canSubmit: passLongEnough && passMatch,
		showPassIcon: pass.length > 0,
		showConfirmIcon: confirm.length > 0,
		showRequirements: pass.length > 0
	};
}
