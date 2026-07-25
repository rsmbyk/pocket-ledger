export const TX_CREATE_DRAFT_KEY = 'pocket-ledger-draft-tx-create';
export const POCKET_CREATE_DRAFT_KEY = 'pocket-ledger-draft-pocket-create';
export const CATEGORY_CREATE_DRAFT_KEYS = {
	income: 'pocket-ledger-draft-category-create-income',
	expense: 'pocket-ledger-draft-category-create-expense'
} as const;

export type CategoryCreateKind = keyof typeof CATEGORY_CREATE_DRAFT_KEYS;

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
	transferNote: string;
	transferOccurredOn: string;
};

export type PocketCreateDraft = {
	name: string;
	notes: string;
	openingEnabled: boolean;
	openingRaw: string;
	openingAsOf: string;
	goalEnabled: boolean;
	goalTargetRaw: string;
	goalDateEnabled: boolean;
	goalTargetOn: string;
};

export type CategoryCreateDraft = {
	name: string;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function asString(value: unknown, fallback = ''): string {
	return typeof value === 'string' ? value : fallback;
}

function asBool(value: unknown): boolean {
	return value === true;
}

function defaultSessionStorage(): StorageLike | null | undefined {
	try {
		return globalThis.sessionStorage;
	} catch {
		return null;
	}
}

function readRaw(
	key: string,
	storage: Pick<Storage, 'getItem'> | null | undefined
): string | null {
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

/** Parse pocket create draft; requires at least a string name field present in object shape. */
export function parsePocketCreateDraft(value: string | null | undefined): PocketCreateDraft | null {
	const obj = parseObject(value);
	if (!obj) return null;
	if (!('name' in obj) || typeof obj.name !== 'string') return null;
	return {
		name: asString(obj.name),
		notes: asString(obj.notes),
		openingEnabled: asBool(obj.openingEnabled),
		openingRaw: asString(obj.openingRaw, '0'),
		openingAsOf: asString(obj.openingAsOf),
		goalEnabled: asBool(obj.goalEnabled),
		goalTargetRaw: asString(obj.goalTargetRaw),
		goalDateEnabled: asBool(obj.goalDateEnabled),
		goalTargetOn: asString(obj.goalTargetOn)
	};
}

export function readPocketCreateDraft(
	storage: Pick<Storage, 'getItem'> | null | undefined = defaultSessionStorage()
): PocketCreateDraft | null {
	return parsePocketCreateDraft(readRaw(POCKET_CREATE_DRAFT_KEY, storage));
}

export function writePocketCreateDraft(
	draft: PocketCreateDraft,
	storage: Pick<Storage, 'setItem'> | null | undefined = defaultSessionStorage()
): void {
	const normalized = parsePocketCreateDraft(JSON.stringify(draft));
	if (!normalized) return;
	writeRaw(POCKET_CREATE_DRAFT_KEY, JSON.stringify(normalized), storage);
}

export function clearPocketCreateDraft(
	storage: Pick<Storage, 'removeItem'> | null | undefined = defaultSessionStorage()
): void {
	clearRaw(POCKET_CREATE_DRAFT_KEY, storage);
}

export function parseCategoryCreateDraft(
	value: string | null | undefined
): CategoryCreateDraft | null {
	const obj = parseObject(value);
	if (!obj) return null;
	const name = asString(obj.name).trim();
	if (!name) return null;
	return { name: asString(obj.name) };
}

export function readCategoryCreateDraft(
	kind: CategoryCreateKind,
	storage: Pick<Storage, 'getItem'> | null | undefined = defaultSessionStorage()
): CategoryCreateDraft | null {
	return parseCategoryCreateDraft(readRaw(CATEGORY_CREATE_DRAFT_KEYS[kind], storage));
}

export function writeCategoryCreateDraft(
	kind: CategoryCreateKind,
	draft: CategoryCreateDraft,
	storage: Pick<Storage, 'setItem'> | null | undefined = defaultSessionStorage()
): void {
	const normalized = parseCategoryCreateDraft(JSON.stringify(draft));
	if (!normalized) return;
	writeRaw(CATEGORY_CREATE_DRAFT_KEYS[kind], JSON.stringify(normalized), storage);
}

export function clearCategoryCreateDraft(
	kind: CategoryCreateKind,
	storage: Pick<Storage, 'removeItem'> | null | undefined = defaultSessionStorage()
): void {
	clearRaw(CATEGORY_CREATE_DRAFT_KEYS[kind], storage);
}
