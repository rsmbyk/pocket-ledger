import { describe, expect, it } from 'vitest';
import {
	isGatePath,
	isLegacyActivityPath,
	isLegacyMorePath,
	nearestValidPath,
	parsePath,
	parsePocketId,
	pocketDetailsPath,
	routeToPath
} from './router';

describe('path router', () => {
	it('maps empty, slash, and home paths to home', () => {
		expect(parsePath('')).toBe('home');
		expect(parsePath('/')).toBe('home');
		expect(parsePath('/home')).toBe('home');
		expect(nearestValidPath('/home')).toBe('/');
	});

	it('parses known panels', () => {
		expect(parsePath('/transactions')).toBe('transactions');
		expect(parsePath('/activity')).toBe('transactions');
		expect(parsePath('/pockets')).toBe('pockets');
		expect(parsePath('/categories')).toBe('categories');
		expect(parsePath('/settings')).toBe('settings');
		expect(parsePath('/more')).toBe('settings');
	});

	it('walks extra segments to the nearest valid parent (204)', () => {
		expect(nearestValidPath('/not-a-route')).toBe('/');
		expect(parsePath('/not-a-route')).toBe('home');
		expect(nearestValidPath('/transactions/extra')).toBe('/transactions');
		expect(parsePath('/transactions/extra')).toBe('transactions');
		expect(nearestValidPath('/activity/extra')).toBe('/transactions');
		expect(parsePath('/activity/extra')).toBe('transactions');
		expect(nearestValidPath('/pockets/vac-1/extra')).toBe('/pockets/vac-1');
		expect(parsePath('/pockets/vac-1/extra')).toBe('pockets');
		expect(parsePocketId('/pockets/vac-1/extra')).toBe('vac-1');
		expect(nearestValidPath('/onboarding/kit/x')).toBe('/onboarding/kit');
		expect(isGatePath('/onboarding/kit/x')).toBe(true);
		expect(parsePath('/onboarding/kit/x')).toBe('home');
	});

	it('treats /pockets/:id as the Pockets panel (148)', () => {
		expect(parsePath('/pockets/vac-1')).toBe('pockets');
		expect(parsePath('/pockets/vac-1/')).toBe('pockets');
		expect(parsePocketId('/pockets')).toBeNull();
		expect(parsePocketId('/pockets/')).toBeNull();
		expect(parsePocketId('/pockets/vac-1')).toBe('vac-1');
		expect(parsePocketId('/pockets/vac-1/')).toBe('vac-1');
		expect(parsePocketId('/pockets/a/b')).toBe('a');
		expect(parsePocketId('/transactions')).toBeNull();
		expect(pocketDetailsPath('vac-1')).toBe('/pockets/vac-1');
	});

	it('builds paths for navigation', () => {
		expect(routeToPath('home')).toBe('/');
		expect(routeToPath('transactions')).toBe('/transactions');
		expect(routeToPath('pockets')).toBe('/pockets');
		expect(routeToPath('categories')).toBe('/categories');
		expect(routeToPath('settings')).toBe('/settings');
	});

	it('detects the legacy Activity path for replace-navigation', () => {
		expect(isLegacyActivityPath('/activity')).toBe(true);
		expect(isLegacyActivityPath('/activity/')).toBe(true);
		expect(isLegacyActivityPath('/transactions')).toBe(false);
		expect(nearestValidPath('/activity')).toBe('/transactions');
	});

	it('detects the legacy More path for replace-navigation', () => {
		expect(isLegacyMorePath('/more')).toBe(true);
		expect(isLegacyMorePath('/more/')).toBe(true);
		expect(isLegacyMorePath('/settings')).toBe(false);
		expect(nearestValidPath('/more')).toBe('/settings');
	});
});
