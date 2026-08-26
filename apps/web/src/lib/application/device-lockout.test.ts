import { describe, expect, it } from 'vitest';
import {
	isLockedOut,
	recordSuccess,
	recordWrongGuess,
	emptyLockout,
	RUNG_MS
} from './device-lockout';

describe('device lockout ladder', () => {
	it('locks for 15 minutes after three consecutive wrongs', () => {
		const now = new Date('2026-08-26T12:00:00');
		let state = emptyLockout(now);
		state = recordWrongGuess(state, now);
		state = recordWrongGuess(state, now);
		expect(isLockedOut(state, now.getTime())).toBe(false);
		state = recordWrongGuess(state, now);
		expect(state.lockedUntil).toBe(now.getTime() + RUNG_MS[0]);
		expect(isLockedOut(state, now.getTime() + 14 * 60 * 1000)).toBe(true);
	});

	it('waits until next local midnight at the max rung', () => {
		const now = new Date('2026-08-26T12:00:00');
		let state = emptyLockout(now);
		state = { ...state, rung: 6, wrongStreak: 2 };
		state = recordWrongGuess(state, now);
		expect(state.lockedUntil).toBe(new Date('2026-08-27T00:00:00').getTime());
	});

	it('drops one rung on a clean success day', () => {
		const day1 = new Date('2026-08-26T12:00:00');
		let state = emptyLockout(day1);
		state = { ...state, rung: 2 };
		state = recordSuccess(state, day1);
		expect(state.rung).toBe(1);
		const day2 = new Date('2026-08-27T09:00:00');
		state = recordSuccess(state, day2);
		expect(state.rung).toBe(0);
	});
});
