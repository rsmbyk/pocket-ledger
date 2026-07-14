import { describe, expect, it } from 'vitest';
import { advanceOccurredOn, isDue } from './recurring';

describe('recurring', () => {
	it('advances weekly by 7 days', () => {
		expect(advanceOccurredOn('2026-07-14', 'weekly')).toBe('2026-07-21');
	});

	it('advances monthly and clamps day', () => {
		expect(advanceOccurredOn('2026-01-31', 'monthly')).toBe('2026-02-28');
		expect(advanceOccurredOn('2026-07-14', 'monthly')).toBe('2026-08-14');
	});

	it('detects due dates', () => {
		expect(isDue('2026-07-14', '2026-07-14')).toBe(true);
		expect(isDue('2026-07-15', '2026-07-14')).toBe(false);
	});
});
