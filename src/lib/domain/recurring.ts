import type { AddableTransactionType } from '$lib/domain/transaction-rules';

export type RecurringFrequency = 'weekly' | 'monthly';

export type RecurringRule = {
	id: string;
	accountId: string;
	type: AddableTransactionType;
	amountMinor: number;
	categoryId: string;
	note: string;
	frequency: RecurringFrequency;
	nextOccurredOn: string;
	active: boolean;
	createdAt: string;
};

/** Advance a YYYY-MM-DD date by frequency. */
export function advanceOccurredOn(
	occurredOn: string,
	frequency: RecurringFrequency
): string {
	const [y, m, d] = occurredOn.split('-').map(Number) as [number, number, number];
	if (frequency === 'weekly') {
		const date = new Date(y, m - 1, d);
		date.setDate(date.getDate() + 7);
		return formatDate(date);
	}
	const nextMonth = new Date(y, m, 1);
	const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
	const day = Math.min(d, lastDay);
	return formatDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
}

function formatDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function isDue(nextOccurredOn: string, today: string): boolean {
	return nextOccurredOn <= today;
}
