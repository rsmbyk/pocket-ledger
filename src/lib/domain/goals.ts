export type Goal = {
	id: string;
	name: string;
	targetMinor: number;
	savedMinor: number;
	createdAt: string;
};

export function goalProgressRatio(goal: Pick<Goal, 'targetMinor' | 'savedMinor'>): number {
	if (goal.targetMinor <= 0) return 0;
	return Math.min(1, goal.savedMinor / goal.targetMinor);
}

export function goalProgressPercent(goal: Pick<Goal, 'targetMinor' | 'savedMinor'>): number {
	return Math.round(goalProgressRatio(goal) * 100);
}

export function assertGoalAmounts(targetMinor: number, savedMinor: number): void {
	if (!Number.isInteger(targetMinor) || targetMinor <= 0) {
		throw new Error('Target must be a positive whole number');
	}
	if (!Number.isInteger(savedMinor) || savedMinor < 0) {
		throw new Error('Saved amount must be a non-negative whole number');
	}
}
