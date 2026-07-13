import { countAccounts, listAccounts, putAccount } from '$lib/data/account-repo';
import {
	DEFAULT_ACCOUNT_NAME,
	DEFAULT_CURRENCY_LABEL,
	type Account
} from '$lib/domain/account';

function createId(): string {
	return crypto.randomUUID();
}

/**
 * Ensures single-pot mode has a default account on first launch.
 */
export async function ensureDefaultAccount(): Promise<Account> {
	const existing = await listAccounts();
	if (existing.length > 0) {
		return existing[0]!;
	}

	const account: Account = {
		id: createId(),
		name: DEFAULT_ACCOUNT_NAME,
		currencyLabel: DEFAULT_CURRENCY_LABEL,
		createdAt: new Date().toISOString()
	};
	await putAccount(account);
	return account;
}

export async function getAccountsOverview(): Promise<{
	accounts: Account[];
	isSinglePot: boolean;
}> {
	await ensureDefaultAccount();
	const accounts = await listAccounts();
	return {
		accounts,
		isSinglePot: accounts.length === 1
	};
}

export async function hasOnlyDefaultAccount(): Promise<boolean> {
	return (await countAccounts()) === 1;
}
