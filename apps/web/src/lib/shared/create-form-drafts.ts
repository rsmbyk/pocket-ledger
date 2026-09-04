export const TX_CREATE_DRAFT_KEY = 'pocket-ledger-draft-tx-create';

export type TxCreateDraft = {
	mode: 'normal' | 'transfer';
	type: 'income' | 'expense';
	amountDigits: string;
	categoryId: string;
	note: string;
	occurredOn: string;
	accountId: string;
	transferSourceId: string;
	transferDestId: string;
	transferAmountDigits: string;
	transferFeeDigits: string;
	expenseFeeDigits: string;
	transferNote: string;
	transferOccurredOn: string;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function asString(value: unknown, fallback = ''): string {
	return typeof value === 'string' ? value : fallback;
}

function defaultSessionStorage(): StorageLike | null | undefined {
	try {
		return globalThis.sessionStorage;
	} catch {
		return null;
	}
}

function readRaw(key: string, storage: Pick<Storage, 'getItem'> | null | undefined): string | null {
	try {
		return storage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

function writeRaw(
	key: string,
	value: string,
	storage: Pick<Storage, 'setItem'> | null | undefined
): void {
	try {
		storage?.setItem(key, value);
	} catch {
		// Ignore quota / private-mode failures.
	}
}

function clearRaw(key: string, storage: Pick<Storage, 'removeItem'> | null | undefined): void {
	try {
		storage?.removeItem(key);
	} catch {
		// Ignore.
	}
}

function parseObject(value: string | null | undefined): Record<string, unknown> | null {
	if (!value) return null;
	try {
		const parsed: unknown = JSON.parse(value);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
		return parsed as Record<string, unknown>;
	} catch {
		return null;
	}
}

/** Parse stored tx create draft; missing/garbage → null. */
export function parseTxCreateDraft(value: string | null | undefined): TxCreateDraft | null {
	const obj = parseObject(value);
	if (!obj) return null;
	const mode = obj.mode === 'transfer' ? 'transfer' : obj.mode === 'normal' ? 'normal' : null;
	if (!mode) return null;
	const type = obj.type === 'income' ? 'income' : obj.type === 'expense' ? 'expense' : null;
	if (!type) return null;
	return {
		mode,
		type,
		amountDigits: asString(obj.amountDigits),
		categoryId: asString(obj.categoryId),
		note: asString(obj.note),
		occurredOn: asString(obj.occurredOn),
		accountId: asString(obj.accountId),
		transferSourceId: asString(obj.transferSourceId),
		transferDestId: asString(obj.transferDestId),
		transferAmountDigits: asString(obj.transferAmountDigits),
		transferFeeDigits: asString(obj.transferFeeDigits),
		expenseFeeDigits: asString(obj.expenseFeeDigits),
		transferNote: asString(obj.transferNote),
		transferOccurredOn: asString(obj.transferOccurredOn)
	};
}

export function readTxCreateDraft(
	storage: Pick<Storage, 'getItem'> | null | undefined = defaultSessionStorage()
): TxCreateDraft | null {
	return parseTxCreateDraft(readRaw(TX_CREATE_DRAFT_KEY, storage));
}

export function writeTxCreateDraft(
	draft: TxCreateDraft,
	storage: Pick<Storage, 'setItem'> | null | undefined = defaultSessionStorage()
): void {
	const normalized = parseTxCreateDraft(JSON.stringify(draft));
	if (!normalized) return;
	writeRaw(TX_CREATE_DRAFT_KEY, JSON.stringify(normalized), storage);
}

export function clearTxCreateDraft(
	storage: Pick<Storage, 'removeItem'> | null | undefined = defaultSessionStorage()
): void {
	clearRaw(TX_CREATE_DRAFT_KEY, storage);
}
