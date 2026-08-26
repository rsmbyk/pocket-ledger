import { describe, expect, it } from 'vitest';
import { parsePath, routeToPath } from './router';

describe('path router', () => {
	it('maps empty, slash, and home paths to home', () => {
		expect(parsePath('')).toBe('home');
		expect(parsePath('/')).toBe('home');
		expect(parsePath('/home')).toBe('home');
	});

	it('parses known panels', () => {
		expect(parsePath('/activity')).toBe('activity');
		expect(parsePath('/pockets')).toBe('pockets');
		expect(parsePath('/categories')).toBe('categories');
		expect(parsePath('/more')).toBe('more');
	});

	it('falls back for unknown paths', () => {
		expect(parsePath('/not-a-route')).toBe('home');
		expect(parsePath('/activity/extra')).toBe('home');
	});

	it('builds paths for navigation', () => {
		expect(routeToPath('home')).toBe('/');
		expect(routeToPath('activity')).toBe('/activity');
		expect(routeToPath('pockets')).toBe('/pockets');
		expect(routeToPath('categories')).toBe('/categories');
		expect(routeToPath('more')).toBe('/more');
	});
});
