import { describe, expect, it } from 'vitest';
import { formatOccurredOnDisplay } from './occurred-on-display';

describe('formatOccurredOnDisplay', () => {
	it('formats as YY Mon DD', () => {
		expect(formatOccurredOnDisplay('2026-06-16')).toBe('26 Jun 16');
		expect(formatOccurredOnDisplay('2026-07-06')).toBe('26 Jul 06');
		expect(formatOccurredOnDisplay('2025-12-25')).toBe('25 Dec 25');
	});

	it('returns raw string when invalid', () => {
		expect(formatOccurredOnDisplay('not-a-date')).toBe('not-a-date');
	});
});
