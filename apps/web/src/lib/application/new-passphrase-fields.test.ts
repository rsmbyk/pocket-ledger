import { describe, expect, it } from 'vitest';
import { newPassphraseLiveState } from './new-passphrase-fields';

describe('newPassphraseLiveState', () => {
	it('keeps empty fields quiet and submit disabled', () => {
		expect(newPassphraseLiveState('', '')).toEqual({
			passLongEnough: false,
			passMatch: false,
			passDiffersFromOld: true,
			canSubmit: false,
			showPassIcon: false,
			showConfirmIcon: false,
			showRequirements: false,
			showDifferRule: false
		});
	});

	it('shows length chrome after typing a short passphrase', () => {
		const state = newPassphraseLiveState('short', '');
		expect(state.showPassIcon).toBe(true);
		expect(state.showRequirements).toBe(true);
		expect(state.passLongEnough).toBe(false);
		expect(state.showConfirmIcon).toBe(false);
		expect(state.canSubmit).toBe(false);
	});

	it('enables submit when length is met and confirm matches', () => {
		const state = newPassphraseLiveState('secret-pass', 'secret-pass');
		expect(state.passLongEnough).toBe(true);
		expect(state.passMatch).toBe(true);
		expect(state.canSubmit).toBe(true);
		expect(state.showPassIcon).toBe(true);
		expect(state.showConfirmIcon).toBe(true);
	});

	it('does not match when confirm differs', () => {
		const state = newPassphraseLiveState('secret-pass', 'other-pass');
		expect(state.passLongEnough).toBe(true);
		expect(state.passMatch).toBe(false);
		expect(state.canSubmit).toBe(false);
	});

	it('blocks submit and shows the differ rule when new equals old', () => {
		const state = newPassphraseLiveState('account-pass', 'account-pass', 'account-pass');
		expect(state.passLongEnough).toBe(true);
		expect(state.passMatch).toBe(true);
		expect(state.passDiffersFromOld).toBe(false);
		expect(state.canSubmit).toBe(false);
		expect(state.showDifferRule).toBe(true);
		expect(state.showPassIcon).toBe(true);
	});

	it('allows a new passphrase that differs from old', () => {
		const state = newPassphraseLiveState('new-account-pass', 'new-account-pass', 'account-pass');
		expect(state.passDiffersFromOld).toBe(true);
		expect(state.canSubmit).toBe(true);
		expect(state.showDifferRule).toBe(true);
	});
});
