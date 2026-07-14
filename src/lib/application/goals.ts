import { deleteGoal, listGoals as listGoalsRaw, putGoal } from '$lib/data/goals-repo';
import { assertGoalAmounts, type Goal } from '$lib/domain/goals';
import { parseAmountInput } from '$lib/domain/transaction-rules';
import { openField, sealField } from '$lib/application/field-crypto';

function createId(): string {
	return crypto.randomUUID();
}

export async function listGoals(): Promise<Goal[]> {
	const rows = await listGoalsRaw();
	return Promise.all(
		rows.map(async (goal) => ({
			...goal,
			name: await openField(goal.name)
		}))
	);
}

export async function createGoal(name: string, targetRaw: string): Promise<Goal> {
	const targetMinor = parseAmountInput(targetRaw);
	assertGoalAmounts(targetMinor, 0);
	const namePlain = name.trim() || 'Goal';
	const goal: Goal = {
		id: createId(),
		name: await sealField(namePlain),
		targetMinor,
		savedMinor: 0,
		createdAt: new Date().toISOString()
	};
	await putGoal(goal);
	return { ...goal, name: namePlain };
}

export async function updateGoalSaved(id: string, savedRaw: string): Promise<Goal> {
	const goals = await listGoals();
	const existing = goals.find((g) => g.id === id);
	if (!existing) throw new Error('Goal not found');
	const trimmed = savedRaw.trim().replace(/[,_\s]/g, '') || '0';
	if (!/^\d+$/.test(trimmed)) {
		throw new Error('Saved amount must be a whole number');
	}
	const savedMinor = Number(trimmed);
	assertGoalAmounts(existing.targetMinor, savedMinor);
	const raw = await listGoalsRaw();
	const stored = raw.find((g) => g.id === id);
	if (!stored) throw new Error('Goal not found');
	const updated = { ...stored, savedMinor };
	await putGoal(updated);
	return { ...updated, name: existing.name };
}

export async function removeGoal(id: string): Promise<void> {
	await deleteGoal(id);
}
