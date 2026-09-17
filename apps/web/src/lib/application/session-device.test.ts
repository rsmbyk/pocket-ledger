import { describe, expect, it } from 'vitest';
import {
	parseBrowserLabel,
	parseDeviceLabel,
	parseSessionClient,
	sessionLabelsFromRequest
} from './session-device';

const INFINIX =
	'Mozilla/5.0 (Linux; Android 13; Infinix X6833 Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.146 Mobile Safari/537.36';
const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const WINDOWS =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const FEDORA =
	'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0';
const EDGE =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.42';

describe('session-device', () => {
	it('treats Android and iPhone browsers as browser, not android', () => {
		expect(parseSessionClient(undefined)).toBe('browser');
		expect(parseSessionClient('browser')).toBe('browser');
		expect(sessionLabelsFromRequest({ userAgent: INFINIX }).client).toBe('browser');
		expect(sessionLabelsFromRequest({ userAgent: IPHONE }).client).toBe('browser');
	});

	it('uses android only when the native header is set', () => {
		expect(parseSessionClient('android')).toBe('android');
		expect(sessionLabelsFromRequest({ clientHeader: 'android', userAgent: INFINIX }).client).toBe(
			'android'
		);
	});

	it('parses Infinix, iPhone, Windows, and Fedora from User-Agent', () => {
		expect(parseDeviceLabel(INFINIX)).toBe('Infinix X6833');
		expect(parseDeviceLabel(IPHONE)).toBe('iPhone');
		expect(parseDeviceLabel(WINDOWS)).toBe('Windows');
		expect(parseDeviceLabel(FEDORA)).toBe('Fedora Linux');
	});

	it('parses Chrome, Firefox, Safari, and Edge name plus major version', () => {
		expect(parseBrowserLabel(INFINIX)).toBe('Chrome 128');
		expect(parseBrowserLabel(FEDORA)).toBe('Firefox 140');
		expect(parseBrowserLabel(IPHONE)).toBe('Safari 18');
		expect(parseBrowserLabel(EDGE)).toBe('Edge 128');
	});

	it('lets UA-CH model and brands win over User-Agent', () => {
		expect(
			parseDeviceLabel(WINDOWS, { model: 'Infinix Hot 40', platform: 'Android' })
		).toBe('Infinix Hot 40');
		expect(
			parseBrowserLabel(WINDOWS, {
				fullVersionList: [
					{ brand: 'Not A;Brand', version: '99' },
					{ brand: 'Google Chrome', version: '131.0.6778.69' },
					{ brand: 'Chromium', version: '131.0.6778.69' }
				]
			})
		).toBe('Chrome 131');
		expect(parseDeviceLabel('', { platform: 'Windows', platformVersion: '15.0.0' })).toBe(
			'Windows 11'
		);
	});
});
