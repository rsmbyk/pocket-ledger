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

/** Digits only from an amount field (strips grouping and other non-digits). */
export function amountDigitsOnly(raw: string): string {
	return raw.replace(/\D/g, '');
}

/** True when a keydown should be blocked for amount digit entry (allows control keys). */
export function isBlockedAmountKey(event: KeyboardEvent): boolean {
	if (event.ctrlKey || event.metaKey || event.altKey) return false;
	const allow = [
		'Backspace',
		'Delete',
		'Tab',
		'Escape',
		'Enter',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End'
	];
	if (allow.includes(event.key)) return false;
	if (event.key.length === 1 && /^\d$/.test(event.key)) return false;
	return true;
}

/** Thousand-grouped display for digit-only amount input (e.g. `15000` → `15,000`). */
export function formatAmountDigitsDisplay(raw: string): string {
	const digits = amountDigitsOnly(raw);
	if (!digits) return '';
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export type TxFormBaseline = {
	type: AddableTransactionType;
	amountDigits: string;
	categoryId: string;
	note: string;
	occurredOn: string;
};

/** True when create form has any non-default user input vs initial baseline. */
export function isCreateTxDirty(
	current: TxFormBaseline,
	baseline: TxFormBaseline
): boolean {
	return (
		current.type !== baseline.type ||
		current.amountDigits !== baseline.amountDigits ||
		current.categoryId !== baseline.categoryId ||
		current.note !== baseline.note ||
		current.occurredOn !== baseline.occurredOn
	);
}

/** True when edit form differs from values captured when the sheet opened. */
export function isEditTxDirty(
	current: Omit<TxFormBaseline, 'type'>,
	baseline: Omit<TxFormBaseline, 'type'>
): boolean {
	return (
		current.amountDigits !== baseline.amountDigits ||
		current.categoryId !== baseline.categoryId ||
		current.note !== baseline.note ||
		current.occurredOn !== baseline.occurredOn
	);
}

/** Balance delta for a stored transaction row (voided → 0). */
export function balanceDelta(
	tx: Pick<LedgerTransaction, 'type' | 'amountMinor'> & { voidedAt?: string | null }
): MinorUnits {
	if (tx.voidedAt) return 0;
	assertMinorUnits(tx.amountMinor);
	if (tx.amountMinor <= 0) {
		throw new Error('Stored amount must be a positive integer');
	}
	if (tx.type === 'income') return tx.amountMinor;
	if (tx.type === 'expense') return -tx.amountMinor;
	return 0;
}

export function sumBalance(
	transactions: Array<Pick<LedgerTransaction, 'type' | 'amountMinor'> & { voidedAt?: string | null }>
): MinorUnits {
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
