/**
 * Largest calendar unit remaining from `today` (YYYY-MM-DD) to `targetOn`.
 * Positive = future; negative = overdue (same unit magnitude).
 */
export type TimeUnit = 'years' | 'months' | 'weeks' | 'days';

export type RemainingUnit = {
	unit: TimeUnit;
	/** Signed count in `unit` (negative when overdue). */
	count: number;
};

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseUtc(ymd: string): Date {
	const m = YMD.exec(ymd.trim());
	if (!m) throw new Error('Date must be YYYY-MM-DD');
	const y = Number(m[1]);
	const mo = Number(m[2]);
	const d = Number(m[3]);
	const dt = new Date(Date.UTC(y, mo - 1, d));
	if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
		throw new Error('Date must be YYYY-MM-DD');
	}
	return dt;
}

function dayDiff(from: string, to: string): number {
	const a = parseUtc(from).getTime();
	const b = parseUtc(to).getTime();
	return Math.round((b - a) / 86_400_000);
}

/**
 * Pick the largest unit that still has |count| >= 1.
 * Years if |days| >= 365; else months if |days| >= 30; else weeks if |days| >= 7; else days.
 */
export function largestRemainingUnit(today: string, targetOn: string): RemainingUnit {
	const days = dayDiff(today, targetOn);
	const sign = days < 0 ? -1 : 1;
	const abs = Math.abs(days);
	if (abs >= 365) {
		return { unit: 'years', count: sign * Math.floor(abs / 365) };
	}
	if (abs >= 30) {
		return { unit: 'months', count: sign * Math.floor(abs / 30) };
	}
	if (abs >= 7) {
		return { unit: 'weeks', count: sign * Math.floor(abs / 7) };
	}
	return { unit: 'days', count: days };
}

export function formatRemainingUnit(r: RemainingUnit): string {
	const abs = Math.abs(r.count);
	const label =
		r.unit === 'years'
			? abs === 1
				? 'year'
				: 'years'
			: r.unit === 'months'
				? abs === 1
					? 'month'
					: 'months'
				: r.unit === 'weeks'
					? abs === 1
						? 'week'
						: 'weeks'
					: abs === 1
						? 'day'
						: 'days';
	if (r.count < 0) return `${abs} ${label} overdue`;
	if (r.count === 0) return 'Due today';
	return `${abs} ${label} left`;
}
