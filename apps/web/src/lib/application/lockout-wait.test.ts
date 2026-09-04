import { describe, expect, it } from 'vitest';
import { formatLockoutRemaining } from './lockout-wait';

describe('formatLockoutRemaining', () => {
	it('formats minutes and seconds', () => {
		expect(formatLockoutRemaining(15 * 60 * 1000)).toBe('15:00');
		expect(formatLockoutRemaining(14 * 60 * 1000 + 59000)).toBe('14:59');
		expect(formatLockoutRemaining(0)).toBe('0:00');
	});
});
