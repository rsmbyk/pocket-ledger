/**
 * Session list metadata: client/device labels, GeoIP area, last IP (Spec 251).
 */

const PRIVATE_V4 = [
	['127.', true],
	['10.', true],
	['192.168.', true],
	['169.254.', true]
];

export function clientIpFromHeaders(headers) {
	const xff = header(headers, 'x-forwarded-for');
	if (xff) return xff.split(',')[0]?.trim() ?? '';
	return header(headers, 'x-real-ip');
}

export function isPrivateIp(ip) {
	const value = String(ip ?? '').trim();
	if (!value) return false;
	if (value === '::1' || value === '0:0:0:0:0:0:0:1') return true;
	if (value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) return true;
	if (PRIVATE_V4.some(([prefix]) => value.startsWith(prefix))) return true;
	const m = /^172\.(\d+)\./.exec(value);
	if (m) {
		const second = Number(m[1]);
		return second >= 16 && second <= 31;
	}
	return false;
}

export function formatArea(hit) {
	if (!hit) return '';
	const country = countryName(hit.country) || hit.country || '';
	const bits = [hit.city, hit.region, country].map((part) => String(part ?? '').trim()).filter(Boolean);
	return bits.join(', ');
}

export function areaAndIpForRequest(ip, lookupArea) {
	const lastIp = String(ip ?? '').trim();
	if (!lastIp) return { lastIp: '', lastArea: 'Unknown area' };
	if (isPrivateIp(lastIp)) return { lastIp, lastArea: 'Local network' };
	const hit = lookupArea ? lookupArea(lastIp) : null;
	const lastArea = formatArea(hit) || 'Unknown area';
	return { lastIp, lastArea };
}

export function sortSessionsForList(sessions, currentId) {
	return [...sessions].sort((a, b) => {
		if (a.id === currentId && b.id !== currentId) return -1;
		if (b.id === currentId && a.id !== currentId) return 1;
		const seen = String(b.lastSeenAt).localeCompare(String(a.lastSeenAt));
		if (seen) return seen;
		return String(a.id).localeCompare(String(b.id));
	});
}

export function sessionLabelsFromRequest({
	clientHeader,
	browserHeader,
	deviceHeader,
	userAgent
} = {}) {
	const ua = userAgent ?? '';
	const client = clientHeader?.trim().toLowerCase() === 'android' ? 'android' : 'browser';
	const browserLabel = client === 'android' ? '' : browserHeader?.trim() || browserFromUserAgent(ua);
	const deviceLabel = deviceHeader?.trim() || deviceFromUserAgent(ua);
	return { client, browserLabel, deviceLabel };
}

export function publicSession(session, currentId) {
	return {
		id: session.id,
		current: session.id === currentId,
		client: session.client === 'android' ? 'android' : 'browser',
		browserLabel: session.browserLabel ?? '',
		deviceLabel: session.deviceLabel ?? '',
		lastSeenAt: session.lastSeenAt,
		lastArea: session.lastArea ?? '',
		lastIp: session.lastIp ?? ''
	};
}

export function defaultLookupArea(ip) {
	try {
		if (!geoipLite) return null;
		const hit = geoipLite.lookup(ip);
		if (!hit) return null;
		return { city: hit.city ?? '', region: hit.region ?? '', country: hit.country ?? '' };
	} catch {
		return null;
	}
}

let geoipLite = null;
try {
	geoipLite = (await import('geoip-lite')).default;
} catch {
	geoipLite = null;
}

function countryName(code) {
	const iso = String(code ?? '').trim();
	if (!iso) return '';
	try {
		return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso) || iso;
	} catch {
		return iso;
	}
}

function header(headers, name) {
	if (!headers) return '';
	if (typeof headers.get === 'function') return String(headers.get(name) ?? '').trim();
	const direct = headers[name] ?? headers[name.toLowerCase()];
	return String(direct ?? '').trim();
}

function browserFromUserAgent(ua) {
	const edge = /(?:Edg|Edge|EdgiOS)\/(\d+)/i.exec(ua);
	if (edge) return `Edge ${edge[1]}`;
	const firefox = /Firefox\/(\d+)/i.exec(ua);
	if (firefox) return `Firefox ${firefox[1]}`;
	const chrome = /Chrome\/(\d+)/i.exec(ua);
	if (chrome) return `Chrome ${chrome[1]}`;
	const safari = /Version\/(\d+).*Safari/i.exec(ua);
	if (safari && /Safari/i.test(ua) && !/Chrome|Chromium/i.test(ua)) return `Safari ${safari[1]}`;
	return '';
}

function deviceFromUserAgent(ua) {
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
