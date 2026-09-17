import { describe, expect, it } from 'vitest';
import {
	areaAndIpForRequest,
	clientIpFromHeaders,
	formatArea,
	isPrivateIp,
	sessionLabelsFromRequest,
	sortSessionsForList
} from './session-meta.js';

const ANDROID_CHROME =
	'Mozilla/5.0 (Linux; Android 13; Infinix X6833 Build/TP1A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';

describe('session-meta', () => {
	it('reads the leftmost forwarded IP', () => {
		expect(clientIpFromHeaders({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })).toBe('203.0.113.9');
		expect(clientIpFromHeaders({ 'x-real-ip': '198.51.100.2' })).toBe('198.51.100.2');
	});

	it('maps private IPs to Local network and still returns the IP', () => {
		expect(isPrivateIp('127.0.0.1')).toBe(true);
		expect(isPrivateIp('10.1.2.3')).toBe(true);
		expect(isPrivateIp('192.168.0.4')).toBe(true);
		expect(isPrivateIp('172.16.0.1')).toBe(true);
		expect(isPrivateIp('::1')).toBe(true);
		expect(areaAndIpForRequest('127.0.0.1', () => ({ city: 'Nope' }))).toEqual({
			lastIp: '127.0.0.1',
			lastArea: 'Local network'
		});
	});

	it('joins city, region, and country; unknown when lookup misses', () => {
		expect(formatArea({ city: 'Bandung', region: 'West Java', country: 'ID' })).toMatch(
			/Bandung, West Java, Indonesia/
		);
		expect(areaAndIpForRequest('203.0.113.9', () => ({ city: 'Bandung', country: 'ID' }))).toEqual({
			lastIp: '203.0.113.9',
			lastArea: 'Bandung, Indonesia'
		});
		expect(areaAndIpForRequest('203.0.113.9', () => null)).toEqual({
			lastIp: '203.0.113.9',
			lastArea: 'Unknown area'
		});
	});

	it('sorts the current session first even when another row is newer', () => {
		const rows = sortSessionsForList(
			[
				{ id: 'old-current', lastSeenAt: '2026-01-01T00:00:00.000Z' },
				{ id: 'newer-other', lastSeenAt: '2026-09-01T00:00:00.000Z' }
			],
			'old-current'
		);
		expect(rows.map((s) => s.id)).toEqual(['old-current', 'newer-other']);
	});

	it('does not treat an Android User-Agent as the native client', () => {
		expect(sessionLabelsFromRequest({ userAgent: ANDROID_CHROME }).client).toBe('browser');
		expect(sessionLabelsFromRequest({ userAgent: ANDROID_CHROME }).deviceLabel).toBe('Infinix X6833');
		expect(sessionLabelsFromRequest({ userAgent: ANDROID_CHROME }).browserLabel).toBe('Chrome 128');
		expect(sessionLabelsFromRequest({ clientHeader: 'android' }).client).toBe('android');
	});
});
