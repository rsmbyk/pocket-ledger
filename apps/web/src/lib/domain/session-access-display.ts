const MONTH_ABBREV = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
] as const;

export type SessionAccessLabels = {
	client: 'browser' | 'android';
	browserLabel?: string | null;
	deviceLabel?: string | null;
};

/** Local `DD MMM YYYY HH:mm` for an ISO timestamp. */
export function formatSessionLastAccess(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	const day = String(d.getDate());
	const mon = MONTH_ABBREV[d.getMonth()]!;
	const year = d.getFullYear();
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `${day} ${mon} ${year} ${hh}:${mm}`;
}

/** Client · optional browser · optional device. Native android omits the browser segment. */
export function formatSessionAccessLine(labels: SessionAccessLabels): string {
	const parts = [labels.client === 'android' ? 'Android' : 'Browser'];
	if (labels.client !== 'android') {
		const browser = labels.browserLabel?.trim();
		if (browser) parts.push(browser);
	}
	const device = labels.deviceLabel?.trim();
	if (device) parts.push(device);
	return parts.join(' · ');
}

export function formatSessionIp(lastIp?: string | null): string {
	const value = lastIp?.trim();
	return value || 'Unknown';
}

export function formatSessionArea(lastArea?: string | null): string {
	const value = lastArea?.trim();
	return value || 'Unknown area';
}
