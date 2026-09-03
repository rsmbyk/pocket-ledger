import { describe, expect, it } from 'vitest';
import {
	DEFAULT_DISPLAY_CURRENCY,
	currencyRowLabel,
	listCurrencyOptions,
	parseDisplayCurrency,
	searchCurrencies
} from './display-currency';

describe('display currency', () => {
	it('includes IDR and formats rows as ISO then name - symbol', () => {
		const options = listCurrencyOptions();
		const idr = options.find((o) => o.code === 'IDR');
		expect(idr).toBeTruthy();
		expect(currencyRowLabel(idr!)).toMatch(/^IDR\s{2}.+ - /);
		expect(options.map((o) => o.code)).toEqual([...options.map((o) => o.code)].sort());
	});

	it('falls back to IDR for invalid stored values', () => {
		expect(parseDisplayCurrency(undefined)).toBe(DEFAULT_DISPLAY_CURRENCY);
		expect(parseDisplayCurrency('nope')).toBe(DEFAULT_DISPLAY_CURRENCY);
		expect(parseDisplayCurrency('usd')).toBe('USD');
	});

	it('searches ISO or name, not symbol', () => {
		const options = listCurrencyOptions();
		const idr = options.find((o) => o.code === 'IDR')!;
		expect(searchCurrencies(options, 'rup').some((o) => o.code === 'IDR')).toBe(true);
		expect(searchCurrencies(options, 'USD').some((o) => o.code === 'USD')).toBe(true);
		if (idr.symbol && idr.symbol !== 'IDR' && !/rup/i.test(idr.symbol)) {
			expect(searchCurrencies(options, idr.symbol).some((o) => o.code === 'IDR')).toBe(false);
		}
	});
});
