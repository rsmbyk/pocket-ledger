import { listAccounts, putAccount } from '$lib/data/account-repo';
import { getSetting, setSetting } from '$lib/data/settings-repo';
import { SETTINGS_DISPLAY_CURRENCY } from '$lib/data/db';
import { parseDisplayCurrency } from '$lib/domain/display-currency';

export async function getDisplayCurrency(): Promise<string> {
	return parseDisplayCurrency(await getSetting(SETTINGS_DISPLAY_CURRENCY));
}

export async function saveDisplayCurrency(code: string): Promise<string> {
	const next = parseDisplayCurrency(code);
	await setSetting(SETTINGS_DISPLAY_CURRENCY, next);
	const accounts = await listAccounts();
	for (const account of accounts) {
		if (account.currencyLabel === next) continue;
		await putAccount({ ...account, currencyLabel: next });
	}
	return next;
}
