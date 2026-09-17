import { describe, expect, it } from 'vitest';
import {
	formatSessionAccessLine,
	formatSessionArea,
	formatSessionIp,
	formatSessionLastAccess
} from './session-access-display';

describe('session-access-display', () => {
	it('formats last access as DD MMM YYYY HH:mm in local time', () => {
		const iso = '2026-09-17T12:40:00.000Z';
		const d = new Date(iso);
		const hh = String(d.getHours()).padStart(2, '0');
		const mm = String(d.getMinutes()).padStart(2, '0');
		expect(formatSessionLastAccess(iso)).toBe(`${d.getDate()} Sep ${d.getFullYear()} ${hh}:${mm}`);
	});

	it('joins client, browser, and device; omits browser on native android', () => {
		expect(
			formatSessionAccessLine({
				client: 'browser',
				browserLabel: 'Chrome 128',
				deviceLabel: 'Windows 11'
			})
		).toBe('Browser · Chrome 128 · Windows 11');
		expect(
			formatSessionAccessLine({
				client: 'browser',
				browserLabel: '',
				deviceLabel: 'Linux'
			})
		).toBe('Browser · Linux');
		expect(
			formatSessionAccessLine({
				client: 'android',
				browserLabel: 'Chrome 128',
				deviceLabel: 'Infinix Hot 40'
			})
		).toBe('Android · Infinix Hot 40');
	});

	it('falls back when IP or area is missing', () => {
		expect(formatSessionIp('')).toBe('Unknown');
		expect(formatSessionIp('127.0.0.1')).toBe('127.0.0.1');
		expect(formatSessionArea('')).toBe('Unknown area');
		expect(formatSessionArea('Local network')).toBe('Local network');
	});
});
