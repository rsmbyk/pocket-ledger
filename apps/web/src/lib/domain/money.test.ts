import { describe, expect, it } from 'vitest';
import { addMinor, assertMinorUnits, formatMinor } from './money';

describe('money', () => {
	it('accepts integer minor units', () => {
		expect(assertMinorUnits(1500)).toBe(1500);
	});

	it('rejects non-integer amounts', () => {
		expect(() => assertMinorUnits(10.5)).toThrow(/integer/i);
	});

	it('adds minor units without floating point', () => {
		expect(addMinor(100, 250)).toBe(350);
	});

	it('formats with a currency label', () => {
		expect(formatMinor(12500, 'IDR')).toContain('12');
		expect(formatMinor(12500, 'IDR')).toContain('IDR');
	});

	it('puts a negative sign on the number after the currency label', () => {
		const out = formatMinor(-189398, 'IDR');
		expect(out.startsWith('IDR ')).toBe(true);
		expect(out.startsWith('−IDR') || out.startsWith('-IDR') || out.startsWith('+IDR')).toBe(false);
		expect(out).toBe(`IDR ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(-189398)}`);
	});
});
