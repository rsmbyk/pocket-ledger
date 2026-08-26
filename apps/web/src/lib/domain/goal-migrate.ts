import type { Goal } from '$lib/domain/goals';

/** Pick nearest-deadline legacy goal for Main migration (072). */
export function pickNearestGoalForMigration<T extends Pick<Goal, 'targetOn' | 'targetMinor' | 'id'>>(
	goals: T[]
): T | null {
	if (goals.length === 0) return null;
	return [...goals].sort((a, b) => {
		const byDate = a.targetOn.localeCompare(b.targetOn);
		if (byDate !== 0) return byDate;
		return a.id.localeCompare(b.id);
	})[0]!;
}
