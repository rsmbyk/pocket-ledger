import { deleteGoal, listGoals, putGoal } from '$lib/data/goals-repo';
import { assertGoalAmounts, type Goal } from '$lib/domain/goals';
import { parseAmountInput } from '$lib/domain/transaction-rules';

function createId(): string {
	return crypto.randomUUID();
}

export async function createGoal(name: string, targetRaw: string): Promise<Goal> {
	const targetMinor = parseAmountInput(targetRaw);
	assertGoalAmounts(targetMinor, 0);
	const goal: Goal = {
		id: createId(),
		name: name.trim() || 'Goal',
		targetMinor,
		savedMinor: 0,
		createdAt: new Date().toISOString()
	};
	await putGoal(goal);
	return goal;
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
	const updated = { ...existing, savedMinor };
	await putGoal(updated);
	return updated;
}

export async function removeGoal(id: string): Promise<void> {
	await deleteGoal(id);
}

export { listGoals };
