/** Live new-passphrase pair (Specs 157, 163, 169, 183, 191). */

export type NewPassphraseLiveState = {
	passLongEnough: boolean;
	passMatch: boolean;
	passDiffersFromOld: boolean;
	canSubmit: boolean;
	showPassIcon: boolean;
	showConfirmIcon: boolean;
	showRequirements: boolean;
	showDifferRule: boolean;
};

export function newPassphraseLiveState(
	pass: string,
	confirm: string,
	mustDifferFrom = ''
): NewPassphraseLiveState {
	const passLongEnough = pass.length >= 8;
	const passMatch = pass.length > 0 && pass === confirm;
	const passDiffersFromOld = !mustDifferFrom || pass !== mustDifferFrom;
	return {
		passLongEnough,
		passMatch,
		passDiffersFromOld,
		canSubmit: passLongEnough && passMatch && passDiffersFromOld,
		showPassIcon: pass.length > 0,
		showConfirmIcon: confirm.length > 0,
		showRequirements: pass.length > 0,
		showDifferRule: Boolean(mustDifferFrom) && pass.length > 0
	};
}
