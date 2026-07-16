import { describe, expect, it } from 'vitest';
import {
	balanceDelta,
	formatAmountDigitsDisplay,
	isCreateTxDirty,
	isEditTxDirty,
	isValidOccurredOn,
	parseAmountInput,
	sumBalance,
	todayOccurredOn
} from './transaction-rules';

describe('transaction-rules', () => {
	it('parses whole-number amounts', () => {
		expect(parseAmountInput('15000')).toBe(15000);
		expect(parseAmountInput('15,000')).toBe(15000);
	});

	it('formats amount digits with thousand grouping', () => {
		expect(formatAmountDigitsDisplay('15000')).toBe('15,000');
		expect(formatAmountDigitsDisplay('15,000')).toBe('15,000');
		expect(formatAmountDigitsDisplay('')).toBe('');
	});

	it('detects create and edit dirty state', () => {
		const base = {
			type: 'expense' as const,
			amountDigits: '',
			categoryId: '',
			note: '',
			occurredOn: '2026-07-16'
		};
		expect(isCreateTxDirty({ ...base, amountDigits: '100' }, base)).toBe(true);
		expect(isCreateTxDirty(base, base)).toBe(false);
		expect(
			isEditTxDirty(
				{ amountDigits: '100', categoryId: 'a', note: '', occurredOn: '2026-07-16' },
				{ amountDigits: '100', categoryId: 'a', note: '', occurredOn: '2026-07-16' }
			)
		).toBe(false);
		expect(
			isEditTxDirty(
				{ amountDigits: '200', categoryId: 'a', note: '', occurredOn: '2026-07-16' },
				{ amountDigits: '100', categoryId: 'a', note: '', occurredOn: '2026-07-16' }
			)
		).toBe(true);
	});

	it('rejects empty, zero, and fractional amounts', () => {
		expect(() => parseAmountInput('')).toThrow(/required/i);
		expect(() => parseAmountInput('0')).toThrow(/greater than zero/i);
		expect(() => parseAmountInput('10.5')).toThrow(/whole number/i);
	});

	it('maps income and expense to balance deltas', () => {
		expect(balanceDelta({ type: 'income', amountMinor: 100 })).toBe(100);
		expect(balanceDelta({ type: 'expense', amountMinor: 40 })).toBe(-40);
		expect(
			balanceDelta({ type: 'expense', amountMinor: 40, voidedAt: '2026-07-16T00:00:00.000Z' })
		).toBe(0);
	});

	it('sums account balance ignoring voided', () => {
		expect(
			sumBalance([
				{ type: 'income', amountMinor: 100_000 },
				{ type: 'expense', amountMinor: 15_000 },
				{ type: 'expense', amountMinor: 5_000, voidedAt: '2026-07-16T00:00:00.000Z' }
			])
		).toBe(85_000);
	});

	it('validates occurredOn dates', () => {
		expect(isValidOccurredOn('2026-07-14')).toBe(true);
		expect(isValidOccurredOn('2026-13-01')).toBe(false);
		expect(isValidOccurredOn('yesterday')).toBe(false);
	});

	it('formats today as YYYY-MM-DD', () => {
		expect(todayOccurredOn(new Date('2026-07-14T15:00:00'))).toBe('2026-07-14');
	});
});
