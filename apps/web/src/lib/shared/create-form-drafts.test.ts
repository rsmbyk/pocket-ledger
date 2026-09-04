import { describe, expect, it } from 'vitest';
import {
	TX_CREATE_DRAFT_KEY,
	clearTxCreateDraft,
	parseTxCreateDraft,
	readTxCreateDraft,
	writeTxCreateDraft,
	type TxCreateDraft
} from './create-form-drafts';

function memoryStorage() {
	const map = new Map<string, string>();
	return {
		getItem: (k: string) => map.get(k) ?? null,
		setItem: (k: string, v: string) => {
			map.set(k, v);
		},
		removeItem: (k: string) => {
			map.delete(k);
		},
		map
	};
}

const sampleTx: TxCreateDraft = {
	mode: 'normal',
	type: 'expense',
	amountDigits: '1500',
	categoryId: 'cat-1',
	note: 'coffee',
	occurredOn: '2026-07-20',
	accountId: 'acc-main',
	transferSourceId: 'acc-main',
	transferDestId: 'acc-vac',
	transferAmountDigits: '',
	transferFeeDigits: '',
	expenseFeeDigits: '',
	transferNote: '',
	transferOccurredOn: '2026-07-20'
};

describe('create-form-drafts', () => {
	it('returns null for missing or garbage tx drafts', () => {
		expect(parseTxCreateDraft(null)).toBeNull();
		expect(parseTxCreateDraft('')).toBeNull();
		expect(parseTxCreateDraft('not-json')).toBeNull();
		expect(parseTxCreateDraft('[]')).toBeNull();
		expect(parseTxCreateDraft(JSON.stringify({ mode: 'nope' }))).toBeNull();
	});

	it('round-trips tx create draft and clears', () => {
		const storage = memoryStorage();
		writeTxCreateDraft(sampleTx, storage);
		expect(storage.map.has(TX_CREATE_DRAFT_KEY)).toBe(true);
		expect(readTxCreateDraft(storage)).toEqual(sampleTx);
		clearTxCreateDraft(storage);
		expect(readTxCreateDraft(storage)).toBeNull();
	});

	it('round-trips transfer mode fields', () => {
		const storage = memoryStorage();
		const transfer: TxCreateDraft = {
			...sampleTx,
			mode: 'transfer',
			transferAmountDigits: '500',
			transferFeeDigits: '25',
			transferNote: 'move',
			transferSourceId: 'a',
			transferDestId: 'b',
			transferOccurredOn: '2026-07-21'
		};
		writeTxCreateDraft(transfer, storage);
		expect(readTxCreateDraft(storage)?.mode).toBe('transfer');
		expect(readTxCreateDraft(storage)?.transferAmountDigits).toBe('500');
		expect(readTxCreateDraft(storage)?.transferFeeDigits).toBe('25');
	});

	it('defaults missing transfer fee digits to empty', () => {
		const { transferFeeDigits: _omit, ...legacy } = sampleTx;
		expect(parseTxCreateDraft(JSON.stringify(legacy))?.transferFeeDigits).toBe('');
	});

	it('round-trips expense fee digits and defaults missing to empty', () => {
		const storage = memoryStorage();
		writeTxCreateDraft({ ...sampleTx, expenseFeeDigits: '250' }, storage);
		expect(readTxCreateDraft(storage)?.expenseFeeDigits).toBe('250');
		const { expenseFeeDigits: _omit, ...legacy } = sampleTx;
		expect(parseTxCreateDraft(JSON.stringify(legacy))?.expenseFeeDigits).toBe('');
	});
});
