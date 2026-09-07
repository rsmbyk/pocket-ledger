import { listPlansRaw, deletePlanRow, getPlan, putPlan } from '$lib/data/plans-repo';
import { db } from '$lib/data/db';
import { getAccount } from '$lib/data/account-repo';
import {
	nextDueOn,
	resolveMonthDay,
	type LedgerPlan,
	type PlanFrequency
} from '$lib/domain/plan';
import {
	isValidOccurredOn,
	parseAmountInput,
	parseNonNegativeAmountInput,
	todayOccurredOn,
	type AddableTransactionType
} from '$lib/domain/transaction-rules';
import { buildTransferFields, type TransferInput } from '$lib/domain/transfer-rules';
import { openField, sealField } from '$lib/application/field-crypto';
import { pushSealedEntity } from '$lib/application/sync-client';
import { addTransaction, addTransfer, getCategoriesForType } from '$lib/application/transactions';
import { listAllCategories } from '$lib/application/categories';
import type { LedgerTransaction } from '$lib/domain/transaction';
import { ADMIN_FEE_CATEGORY_ID } from '$lib/domain/activity-filters';

export const SYNC_KIND_PLAN = 'plan';

function createId(): string {
	return crypto.randomUUID();
}

async function openPlan(row: LedgerPlan): Promise<LedgerPlan> {
	return {
		...row,
		description: await openField(row.description ?? ''),
		note: await openField(row.note ?? ''),
		frequency: row.frequency ?? 'once',
		monthDay: row.frequency === 'monthly' ? (row.monthDay ?? null) : null,
		feeMinor: typeof row.feeMinor === 'number' ? row.feeMinor : 0
	};
}

async function sealPlan(plan: LedgerPlan): Promise<LedgerPlan> {
	return {
		...plan,
		description: await sealField(plan.description.trim()),
		note: await sealField(plan.note.trim())
	};
}

async function pushPlan(id: string, deleted = false): Promise<void> {
	const row = deleted ? null : await db.plans.get(id);
	try {
		await pushSealedEntity(SYNC_KIND_PLAN, id, row, deleted);
	} catch {
		/* signed-out / API down — Dexie is the ledger */
	}
}

export async function listPlans(): Promise<LedgerPlan[]> {
	const rows = await listPlansRaw();
	return Promise.all(rows.map(openPlan));
}

export type PlanMoneyInput = {
	type: AddableTransactionType | 'transfer';
	amountRaw: string;
	feeRaw?: string;
	categoryId?: string | null;
	accountId: string;
	counterAccountId?: string | null;
	note?: string;
	dueOn: string;
};

export type CreatePlanInput = PlanMoneyInput & {
	description?: string;
	frequency?: PlanFrequency;
};

export type UpdatePlanInput = PlanMoneyInput & {
	id: string;
	description?: string;
	frequency?: PlanFrequency;
};

async function resolveCategoryId(
	type: AddableTransactionType,
	raw: string | null | undefined
): Promise<string | null> {
	const trimmed = (raw ?? '').trim();
	if (!trimmed) return null;
	if (trimmed === ADMIN_FEE_CATEGORY_ID) {
		if (type !== 'expense') throw new Error('Choose a category for this type');
		return ADMIN_FEE_CATEGORY_ID;
	}
	const categories = await getCategoriesForType(type);
	const visible = categories.find((c) => c.id === trimmed);
	if (visible) return visible.id;
	const all = await listAllCategories();
	const hidden = all.find((c) => c.id === trimmed && c.kind === type);
	if (hidden) return hidden.id;
	throw new Error('Choose a category for this type');
}

async function moneyFields(input: PlanMoneyInput): Promise<{
	type: LedgerPlan['type'];
	amountMinor: number;
	feeMinor: number;
	categoryId: string | null;
	accountId: string;
	counterAccountId: string | null;
	note: string;
	dueOn: string;
}> {
	const dueOn = input.dueOn.trim();
	if (!isValidOccurredOn(dueOn)) throw new Error('Date must be YYYY-MM-DD');

	if (input.type === 'transfer') {
		const fields = buildTransferFields({
			sourceAccountId: input.accountId,
			destAccountId: input.counterAccountId ?? '',
			amountRaw: input.amountRaw,
			feeRaw: input.feeRaw,
			note: input.note,
			occurredOn: dueOn
		});
		const source = await getAccount(fields.accountId);
		const dest = await getAccount(fields.counterAccountId);
		if (!source || !dest) throw new Error('Choose source and destination pockets');
		return {
			type: 'transfer',
			amountMinor: fields.amountMinor,
			feeMinor: fields.feeMinor,
			categoryId: null,
			accountId: fields.accountId,
			counterAccountId: fields.counterAccountId,
			note: fields.note,
			dueOn: fields.occurredOn
		};
	}

	const amountMinor = parseAmountInput(input.amountRaw);
	let feeMinor = 0;
	if (input.type === 'expense') {
		try {
			feeMinor = parseNonNegativeAmountInput(input.feeRaw ?? '');
		} catch {
			throw new Error('Fee must be a whole number');
		}
	}
	const account = await getAccount(input.accountId);
	if (!account) throw new Error('Choose a pocket');
	return {
		type: input.type,
		amountMinor,
		feeMinor,
		categoryId: await resolveCategoryId(input.type, input.categoryId),
		accountId: input.accountId,
		counterAccountId: null,
		note: (input.note ?? '').trim(),
		dueOn
	};
}

function withFrequency(frequency: PlanFrequency | undefined, dueOn: string): {
	frequency: PlanFrequency;
	monthDay: number | null;
} {
	const freq = frequency ?? 'once';
	return { frequency: freq, monthDay: resolveMonthDay(freq, dueOn) };
}

export async function createPlan(input: CreatePlanInput): Promise<LedgerPlan> {
	const money = await moneyFields(input);
	const freq = withFrequency(input.frequency, money.dueOn);
	const plain: LedgerPlan = {
		id: createId(),
		description: (input.description ?? '').trim(),
		...money,
		createdAt: new Date().toISOString(),
		...freq
	};
	await putPlan(await sealPlan(plain));
	await pushPlan(plain.id);
	return plain;
}

export async function updatePlan(input: UpdatePlanInput): Promise<LedgerPlan> {
	const stored = await getPlan(input.id);
	if (!stored) throw new Error('Plan not found');
	const opened = await openPlan(stored);
	const money = await moneyFields(input);
	const freq = withFrequency(input.frequency ?? opened.frequency, money.dueOn);
	const next: LedgerPlan = {
		...opened,
		description:
			input.description !== undefined ? input.description.trim() : opened.description,
		...money,
		...freq
	};
	await putPlan(await sealPlan(next));
	await pushPlan(next.id);
	return next;
}

export async function dropPlan(id: string): Promise<void> {
	const stored = await getPlan(id);
	if (!stored) throw new Error('Plan not found');
	await deletePlanRow(id);
	await pushPlan(id, true);
}

async function advanceOrGravestone(opened: LedgerPlan): Promise<LedgerPlan | null> {
	if (opened.frequency === 'once') {
		await deletePlanRow(opened.id);
		await pushPlan(opened.id, true);
		return null;
	}
	const dueOn = nextDueOn(opened.dueOn, opened.frequency, opened.monthDay);
	if (!dueOn) {
		await deletePlanRow(opened.id);
		await pushPlan(opened.id, true);
		return null;
	}
	const next: LedgerPlan = {
		...opened,
		dueOn,
		monthDay: opened.frequency === 'monthly' ? opened.monthDay : null
	};
	await putPlan(await sealPlan(next));
	await pushPlan(next.id);
	return next;
}

export type AcceptPlanInput = PlanMoneyInput & {
	id: string;
	/** Accept-mode posting date; defaults to current dueOn. */
	occurredOn?: string;
};

async function postFromFields(input: PlanMoneyInput & { occurredOn?: string }): Promise<LedgerTransaction> {
	const occurredOn = (input.occurredOn ?? input.dueOn).trim();
	if (input.type === 'transfer') {
		const transfer: TransferInput = {
			sourceAccountId: input.accountId,
			destAccountId: input.counterAccountId ?? '',
			amountRaw: input.amountRaw,
			feeRaw: input.feeRaw,
			note: input.note,
			occurredOn
		};
		return addTransfer(transfer);
	}
	return addTransaction({
		accountId: input.accountId,
		type: input.type,
		amountRaw: input.amountRaw,
		feeRaw: input.feeRaw,
		categoryId: input.categoryId,
		note: input.note,
		occurredOn
	});
}

/** Post a ledger tx from current form fields; do not rewrite the template except advancing dueOn. */
export async function acceptPlanOccurrence(
	input: AcceptPlanInput
): Promise<{ tx: LedgerTransaction; plan: LedgerPlan | null }> {
	const stored = await getPlan(input.id);
	if (!stored) throw new Error('Plan not found');
	const opened = await openPlan(stored);
	const tx = await postFromFields({ ...input, dueOn: input.dueOn || opened.dueOn });
	const plan = await advanceOrGravestone(opened);
	return { tx, plan };
}

export async function skipPlanOccurrence(id: string): Promise<LedgerPlan | null> {
	const stored = await getPlan(id);
	if (!stored) throw new Error('Plan not found');
	const opened = await openPlan(stored);
	return advanceOrGravestone(opened);
}

/**
 * Write current tx info onto the Plan without posting or completing this occurrence.
 * Hidden in the UI when Repeat is Once.
 */
export async function savePlanForNext(input: AcceptPlanInput): Promise<LedgerPlan> {
	const stored = await getPlan(input.id);
	if (!stored) throw new Error('Plan not found');
	const opened = await openPlan(stored);
	if (opened.frequency === 'once') {
		throw new Error('Save for next is only for repeating plans');
	}
	const money = await moneyFields({
		...input,
		dueOn: (input.occurredOn ?? input.dueOn).trim() || opened.dueOn
	});
	const next: LedgerPlan = {
		...opened,
		...money,
		frequency: opened.frequency,
		monthDay: opened.frequency === 'monthly' ? opened.monthDay : null
	};
	await putPlan(await sealPlan(next));
	await pushPlan(next.id);
	return next;
}
