export type Goal = {
	id: string;
	name: string;
	targetMinor: number;
	/** Deadline YYYY-MM-DD — have target by this date. */
	targetOn: string;
	/** Legacy field retained for backup compat; unused for progress. */
	savedMinor: number;
	createdAt: string;
};

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseGoalDate(value: string): Date {
	const m = YMD.exec(value.trim());
	if (!m) throw new Error('Deadline must be a valid date (YYYY-MM-DD)');
	const y = Number(m[1]);
	const mo = Number(m[2]);
	const d = Number(m[3]);
	const dt = new Date(Date.UTC(y, mo - 1, d));
	if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
		throw new Error('Deadline must be a valid date (YYYY-MM-DD)');
	}
	return dt;
}

export function assertGoalTarget(targetMinor: number): void {
	if (!Number.isInteger(targetMinor) || targetMinor <= 0) {
		throw new Error('Target must be a positive whole number');
	}
}

export function assertGoalDeadline(targetOn: string): void {
	parseGoalDate(targetOn);
}

/** @deprecated Use assertGoalTarget; savedMinor is unused for progress. */
export function assertGoalAmounts(targetMinor: number, savedMinor: number): void {
	assertGoalTarget(targetMinor);
	if (!Number.isInteger(savedMinor) || savedMinor < 0) {
		throw new Error('Saved amount must be a non-negative whole number');
	}
}

export function goalProgressRatio(targetMinor: number, balanceMinor: number): number {
	if (targetMinor <= 0) return 0;
	const bal = Math.max(0, balanceMinor);
	return Math.min(1, bal / targetMinor);
}

export function goalProgressPercent(targetMinor: number, balanceMinor: number): number {
	return Math.round(goalProgressRatio(targetMinor, balanceMinor) * 100);
}

/** Money still needed; ≤ 0 when balance meets or exceeds target. */
export function goalRemainingMinor(targetMinor: number, balanceMinor: number): number {
	return targetMinor - balanceMinor;
}

/** Calendar days from today to deadline; negative = overdue. */
export function daysRemaining(targetOn: string, today: string): number {
	const t = parseGoalDate(targetOn).getTime();
	const d = parseGoalDate(today).getTime();
	return Math.round((t - d) / 86_400_000);
}

/** Rough daily need; null when not applicable. */
export function dailyPaceNeeded(remainingMinor: number, days: number): number | null {
	if (remainingMinor <= 0 || days <= 0) return null;
	return Math.ceil(remainingMinor / days);
}

export function sortGoalsByNearestDeadline<T extends Pick<Goal, 'targetOn' | 'targetMinor'>>(
	goals: T[],
	balanceMinor: number
): T[] {
	return [...goals].sort((a, b) => {
		const byDate = a.targetOn.localeCompare(b.targetOn);
		if (byDate !== 0) return byDate;
		const remA = goalRemainingMinor(a.targetMinor, balanceMinor);
		const remB = goalRemainingMinor(b.targetMinor, balanceMinor);
		return remB - remA;
	});
}

/** @deprecated Prefer balance-based helpers. */
export function goalProgressRatioFromSaved(goal: Pick<Goal, 'targetMinor' | 'savedMinor'>): number {
	return goalProgressRatio(goal.targetMinor, goal.savedMinor);
}

/** @deprecated Prefer balance-based helpers. */
export function goalProgressPercentFromSaved(goal: Pick<Goal, 'targetMinor' | 'savedMinor'>): number {
	return goalProgressPercent(goal.targetMinor, goal.savedMinor);
}
