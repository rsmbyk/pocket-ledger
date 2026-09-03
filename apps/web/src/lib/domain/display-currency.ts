/** Display currency catalog (Spec 155). No FX — one ISO code for the whole app. */

export const DEFAULT_DISPLAY_CURRENCY = 'IDR';

export type CurrencyOption = {
	code: string;
	name: string;
	symbol: string;
};

function currencyCodes(): string[] {
	let codes: string[] = [];
	try {
		codes = [...Intl.supportedValuesOf('currency')];
	} catch {
		codes = ['IDR', 'USD', 'EUR', 'GBP', 'JPY'];
	}
	if (!codes.includes(DEFAULT_DISPLAY_CURRENCY)) codes.unshift(DEFAULT_DISPLAY_CURRENCY);
	return [...new Set(codes)].sort((a, b) => a.localeCompare(b));
}

function currencyName(code: string): string {
	try {
		return new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) ?? code;
	} catch {
		return code;
	}
}

function currencySymbol(code: string): string {
	try {
		const part = new Intl.NumberFormat('en', { style: 'currency', currency: code })
			.formatToParts(0)
			.find((p) => p.type === 'currency');
		return part?.value ?? code;
	} catch {
		return code;
	}
}

export function listCurrencyOptions(): CurrencyOption[] {
	return currencyCodes().map((code) => ({
		code,
		name: currencyName(code),
		symbol: currencySymbol(code)
	}));
}

/** ISO, then a gap, then `Name - Symbol`. */
export function currencyRowLabel(option: CurrencyOption): string {
	return `${option.code}  ${option.name} - ${option.symbol}`;
}

export function parseDisplayCurrency(raw: string | undefined | null): string {
	const code = (raw ?? '').trim().toUpperCase();
	if (!/^[A-Z]{3}$/.test(code)) return DEFAULT_DISPLAY_CURRENCY;
	const known = listCurrencyOptions();
	return known.some((o) => o.code === code) ? code : DEFAULT_DISPLAY_CURRENCY;
}

/** Match ISO or name, not symbol. */
export function searchCurrencies(options: CurrencyOption[], query: string): CurrencyOption[] {
	const q = query.trim().toLowerCase();
	if (!q) return options;
	return options.filter(
		(o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)
	);
}
