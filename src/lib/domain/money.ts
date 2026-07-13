/**
 * Money amounts are stored as integer minor units (e.g. cents / rupiah).
 * Never use floating-point for ledger math.
 */
export type MinorUnits = number;

export function assertMinorUnits(value: number): MinorUnits {
	if (!Number.isInteger(value)) {
		throw new Error('Money must be an integer number of minor units');
	}
	return value;
}

export function addMinor(a: MinorUnits, b: MinorUnits): MinorUnits {
	return assertMinorUnits(a) + assertMinorUnits(b);
}

export function formatMinor(amount: MinorUnits, currencyLabel = 'IDR'): string {
	assertMinorUnits(amount);
	const formatted = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 0
	}).format(amount);
	return `${currencyLabel} ${formatted}`;
}
