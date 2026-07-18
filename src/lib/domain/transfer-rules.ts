import type { LedgerTransaction, TransactionType } from '$lib/domain/transaction';
import { parseAmountInput, isValidOccurredOn, todayOccurredOn } from '$lib/domain/transaction-rules';

export type TransferInput = {
	sourceAccountId: string;
	destAccountId: string;
	amountRaw: string;
	note?: string;
	occurredOn?: string;
};

export function assertTransferParties(sourceAccountId: string, destAccountId: string): void {
	const src = sourceAccountId.trim();
	const dest = destAccountId.trim();
	if (!src || !dest) throw new Error('Choose source and destination pockets');
	if (src === dest) throw new Error('Source and destination must be different');
}

export function buildTransferFields(input: TransferInput): {
	accountId: string;
	counterAccountId: string;
	type: 'transfer';
	amountMinor: number;
	categoryId: null;
	note: string;
	occurredOn: string;
} {
	assertTransferParties(input.sourceAccountId, input.destAccountId);
	const amountMinor = parseAmountInput(input.amountRaw);
	const occurredOn = input.occurredOn ?? todayOccurredOn();
	if (!isValidOccurredOn(occurredOn)) {
		throw new Error('Date must be YYYY-MM-DD');
	}
	return {
		accountId: input.sourceAccountId.trim(),
		counterAccountId: input.destAccountId.trim(),
		type: 'transfer',
		amountMinor,
		categoryId: null,
		note: (input.note ?? '').trim(),
		occurredOn
	};
}

/** Reject mutating type or converting a row into/out of transfer. */
export function assertTypeImmutable(
	existing: Pick<LedgerTransaction, 'type'>,
	nextType: TransactionType
): void {
	if (existing.type !== nextType) {
		throw new Error('Transaction type cannot be changed');
	}
}

