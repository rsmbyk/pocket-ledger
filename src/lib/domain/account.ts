/** Account / Pocket identity (Dexie table remains `accounts`; UI says Pocket). */
export type AccountId = string;

export type Account = {
	id: AccountId;
	name: string;
	/** Display-only currency label; multi-currency is out of scope for now. */
	currencyLabel: string;
	createdAt: string;
	/** Exactly one pocket should be Main after ensure. */
	isMain: boolean;
	/** Order among non-Main pockets (Main always sorts first regardless). */
	sortOrder: number;
	notes: string;
	/** Known balance as of `openingAsOf` (signed minor units). */
	openingBalanceMinor: number;
	/** YYYY-MM-DD — txs before this date do not affect derived balance. */
	openingAsOf: string;
	/** False = opening is the implicit default (0 + creation date), not user-set. */
	openingEnabled: boolean;
	/** Optional goal target; null = no goal. */
	goalTargetMinor: number | null;
	/** Optional goal deadline YYYY-MM-DD; null = target-only. */
	goalTargetOn: string | null;
	/** False = no goal (target/date cleared). */
	goalEnabled: boolean;
};

export const DEFAULT_ACCOUNT_NAME = 'Main';
export const DEFAULT_CURRENCY_LABEL = 'IDR';

export type AccountLike = Partial<Account> &
	Pick<Account, 'id' | 'name' | 'currencyLabel' | 'createdAt'>;

/** Calendar date (YYYY-MM-DD) from ISO `createdAt`. */
export function pocketCreationDate(createdAt: string): string {
	return createdAt.slice(0, 10);
}

/** Infer whether opening was user-set (migration / legacy rows). */
export function inferOpeningEnabled(
	row: Pick<AccountLike, 'openingBalanceMinor' | 'openingAsOf' | 'createdAt'>
): boolean {
	const opening =
		typeof row.openingBalanceMinor === 'number' ? row.openingBalanceMinor : 0;
	const asOf = row.openingAsOf?.trim() || '';
	const creation = pocketCreationDate(row.createdAt);
	return opening !== 0 || (asOf !== '' && asOf !== creation);
}

/** Infer whether a goal was set (migration / legacy rows). */
export function inferGoalEnabled(row: Pick<AccountLike, 'goalTargetMinor'>): boolean {
	return typeof row.goalTargetMinor === 'number';
}

/** Normalize legacy / partial account rows to the full Account shape. */
export function normalizeAccount(
	row: AccountLike,
	opts?: { today?: string; sortOrder?: number; isMain?: boolean }
): Account {
	const today = opts?.today ?? new Date().toISOString().slice(0, 10);
	const creation = pocketCreationDate(row.createdAt);
	const openingBalanceMinor =
		typeof row.openingBalanceMinor === 'number' ? row.openingBalanceMinor : 0;
	const rawAsOf = row.openingAsOf?.trim() || '';
	const openingEnabled =
		typeof row.openingEnabled === 'boolean'
			? row.openingEnabled
			: inferOpeningEnabled({
					openingBalanceMinor,
					openingAsOf: rawAsOf || creation,
					createdAt: row.createdAt
				});
	const goalTargetMinor =
		typeof row.goalTargetMinor === 'number' ? row.goalTargetMinor : null;
	const goalTargetOn = row.goalTargetOn?.trim() ? row.goalTargetOn : null;
	const goalEnabled =
		typeof row.goalEnabled === 'boolean'
			? row.goalEnabled
			: inferGoalEnabled({ goalTargetMinor });

	return {
		id: row.id,
		name: row.name,
		currencyLabel: row.currencyLabel,
		createdAt: row.createdAt,
		isMain: opts?.isMain ?? row.isMain ?? false,
		sortOrder: opts?.sortOrder ?? row.sortOrder ?? 0,
		notes: row.notes ?? '',
		openingBalanceMinor: openingEnabled ? openingBalanceMinor : 0,
		openingAsOf: openingEnabled ? rawAsOf || today : creation || today,
		openingEnabled,
		goalTargetMinor: goalEnabled ? goalTargetMinor : null,
		goalTargetOn: goalEnabled ? goalTargetOn : null,
		goalEnabled
	};
}

/** Main first, then sortOrder ascending, then createdAt, then id. */
export function listPocketsOrdered<T extends Pick<Account, 'id' | 'isMain' | 'sortOrder' | 'createdAt'>>(
	pockets: T[]
): T[] {
	return [...pockets].sort((a, b) => {
		if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
		if (!a.isMain && !b.isMain && a.sortOrder !== b.sortOrder) {
			return a.sortOrder - b.sortOrder;
		}
		const byCreated = a.createdAt.localeCompare(b.createdAt);
		if (byCreated !== 0) return byCreated;
		return a.id.localeCompare(b.id);
	});
}

/** Assign contiguous sortOrder 0..n-1 to non-Main ids in the given order. */
export function assignNonMainSortOrders<T extends Pick<Account, 'id' | 'isMain' | 'sortOrder'>>(
	pockets: T[],
	orderedNonMainIds: string[]
): T[] {
	const main = pockets.filter((p) => p.isMain);
	const byId = new Map(pockets.map((p) => [p.id, p]));
	const next: T[] = [...main];
	orderedNonMainIds.forEach((id, index) => {
		const p = byId.get(id);
		if (!p || p.isMain) throw new Error('Invalid pocket order');
		next.push({ ...p, sortOrder: index });
	});
	return next;
}
