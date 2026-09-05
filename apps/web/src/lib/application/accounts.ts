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
	assertUniquePocketName,
	DEFAULT_ACCOUNT_NAME,
	listPocketsOrdered,
	normalizeAccount,
	normalizePocketNameInput,
	type Account
} from '$lib/domain/account';
import { ensureSeedCategories } from '$lib/application/transactions';
import { todayOccurredOn, isValidOccurredOn } from '$lib/domain/transaction-rules';
import { isActive } from '$lib/domain/goals';
import { listGoalsForAccount } from '$lib/data/goals-repo';
import { softDeleteGoalsForPocket } from '$lib/application/goals';
import { getDisplayCurrency } from '$lib/application/display-currency';

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
			currencyLabel: await getDisplayCurrency(),
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
	const accounts = await listAccounts();
	const name = normalizePocketNameInput(input.name, false);
	assertUniquePocketName(name, accounts);
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
		if (openingBalanceMinor < 0) {
			throw new Error('Opening balance must be zero or greater');
		}
	}
	const nonMainCount = accounts.filter((a) => !a.isMain).length;
	const account = normalizeAccount(
		{
			id: createId(),
			name,
			currencyLabel: await getDisplayCurrency(),
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
};

export async function updatePocket(input: UpdatePocketInput): Promise<Account> {
	const existing = await getAccount(input.id);
	if (!existing) throw new Error('Pocket not found');
	const accounts = await listAccounts();
	const name = normalizePocketNameInput(input.name, existing.isMain);
	assertUniquePocketName(name, accounts, existing.id);

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
		if (openingBalanceMinor < 0) {
			throw new Error('Opening balance must be zero or greater');
		}
	}

	const next = normalizeAccount(
		{
			...existing,
			name,
			notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
			openingBalanceMinor,
			openingAsOf,
			openingEnabled
		},
		{ today: todayOccurredOn(), isMain: existing.isMain, sortOrder: existing.sortOrder }
	);
	await putAccount(next);
	return next;
}

export const POCKET_DELETE_HAS_TRANSACTIONS =
	'This pocket still has transactions, including voided. Voiding is not enough.';
export const POCKET_DELETE_HAS_ACTIVE_GOALS = 'Drop all active goals first.';

export async function pocketDeleteBlockers(id: string): Promise<string[]> {
	const reasons: string[] = [];
	const asSource = await db.transactions.where('accountId').equals(id).count();
	const all = await db.transactions.toArray();
	const asDest = all.filter((t) => t.counterAccountId === id).length;
	if (asSource > 0 || asDest > 0) reasons.push(POCKET_DELETE_HAS_TRANSACTIONS);
	const today = todayOccurredOn();
	const goals = await listGoalsForAccount(id);
	if (goals.some((g) => isActive(g, today))) reasons.push(POCKET_DELETE_HAS_ACTIVE_GOALS);
	return reasons;
}

export async function deletePocket(id: string): Promise<void> {
	const existing = await getAccount(id);
	if (!existing) throw new Error('Pocket not found');
	if (existing.isMain) throw new Error('The Main pocket cannot be deleted');

	const blockers = await pocketDeleteBlockers(id);
	if (blockers.length > 0) throw new Error(blockers.join(' '));
	await softDeleteGoalsForPocket(id);
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
