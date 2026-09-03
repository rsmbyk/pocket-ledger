export type PocketGoal = {
	id: string;
	accountId: string;
	description: string;
	targetMinor: number;
	/** Deadline YYYY-MM-DD; null = open-ended. */
	targetOn: string | null;
	createdAt: string;
	cancelledAt: string | null;
	deletedAt: string | null;
};

/** @deprecated Use PocketGoal — kept as an alias for backup/import typing. */
export type Goal = PocketGoal;

export type PastGoalBadge = 'Achieved' | 'Missed' | 'Dropped';

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

export function assertGoalDateNotPast(targetOn: string, today: string): void {
	assertGoalDeadline(targetOn);
	if (targetOn < today) {
		throw new Error('Goal date cannot be earlier than today');
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

/** Quantize 0–100 to 10% buckets; 100 is its own stop (spec 171). */
export function goalBarColorStop(percent: number): number {
	const clamped = Math.min(100, Math.max(0, percent));
	if (clamped >= 100) return 100;
	return Math.floor(clamped / 10) * 10;
}

/**
 * Solid fill color for the goal bar. Width still uses the true percent.
 * 0% `--destructive`, 70% `--goal-mid`, 100% `--income`.
 */
export function goalBarFillCss(percent: number): string {
	const stop = goalBarColorStop(percent);
	if (stop <= 70) {
		const t = stop / 70;
		const yellow = Math.round(t * 100);
		const red = 100 - yellow;
		if (yellow === 0) return 'var(--destructive)';
		if (red === 0) return 'var(--goal-mid)';
		return `color-mix(in srgb, var(--destructive) ${red}%, var(--goal-mid) ${yellow}%)`;
	}
	const t = (stop - 70) / 30;
	const green = Math.round(t * 100);
	const yellow = 100 - green;
	if (green === 0) return 'var(--goal-mid)';
	if (yellow === 0) return 'var(--income)';
	return `color-mix(in srgb, var(--goal-mid) ${yellow}%, var(--income) ${green}%)`;
}

/** Money still needed; ≤ 0 when balance meets or exceeds target. */
export function goalRemainingMinor(targetMinor: number, balanceMinor: number): number {
	return targetMinor - balanceMinor;
}

export function isHidden(goal: Pick<PocketGoal, 'deletedAt'>): boolean {
	return goal.deletedAt != null;
}

export function isDropped(goal: Pick<PocketGoal, 'cancelledAt'>): boolean {
	return goal.cancelledAt != null;
}

export function isActive(
	goal: Pick<PocketGoal, 'deletedAt' | 'cancelledAt' | 'targetOn'>,
	today: string
): boolean {
	if (isHidden(goal) || isDropped(goal)) return false;
	return goal.targetOn == null || goal.targetOn >= today;
}

export function isPast(
	goal: Pick<PocketGoal, 'deletedAt' | 'cancelledAt' | 'targetOn'>,
	today: string
): boolean {
	if (isHidden(goal) || goal.targetOn == null) return false;
	return goal.targetOn < today || isDropped(goal);
}

export function sortActiveGoals<T extends PocketGoal>(goals: T[], today: string): T[] {
	const active = goals.filter((g) => isActive(g, today));
	const dated = active.filter((g) => g.targetOn != null);
	const open = active.filter((g) => g.targetOn == null);
	dated.sort((a, b) => {
		const byDate = a.targetOn!.localeCompare(b.targetOn!);
		if (byDate !== 0) return byDate;
		const byCreated = a.createdAt.localeCompare(b.createdAt);
		if (byCreated !== 0) return byCreated;
		return a.id.localeCompare(b.id);
	});
	open.sort((a, b) => {
		const byCreated = a.createdAt.localeCompare(b.createdAt);
		if (byCreated !== 0) return byCreated;
		return a.id.localeCompare(b.id);
	});
	return [...dated, ...open];
}

export function previewGoal<T extends PocketGoal>(goals: T[], today: string): T | null {
	return sortActiveGoals(goals, today)[0] ?? null;
}

export function sortPastGoals<T extends PocketGoal>(goals: T[], today: string): T[] {
	return goals.filter((g) => isPast(g, today)).sort((a, b) => {
		const byDate = (b.targetOn ?? '').localeCompare(a.targetOn ?? '');
		if (byDate !== 0) return byDate;
		const byCreated = b.createdAt.localeCompare(a.createdAt);
		if (byCreated !== 0) return byCreated;
		return b.id.localeCompare(a.id);
	});
}

export function pastGoalBadge(
	goal: PocketGoal,
	endOfDayBalanceMinor: number
): PastGoalBadge {
	if (isDropped(goal)) return 'Dropped';
	return endOfDayBalanceMinor >= goal.targetMinor ? 'Achieved' : 'Missed';
}

export type AccountGoalFields = {
	id: string;
	goalEnabled?: boolean;
	goalTargetMinor?: number | null;
	goalTargetOn?: string | null;
};

/** One-time: pocket goal fields → rows. Skip accounts that already have a row. */
export function migrateAccountGoalsToRows(
	accounts: AccountGoalFields[],
	existing: PocketGoal[],
	nowIso: string
): PocketGoal[] {
	const already = new Set(existing.filter((g) => g.accountId).map((g) => g.accountId));
	const extra: PocketGoal[] = [];
	for (const account of accounts) {
		if (already.has(account.id)) continue;
		const enabled = account.goalEnabled === true || typeof account.goalTargetMinor === 'number';
		if (!enabled || account.goalTargetMinor == null) continue;
		extra.push({
			id: `migrated-goal:${account.id}`,
			accountId: account.id,
			description: '',
			targetMinor: account.goalTargetMinor,
			targetOn: account.goalTargetOn?.trim() ? account.goalTargetOn : null,
			createdAt: nowIso,
			cancelledAt: null,
			deletedAt: null
		});
	}
	return [...existing.filter((g) => g.accountId), ...extra];
}

export function stripAccountGoalFields<T extends AccountGoalFields>(account: T): T {
	return {
		...account,
		goalEnabled: false,
		goalTargetMinor: null,
		goalTargetOn: null
	};
}

/** Restore/import: only rows with accountId become live 152 goals. */
export function normalizeStoredGoal(raw: unknown): PocketGoal | null {
	if (!raw || typeof raw !== 'object') return null;
	const row = raw as Record<string, unknown>;
	if (typeof row.id !== 'string' || !row.id) return null;
	if (typeof row.accountId !== 'string' || !row.accountId) return null;
	if (typeof row.targetMinor !== 'number' || !Number.isInteger(row.targetMinor)) return null;
	const description =
		typeof row.description === 'string'
			? row.description
			: typeof row.name === 'string'
				? row.name
				: '';
	return {
		id: row.id,
		accountId: row.accountId,
		description,
		targetMinor: row.targetMinor,
		targetOn: typeof row.targetOn === 'string' && row.targetOn.trim() ? row.targetOn : null,
		createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
		cancelledAt: typeof row.cancelledAt === 'string' ? row.cancelledAt : null,
		deletedAt: typeof row.deletedAt === 'string' ? row.deletedAt : null
	};
}
