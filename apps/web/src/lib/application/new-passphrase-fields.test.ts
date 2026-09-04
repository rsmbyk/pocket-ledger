import { describe, expect, it } from 'vitest';
import { newPassphraseLiveState } from './new-passphrase-fields';

describe('newPassphraseLiveState', () => {
	it('keeps empty fields quiet and submit disabled', () => {
		expect(newPassphraseLiveState('', '')).toEqual({
			passLongEnough: false,
			passMatch: false,
			canSubmit: false,
			showPassIcon: false,
			showConfirmIcon: false,
			showRequirements: false
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
});
