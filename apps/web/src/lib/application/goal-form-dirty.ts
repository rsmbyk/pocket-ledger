export type GoalFormLive = {
	description: string;
	targetRaw: string;
	dateEnabled: boolean;
	targetOn: string;
};

export type GoalFormBaseline = {
	description: string;
	targetRaw: string;
	targetOn: string | null;
};

export const GOAL_CREATE_BASELINE: GoalFormBaseline = {
	description: '',
	targetRaw: '',
	targetOn: null
};

export function goalFormEffectiveOn(dateEnabled: boolean, targetOn: string): string | null {
	return dateEnabled && targetOn.trim() ? targetOn.trim() : null;
}

/** True when live fields differ from the create/edit baseline. */
export function isGoalFormDirty(live: GoalFormLive, baseline: GoalFormBaseline): boolean {
	return (
		live.description.trim() !== baseline.description.trim() ||
		live.targetRaw !== baseline.targetRaw ||
		goalFormEffectiveOn(live.dateEnabled, live.targetOn) !== baseline.targetOn
	);
}
