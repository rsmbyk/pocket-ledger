import type { Account } from '$lib/domain/account';
import type { LedgerTransaction } from '$lib/domain/transaction';
import { isVoided } from '$lib/domain/transaction';
import { assertMinorUnits, type MinorUnits } from '$lib/domain/money';

export type PocketBalanceTx = Pick<
	LedgerTransaction,
	'type' | 'amountMinor' | 'feeMinor' | 'accountId' | 'counterAccountId' | 'occurredOn' | 'voidedAt'
>;

function storedFeeMinor(tx: Pick<PocketBalanceTx, 'feeMinor'>): MinorUnits {
	const fee = tx.feeMinor ?? 0;
	if (!Number.isInteger(fee) || fee < 0) {
		throw new Error('Stored fee must be a non-negative integer');
	}
	return fee;
}

/**
 * Signed effect of one tx on pocket `pocketId`.
 * Transfers: source −(amount+fee) / destination +amount. Voided → 0.
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
		const fee = storedFeeMinor(tx);
		return tx.accountId === pocketId ? -(tx.amountMinor + fee) : 0;
	}
	if (tx.type === 'transfer') {
		const fee = storedFeeMinor(tx);
		if (tx.accountId === pocketId) return -(tx.amountMinor + fee);
		if (tx.counterAccountId === pocketId) return tx.amountMinor;
		return 0;
	}
	return 0;
}

/**
 * Pocket balance at the start of calendar day `day` (YYYY-MM-DD), inferred from the
 * known opening by walking ledger effects forward or backward to that day.
 * Spec 071 current-balance cutoff is unchanged — this is for historical month Opening.
 */
export function balanceAtDayStart(
	pocket: Pick<Account, 'id' | 'openingBalanceMinor' | 'openingAsOf'>,
	day: string,
	transactions: PocketBalanceTx[]
): MinorUnits {
	const opening = pocket.openingBalanceMinor;
	if (!Number.isInteger(opening)) {
		throw new Error('Opening balance must be a whole number');
	}
	const asOf = pocket.openingAsOf;
	if (day === asOf) return opening;

	let total = opening;
	if (day > asOf) {
		for (const tx of transactions) {
			if (tx.occurredOn < asOf || tx.occurredOn >= day) continue;
			total += pocketDelta(tx, pocket.id);
		}
		return total;
	}

	for (const tx of transactions) {
		if (tx.occurredOn < day || tx.occurredOn >= asOf) continue;
		total -= pocketDelta(tx, pocket.id);
	}
	return total;
}

/** Calendar YYYY-MM-DD plus one UTC day. */
export function dayAfter(day: string): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());
	if (!m) throw new Error('Date must be YYYY-MM-DD');
	const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1));
	const y = dt.getUTCFullYear();
	const mo = String(dt.getUTCMonth() + 1).padStart(2, '0');
	const d = String(dt.getUTCDate()).padStart(2, '0');
	return `${y}-${mo}-${d}`;
}

/**
 * Pocket balance at the end of calendar day `day` (txs with occurredOn <= day count).
 */
export function goalEndOfDayBalance(
	pocket: Pick<Account, 'id' | 'openingBalanceMinor' | 'openingAsOf'>,
	day: string,
	transactions: PocketBalanceTx[]
): MinorUnits {
	return balanceAtDayStart(pocket, dayAfter(day), transactions);
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
