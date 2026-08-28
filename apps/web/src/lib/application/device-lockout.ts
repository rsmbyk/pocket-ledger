/** Device typed-passphrase lockout ladder (Spec 119). Not used for account passphrase or WebAuthn. */

export const WRONGS_PER_RUNG = 3;

/** 15m → 30m → 1h → 3h → 6h → 12h → 1 day */
export const RUNG_MS = [
	15 * 60 * 1000,
	30 * 60 * 1000,
	60 * 60 * 1000,
	3 * 60 * 60 * 1000,
	6 * 60 * 60 * 1000,
	12 * 60 * 60 * 1000,
	24 * 60 * 60 * 1000
] as const;

export type LockoutState = {
	day: string;
	wrongsToday: number;
	successesToday: number;
	wrongStreak: number;
	rung: number;
	lockedUntil: number | null;
};

export function emptyLockout(now = new Date()): LockoutState {
	return {
		day: localDayKey(now),
		wrongsToday: 0,
		successesToday: 0,
		wrongStreak: 0,
		rung: 0,
		lockedUntil: null
	};
}

export function localDayKey(now: Date): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function nextLocalMidnight(now: Date): number {
	const next = new Date(now);
	next.setHours(24, 0, 0, 0);
	return next.getTime();
}

export function isLockedOut(state: LockoutState, nowMs: number): boolean {
	return state.lockedUntil != null && nowMs < state.lockedUntil;
}

function rollDay(state: LockoutState, now: Date): LockoutState {
	const day = localDayKey(now);
	if (state.day === day) return state;
	return { ...state, day, wrongsToday: 0, successesToday: 0 };
}

export function recordWrongGuess(state: LockoutState, now: Date): LockoutState {
	const rolled = rollDay(state, now);
	const wrongStreak = rolled.wrongStreak + 1;
	const wrongsToday = rolled.wrongsToday + 1;
	const next: LockoutState = { ...rolled, wrongStreak, wrongsToday };
	if (wrongStreak % WRONGS_PER_RUNG !== 0) return next;
	const maxIndex = RUNG_MS.length - 1;
	const atMax = rolled.rung >= maxIndex;
	const lockedUntil = atMax ? nextLocalMidnight(now) : now.getTime() + RUNG_MS[rolled.rung]!;
	return {
		...next,
		rung: Math.min(rolled.rung + 1, maxIndex),
		lockedUntil
	};
}

export function recordSuccess(state: LockoutState, now: Date): LockoutState {
	const rolled = rollDay(state, now);
	const successesToday = rolled.successesToday + 1;
	const drop = rolled.wrongsToday === 0 && rolled.successesToday === 0 && rolled.rung > 0;
	return {
		...rolled,
		successesToday,
		wrongStreak: 0,
		lockedUntil: null,
		rung: drop ? rolled.rung - 1 : rolled.rung
	};
}
