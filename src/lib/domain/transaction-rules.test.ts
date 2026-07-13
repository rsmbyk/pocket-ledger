import { describe, expect, it } from 'vitest';
import {
	balanceDelta,
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

	it('rejects empty, zero, and fractional amounts', () => {
		expect(() => parseAmountInput('')).toThrow(/required/i);
		expect(() => parseAmountInput('0')).toThrow(/greater than zero/i);
		expect(() => parseAmountInput('10.5')).toThrow(/whole number/i);
	});

	it('maps income and expense to balance deltas', () => {
		expect(balanceDelta({ type: 'income', amountMinor: 100 })).toBe(100);
		expect(balanceDelta({ type: 'expense', amountMinor: 40 })).toBe(-40);
	});

	it('sums account balance', () => {
		expect(
			sumBalance([
				{ type: 'income', amountMinor: 100_000 },
				{ type: 'expense', amountMinor: 15_000 }
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
