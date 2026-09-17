export type SessionClient = 'browser' | 'android';

export type SessionDeviceHints = {
	model?: string;
	platform?: string;
	platformVersion?: string;
	fullVersionList?: Array<{ brand: string; version: string }>;
};

const BROWSER_BRANDS = ['Google Chrome', 'Chrome', 'Microsoft Edge', 'Edge', 'Firefox', 'Safari'];

/** Native app only. Never infer android from an Android User-Agent. */
export function parseSessionClient(header?: string | null): SessionClient {
	return header?.trim().toLowerCase() === 'android' ? 'android' : 'browser';
}

export function parseBrowserLabel(
	userAgent: string,
	hints?: Pick<SessionDeviceHints, 'fullVersionList'>
): string {
	const fromHints = browserFromHints(hints?.fullVersionList);
	if (fromHints) return fromHints;
	return browserFromUserAgent(userAgent);
}

export function parseDeviceLabel(
	userAgent: string,
	hints?: Pick<SessionDeviceHints, 'model' | 'platform' | 'platformVersion'>
): string {
	const model = hints?.model?.trim();
	if (model) return model;
	const fromPlatform = deviceFromPlatform(hints?.platform, hints?.platformVersion);
	if (fromPlatform) return fromPlatform;
	return deviceFromUserAgent(userAgent);
}

export function sessionLabelsFromRequest(input: {
	clientHeader?: string | null;
	browserHeader?: string | null;
	deviceHeader?: string | null;
	userAgent?: string | null;
	hints?: SessionDeviceHints;
}): { client: SessionClient; browserLabel: string; deviceLabel: string } {
	const userAgent = input.userAgent ?? '';
	const client = parseSessionClient(input.clientHeader);
	const browserLabel =
		client === 'android'
			? ''
			: input.browserHeader?.trim() || parseBrowserLabel(userAgent, input.hints);
	const deviceLabel = input.deviceHeader?.trim() || parseDeviceLabel(userAgent, input.hints);
	return { client, browserLabel, deviceLabel };
}

type NavigatorUaData = {
	mobile?: boolean;
	getHighEntropyValues?: (hints: string[]) => Promise<{
		model?: string;
		platform?: string;
		platformVersion?: string;
		fullVersionList?: Array<{ brand: string; version: string }>;
	}>;
};

let cachedHeaders: Record<string, string> | null = null;

/** Headers this web client sends on authenticated API calls. Always `browser`. */
export async function sessionRequestHeaders(
	nav: (Navigator & { userAgentData?: NavigatorUaData }) | undefined = globalThis.navigator
): Promise<Record<string, string>> {
	if (cachedHeaders) return cachedHeaders;
	if (!nav) {
		return { 'X-PL-Client': 'browser' };
	}
	const ua = nav.userAgent ?? '';
	const uaData = (nav as Navigator & { userAgentData?: NavigatorUaData }).userAgentData;
	let hints: SessionDeviceHints | undefined;
	try {
		hints = await uaData?.getHighEntropyValues?.([
			'model',
			'platform',
			'platformVersion',
			'fullVersionList'
		]);
	} catch {
		hints = undefined;
	}
	const labels = sessionLabelsFromRequest({ userAgent: ua, hints });
	cachedHeaders = {
		'X-PL-Client': 'browser',
		'X-PL-Browser': labels.browserLabel,
		'X-PL-Device': labels.deviceLabel
	};
	return cachedHeaders;
}

export function resetSessionRequestHeadersCache() {
	cachedHeaders = null;
}

function browserFromHints(list?: Array<{ brand: string; version: string }>): string {
	if (!list?.length) return '';
	const usable = list.filter((row) => row.brand && !/^Not[:\s]/i.test(row.brand));
	for (const wanted of BROWSER_BRANDS) {
		const row = usable.find((item) => item.brand === wanted || item.brand.includes(wanted));
		if (row) return `${shortBrand(row.brand)} ${majorVersion(row.version)}`;
	}
	const first = usable[0];
	if (!first) return '';
	return `${shortBrand(first.brand)} ${majorVersion(first.version)}`;
}

function browserFromUserAgent(ua: string): string {
	const edge = /(?:Edg|Edge|EdgiOS)\/(\d+)/i.exec(ua);
	if (edge) return `Edge ${edge[1]}`;
	const firefox = /Firefox\/(\d+)/i.exec(ua);
	if (firefox) return `Firefox ${firefox[1]}`;
	const chrome = /Chrome\/(\d+)/i.exec(ua);
	if (chrome && !/Chromium/i.test(ua.split('Chrome')[0] ?? '')) return `Chrome ${chrome[1]}`;
	const safari = /Version\/(\d+).*Safari/i.exec(ua);
	if (safari && /Safari/i.test(ua) && !/Chrome|Chromium|Android/i.test(ua)) {
		return `Safari ${safari[1]}`;
	}
	const androidSafari = /Version\/(\d+).*Mobile.*Safari/i.exec(ua);
	if (androidSafari && !chrome) return `Safari ${androidSafari[1]}`;
	return '';
}

function shortBrand(brand: string): string {
	if (/Chrome/i.test(brand)) return 'Chrome';
	if (/Edge/i.test(brand)) return 'Edge';
	if (/Firefox/i.test(brand)) return 'Firefox';
	if (/Safari/i.test(brand)) return 'Safari';
	return brand.replace(/^Google\s+/i, '');
}

function majorVersion(version: string): string {
	return version.split('.')[0] || version;
}

function deviceFromPlatform(platform?: string, platformVersion?: string): string {
	const name = (platform ?? '').trim();
	if (!name) return '';
	if (/win/i.test(name)) return windowsFromVersion(platformVersion);
	if (/mac/i.test(name)) return 'macOS';
	if (/android/i.test(name)) return 'Android';
	if (/ios|iphone/i.test(name)) return 'iPhone';
	if (/ipad/i.test(name)) return 'iPad';
	if (/linux/i.test(name)) return 'Linux';
	if (/cros/i.test(name)) return 'Chrome OS';
	return name;
}

function windowsFromVersion(platformVersion?: string): string {
	const major = Number((platformVersion ?? '').split('.')[0]);
	if (Number.isFinite(major) && major >= 13) return 'Windows 11';
	if (Number.isFinite(major) && major >= 10) return 'Windows 10';
	return 'Windows';
}

function deviceFromUserAgent(ua: string): string {
	if (/iPhone/i.test(ua)) return 'iPhone';
	if (/iPad/i.test(ua)) return 'iPad';
	if (/Android/i.test(ua)) {
		const model = /Android [\d.]+; (?!wv)([^;)]+?)(?:\s+Build\/|\))/i.exec(ua);
		const name = model?.[1]?.trim();
		if (name && !/^(?:Mobile|U|en-us)$/i.test(name)) return name;
		return 'Android';
	}
	if (/Windows NT/i.test(ua)) return 'Windows';
	if (/Mac OS X/i.test(ua)) return 'macOS';
	if (/Fedora/i.test(ua)) return 'Fedora Linux';
	if (/CrOS/i.test(ua)) return 'Chrome OS';
	if (/Linux/i.test(ua)) return 'Linux';
	return '';
}
