import { describe, expect, it } from 'vitest';
import { formatOccurredOnDisplay } from './occurred-on-display';

describe('formatOccurredOnDisplay', () => {
	it('formats as DD MMM YYYY', () => {
		expect(formatOccurredOnDisplay('2026-06-16')).toBe('16 Jun 2026');
		expect(formatOccurredOnDisplay('2026-07-06')).toBe('06 Jul 2026');
		expect(formatOccurredOnDisplay('2025-12-25')).toBe('25 Dec 2025');
	});

	it('returns raw string when invalid', () => {
		expect(formatOccurredOnDisplay('not-a-date')).toBe('not-a-date');
	});
});
