import { describe, expect, it } from 'vitest';
import { parseHash, routeToHash } from './router';

describe('hash router', () => {
	it('maps empty and home hashes to home', () => {
		expect(parseHash('')).toBe('home');
		expect(parseHash('#')).toBe('home');
		expect(parseHash('#/')).toBe('home');
		expect(parseHash('#/home')).toBe('home');
	});

	it('parses known panels', () => {
		expect(parseHash('#/activity')).toBe('activity');
		expect(parseHash('#/pockets')).toBe('pockets');
		expect(parseHash('#/categories')).toBe('categories');
		expect(parseHash('#/more')).toBe('more');
	});

	it('falls back for unknown paths', () => {
		expect(parseHash('#/not-a-route')).toBe('home');
		expect(parseHash('#/activity/extra')).toBe('home');
	});

	it('builds hashes for navigation', () => {
		expect(routeToHash('home')).toBe('#/');
		expect(routeToHash('activity')).toBe('#/activity');
		expect(routeToHash('pockets')).toBe('#/pockets');
		expect(routeToHash('categories')).toBe('#/categories');
		expect(routeToHash('more')).toBe('#/more');
	});
});
