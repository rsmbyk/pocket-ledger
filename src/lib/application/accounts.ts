import {
	countAccounts,
	deleteAccount,
	getAccount,
	listAccounts,
	putAccount
} from '$lib/data/account-repo';
import { db } from '$lib/data/db';
import {
	assignNonMainSortOrders,
	DEFAULT_ACCOUNT_NAME,
	DEFAULT_CURRENCY_LABEL,
	listPocketsOrdered,
	normalizeAccount,
	type Account
} from '$lib/domain/account';
import { ensureSeedCategories } from '$lib/application/transactions';
import { todayOccurredOn, isValidOccurredOn } from '$lib/domain/transaction-rules';
import { assertGoalTarget } from '$lib/domain/goals';

function createId(): string {
	return crypto.randomUUID();
}

async function ensureMainFlags(accounts: Account[]): Promise<Account[]> {
	if (accounts.length === 0) return accounts;
	const mains = accounts.filter((a) => a.isMain);
	if (mains.length === 1) return listPocketsOrdered(accounts);

	let mainId = accounts.find((a) => a.name === DEFAULT_ACCOUNT_NAME)?.id ?? accounts[0]!.id;
	const next = accounts.map((a, index) =>
		normalizeAccount(
			{
				...a,
				isMain: a.id === mainId,
				sortOrder: a.id === mainId ? 0 : index
			},
			{ today: todayOccurredOn(), isMain: a.id === mainId }
		)
	);
	for (const a of next) await putAccount(a);
	return listPocketsOrdered(next);
}

/**
 * Ensures a Main pocket exists on first launch / after reset.
 */
export async function ensureDefaultAccount(): Promise<Account> {
	const existing = await listAccounts();
	if (existing.length > 0) {
		const ordered = await ensureMainFlags(existing);
		return ordered.find((a) => a.isMain) ?? ordered[0]!;
	}

	const account = normalizeAccount(
		{
			id: createId(),
			name: DEFAULT_ACCOUNT_NAME,
			currencyLabel: DEFAULT_CURRENCY_LABEL,
			createdAt: new Date().toISOString(),
			isMain: true,
			sortOrder: 0,
			notes: '',
			openingBalanceMinor: 0,
			openingAsOf: todayOccurredOn(),
			openingEnabled: false,
			goalTargetMinor: null,
			goalTargetOn: null,
			goalEnabled: false
		},
		{ today: todayOccurredOn(), isMain: true }
	);
	await putAccount(account);
	return account;
}

export async function getAccountsOverview(): Promise<{
	accounts: Account[];
	isSinglePot: boolean;
}> {
	await ensureDefaultAccount();
	await ensureSeedCategories();
	const accounts = await listAccounts();
	return {
		accounts,
		isSinglePot: accounts.length === 1
	};
}

export async function hasOnlyDefaultAccount(): Promise<boolean> {
	return (await countAccounts()) === 1;
}

export type CreatePocketInput = {
	name: string;
	notes?: string;
	openingEnabled?: boolean;
	openingBalanceMinor?: number;
	openingAsOf?: string;
};

export async function createPocket(input: CreatePocketInput): Promise<Account> {
	await ensureDefaultAccount();
	const name = input.name.trim();
	if (!name) throw new Error('Name is required');
	const createdAt = new Date().toISOString();
	const creationDate = createdAt.slice(0, 10);
	const openingEnabled = input.openingEnabled === true;
	let openingBalanceMinor = 0;
	let openingAsOf = creationDate;
	if (openingEnabled) {
		openingAsOf = input.openingAsOf?.trim() || creationDate;
		if (!isValidOccurredOn(openingAsOf)) throw new Error('Date must be YYYY-MM-DD');
		openingBalanceMinor = input.openingBalanceMinor ?? 0;
		if (!Number.isInteger(openingBalanceMinor)) {
			throw new Error('Opening balance must be a whole number');
		}
	}
	const accounts = await listAccounts();
	const nonMainCount = accounts.filter((a) => !a.isMain).length;
	const account = normalizeAccount(
		{
			id: createId(),
			name,
			currencyLabel: DEFAULT_CURRENCY_LABEL,
			createdAt,
			isMain: false,
			sortOrder: nonMainCount,
			notes: (input.notes ?? '').trim(),
			openingBalanceMinor,
			openingAsOf,
			openingEnabled,
			goalTargetMinor: null,
			goalTargetOn: null,
			goalEnabled: false
		},
		{ today: todayOccurredOn(), isMain: false, sortOrder: nonMainCount }
	);
	await putAccount(account);
	return account;
}

export type UpdatePocketInput = {
	id: string;
	name: string;
	notes?: string;
	openingEnabled?: boolean;
	openingBalanceMinor?: number;
	openingAsOf?: string;
	goalEnabled?: boolean;
	goalTargetMinor?: number | null;
	goalTargetOn?: string | null;
};

export async function updatePocket(input: UpdatePocketInput): Promise<Account> {
	const existing = await getAccount(input.id);
	if (!existing) throw new Error('Pocket not found');
	const name = input.name.trim();
	if (!name) throw new Error('Name is required');

	const openingEnabled =
		input.openingEnabled !== undefined ? input.openingEnabled : existing.openingEnabled;
	let openingBalanceMinor = existing.openingBalanceMinor;
	let openingAsOf = existing.openingAsOf;
	if (!openingEnabled) {
		openingBalanceMinor = 0;
		openingAsOf = existing.createdAt.slice(0, 10);
	} else {
		openingAsOf =
			input.openingAsOf !== undefined
				? input.openingAsOf.trim() || existing.openingAsOf
				: existing.openingAsOf;
		if (!isValidOccurredOn(openingAsOf)) throw new Error('Date must be YYYY-MM-DD');
		openingBalanceMinor =
			input.openingBalanceMinor !== undefined
				? input.openingBalanceMinor
				: existing.openingBalanceMinor;
		if (!Number.isInteger(openingBalanceMinor)) {
			throw new Error('Opening balance must be a whole number');
		}
	}

	const goalEnabled =
		input.goalEnabled !== undefined ? input.goalEnabled : existing.goalEnabled;
	let goalTargetMinor: number | null = null;
	let goalTargetOn: string | null = null;
	if (goalEnabled) {
		goalTargetMinor =
			input.goalTargetMinor !== undefined ? input.goalTargetMinor : existing.goalTargetMinor;
		if (goalTargetMinor == null) throw new Error('Goal target is required');
		assertGoalTarget(goalTargetMinor);
		const rawOn =
			input.goalTargetOn !== undefined ? input.goalTargetOn : existing.goalTargetOn;
		if (rawOn != null && String(rawOn).trim()) {
			const trimmed = String(rawOn).trim();
			if (!isValidOccurredOn(trimmed)) throw new Error('Date must be YYYY-MM-DD');
			goalTargetOn = trimmed;
		} else {
			goalTargetOn = null;
		}
	}

	const next = normalizeAccount(
		{
			...existing,
			name,
			notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
			openingBalanceMinor,
			openingAsOf,
			openingEnabled,
			goalTargetMinor,
			goalTargetOn,
			goalEnabled
		},
		{ today: todayOccurredOn(), isMain: existing.isMain, sortOrder: existing.sortOrder }
	);
	await putAccount(next);
	return next;
}

export async function deletePocket(id: string): Promise<void> {
	const existing = await getAccount(id);
	if (!existing) throw new Error('Pocket not found');
	if (existing.isMain) throw new Error('The Main pocket cannot be deleted');

	const asSource = await db.transactions.where('accountId').equals(id).count();
	const all = await db.transactions.toArray();
	const asDest = all.filter((t) => t.counterAccountId === id).length;
	if (asSource > 0 || asDest > 0) {
		throw new Error('Remove or void transactions for this pocket before deleting it');
	}
	await deleteAccount(id);
}

/** Persist DnD order for non-Main pockets (Main stays first). */
export async function reorderPockets(orderedNonMainIds: string[]): Promise<void> {
	const accounts = await listAccounts();
	const nonMain = accounts.filter((a) => !a.isMain);
	if (orderedNonMainIds.length !== nonMain.length) {
		throw new Error('Pocket order is incomplete');
	}
	const updated = assignNonMainSortOrders(accounts, orderedNonMainIds);
	for (const a of updated) {
		if (!a.isMain) await putAccount(a);
	}
}

export async function clearPocketGoal(id: string): Promise<Account> {
	return updatePocket({
		id,
		name: (await getAccount(id))!.name,
		goalEnabled: false,
		goalTargetMinor: null,
		goalTargetOn: null
	});
}
