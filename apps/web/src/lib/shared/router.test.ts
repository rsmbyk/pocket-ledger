import { describe, expect, it } from 'vitest';
import { isLegacyActivityPath, parsePath, parsePocketId, pocketDetailsPath, routeToPath } from './router';

describe('path router', () => {
	it('maps empty, slash, and home paths to home', () => {
		expect(parsePath('')).toBe('home');
		expect(parsePath('/')).toBe('home');
		expect(parsePath('/home')).toBe('home');
	});

	it('parses known panels', () => {
		expect(parsePath('/transactions')).toBe('transactions');
		expect(parsePath('/activity')).toBe('transactions');
		expect(parsePath('/pockets')).toBe('pockets');
		expect(parsePath('/categories')).toBe('categories');
		expect(parsePath('/more')).toBe('more');
	});

	it('falls back for unknown paths', () => {
		expect(parsePath('/not-a-route')).toBe('home');
		expect(parsePath('/activity/extra')).toBe('home');
		expect(parsePath('/transactions/extra')).toBe('home');
		expect(parsePath('/pockets/a/b')).toBe('home');
	});

	it('treats /pockets/:id as the Pockets panel (148)', () => {
		expect(parsePath('/pockets/vac-1')).toBe('pockets');
		expect(parsePath('/pockets/vac-1/')).toBe('pockets');
		expect(parsePocketId('/pockets')).toBeNull();
		expect(parsePocketId('/pockets/')).toBeNull();
		expect(parsePocketId('/pockets/vac-1')).toBe('vac-1');
		expect(parsePocketId('/pockets/vac-1/')).toBe('vac-1');
		expect(parsePocketId('/pockets/a/b')).toBeNull();
		expect(parsePocketId('/transactions')).toBeNull();
		expect(pocketDetailsPath('vac-1')).toBe('/pockets/vac-1');
	});

	it('builds paths for navigation', () => {
		expect(routeToPath('home')).toBe('/');
		expect(routeToPath('transactions')).toBe('/transactions');
		expect(routeToPath('pockets')).toBe('/pockets');
		expect(routeToPath('categories')).toBe('/categories');
		expect(routeToPath('more')).toBe('/more');
	});

	it('detects the legacy Activity path for replace-navigation', () => {
		expect(isLegacyActivityPath('/activity')).toBe(true);
		expect(isLegacyActivityPath('/activity/')).toBe(true);
		expect(isLegacyActivityPath('/transactions')).toBe(false);
	});
});
