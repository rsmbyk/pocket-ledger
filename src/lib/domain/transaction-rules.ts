import { assertMinorUnits, type MinorUnits } from '$lib/domain/money';
import type { LedgerTransaction, TransactionType } from '$lib/domain/transaction';

export type AddableTransactionType = Exclude<TransactionType, 'transfer'>;

export function parseAmountInput(raw: string): MinorUnits {
	const trimmed = raw.trim().replace(/[,_\s]/g, '');
	if (!trimmed) {
		throw new Error('Amount is required');
	}
	if (!/^\d+$/.test(trimmed)) {
		throw new Error('Amount must be a whole number');
	}
	const value = Number(trimmed);
	if (value <= 0) {
		throw new Error('Amount must be greater than zero');
	}
	return assertMinorUnits(value);
}

/** Balance delta for a stored transaction row. */
export function balanceDelta(tx: Pick<LedgerTransaction, 'type' | 'amountMinor'>): MinorUnits {
	assertMinorUnits(tx.amountMinor);
	if (tx.amountMinor <= 0) {
		throw new Error('Stored amount must be a positive integer');
	}
	if (tx.type === 'income') return tx.amountMinor;
	if (tx.type === 'expense') return -tx.amountMinor;
	return 0;
}

export function sumBalance(transactions: Pick<LedgerTransaction, 'type' | 'amountMinor'>[]): MinorUnits {
	return transactions.reduce((total, tx) => total + balanceDelta(tx), 0);
}

export function isValidOccurredOn(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split('-').map(Number) as [number, number, number];
	const date = new Date(year, month - 1, day);
	return (
		date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
	);
}

export function todayOccurredOn(now = new Date()): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}
