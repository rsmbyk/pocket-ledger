import { describe, expect, it } from 'vitest';
import { formatOccurredOnDisplay } from './occurred-on-display';

describe('formatOccurredOnDisplay', () => {
	it('omits year when same calendar year as today', () => {
		expect(formatOccurredOnDisplay('2026-07-06', '2026-07-16')).toBe('Jul 06');
		expect(formatOccurredOnDisplay('2026-07-16', '2026-12-01')).toBe('Jul 16');
	});

	it('includes year when different from today', () => {
		expect(formatOccurredOnDisplay('2025-12-25', '2026-07-16')).toBe('Dec 25, 2025');
	});
});
