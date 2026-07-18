import { describe, expect, it } from 'vitest';
import { formatRemainingUnit, largestRemainingUnit } from './goal-time';

describe('largestRemainingUnit', () => {
	it('uses years when >= 365 days', () => {
		expect(largestRemainingUnit('2026-01-01', '2027-02-01')).toEqual({
			unit: 'years',
			count: 1
		});
	});

	it('uses months when >= 30 days and under a year', () => {
		expect(largestRemainingUnit('2026-01-01', '2026-03-15')).toEqual({
			unit: 'months',
			count: 2
		});
	});

	it('uses weeks when >= 7 days', () => {
		expect(largestRemainingUnit('2026-01-01', '2026-01-20')).toEqual({
			unit: 'weeks',
			count: 2
		});
	});

	it('uses days under a week', () => {
		expect(largestRemainingUnit('2026-01-01', '2026-01-04')).toEqual({
			unit: 'days',
			count: 3
		});
	});

	it('reports overdue with negative count', () => {
		expect(largestRemainingUnit('2026-02-01', '2026-01-01').count).toBeLessThan(0);
	});
});

describe('formatRemainingUnit', () => {
	it('formats future and overdue', () => {
		expect(formatRemainingUnit({ unit: 'days', count: 3 })).toBe('3 days left');
		expect(formatRemainingUnit({ unit: 'months', count: -2 })).toBe('2 months overdue');
		expect(formatRemainingUnit({ unit: 'days', count: 0 })).toBe('Due today');
	});
});
