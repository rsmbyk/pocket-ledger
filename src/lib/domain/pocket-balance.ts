import type { Account } from '$lib/domain/account';
import type { LedgerTransaction } from '$lib/domain/transaction';
import { isVoided } from '$lib/domain/transaction';
import { assertMinorUnits, type MinorUnits } from '$lib/domain/money';

export type PocketBalanceTx = Pick<
	LedgerTransaction,
	'type' | 'amountMinor' | 'accountId' | 'counterAccountId' | 'occurredOn' | 'voidedAt'
>;

/**
 * Signed effect of one tx on pocket `pocketId`.
 * Transfers: source (−) / destination (+). Voided → 0.
 */
export function pocketDelta(tx: PocketBalanceTx, pocketId: string): MinorUnits {
	if (tx.voidedAt || isVoided(tx)) return 0;
	assertMinorUnits(tx.amountMinor);
	if (tx.amountMinor <= 0) {
		throw new Error('Stored amount must be a positive integer');
	}
	if (tx.type === 'income') {
		return tx.accountId === pocketId ? tx.amountMinor : 0;
	}
	if (tx.type === 'expense') {
		return tx.accountId === pocketId ? -tx.amountMinor : 0;
	}
	if (tx.type === 'transfer') {
		if (tx.accountId === pocketId) return -tx.amountMinor;
		if (tx.counterAccountId === pocketId) return tx.amountMinor;
		return 0;
	}
	return 0;
}

/**
 * Current pocket balance = opening + deltas for non-voided txs with occurredOn >= openingAsOf.
 */
export function derivePocketBalance(
	pocket: Pick<Account, 'id' | 'openingBalanceMinor' | 'openingAsOf'>,
	transactions: PocketBalanceTx[]
): MinorUnits {
	const opening = pocket.openingBalanceMinor;
	if (!Number.isInteger(opening)) {
		throw new Error('Opening balance must be a whole number');
	}
	let total = opening;
	for (const tx of transactions) {
		if (tx.occurredOn < pocket.openingAsOf) continue;
		total += pocketDelta(tx, pocket.id);
	}
	return total;
}

/** Sum of each pocket’s derived balance (transfers cancel across pockets). */
export function sumAllPocketBalances(
	pockets: Array<Pick<Account, 'id' | 'openingBalanceMinor' | 'openingAsOf'>>,
	transactions: PocketBalanceTx[]
): MinorUnits {
	return pockets.reduce((sum, p) => sum + derivePocketBalance(p, transactions), 0);
}
