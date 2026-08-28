import { deleteGoal, listGoals as listGoalsRaw, putGoal } from '$lib/data/goals-repo';
import {
	assertGoalDeadline,
	assertGoalTarget,
	sortGoalsByNearestDeadline,
	type Goal
} from '$lib/domain/goals';
import { parseAmountInput } from '$lib/domain/transaction-rules';
import { openField, sealField } from '$lib/application/field-crypto';

function createId(): string {
	return crypto.randomUUID();
}

export async function listGoals(): Promise<Goal[]> {
	const rows = await listGoalsRaw();
	const opened = await Promise.all(
		rows.map(async (goal) => ({
			...goal,
			name: await openField(goal.name),
			targetOn: goal.targetOn ?? '2099-12-31'
		}))
	);
	return opened;
}

export async function listGoalsNearestFirst(balanceMinor: number): Promise<Goal[]> {
	return sortGoalsByNearestDeadline(await listGoals(), balanceMinor);
}

export async function createGoal(
	name: string,
	targetRaw: string,
	targetOn: string
): Promise<Goal> {
	const targetMinor = parseAmountInput(targetRaw);
	assertGoalTarget(targetMinor);
	assertGoalDeadline(targetOn);
	const namePlain = name.trim() || 'Goal';
	const goal: Goal = {
		id: createId(),
		name: await sealField(namePlain),
		targetMinor,
		targetOn: targetOn.trim(),
		savedMinor: 0,
		createdAt: new Date().toISOString()
	};
	await putGoal(goal);
	return { ...goal, name: namePlain };
}

export async function updateGoal(
	id: string,
	input: { name?: string; targetRaw?: string; targetOn?: string }
): Promise<Goal> {
	const goals = await listGoals();
	const existing = goals.find((g) => g.id === id);
	if (!existing) throw new Error('Goal not found');
	const raw = await listGoalsRaw();
	const stored = raw.find((g) => g.id === id);
	if (!stored) throw new Error('Goal not found');

	const namePlain = input.name !== undefined ? input.name.trim() || 'Goal' : existing.name;
	const targetMinor =
		input.targetRaw !== undefined ? parseAmountInput(input.targetRaw) : existing.targetMinor;
	const targetOn = input.targetOn !== undefined ? input.targetOn.trim() : existing.targetOn;
	assertGoalTarget(targetMinor);
	assertGoalDeadline(targetOn);

	const updated: Goal = {
		...stored,
		name: await sealField(namePlain),
		targetMinor,
		targetOn,
		savedMinor: 0
	};
	await putGoal(updated);
	return { ...updated, name: namePlain };
}

/** @deprecated Progress is balance-driven; kept for backup-era callers. */
export async function updateGoalSaved(id: string, savedRaw: string): Promise<Goal> {
	void savedRaw;
	const goals = await listGoals();
	const existing = goals.find((g) => g.id === id);
	if (!existing) throw new Error('Goal not found');
	return existing;
}

export async function removeGoal(id: string): Promise<void> {
	await deleteGoal(id);
}
