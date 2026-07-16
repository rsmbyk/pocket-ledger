/** English month abbreviations for display (fixed, not locale-dependent). */
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

/** Local calendar YYYY-MM-DD for `now`. */
export function todayYmd(now = new Date()): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export type OccurredOnDisplayOptions = {
	/** `auto` omits year when same calendar year as today; `always` includes year. */
	year?: 'auto' | 'always';
};

/**
 * Display an ISO `YYYY-MM-DD` occurred-on date.
 * `year: 'auto'` (default): same year as today → `Mon DD`; other year → `Mon DD, YYYY`.
 * `year: 'always'` → always `Mon DD, YYYY`.
 */
export function formatOccurredOnDisplay(
	occurredOn: string,
	today = todayYmd(),
	options: OccurredOnDisplayOptions = {}
): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(occurredOn);
	if (!match) return occurredOn;
	const year = match[1]!;
	const month = Number(match[2]);
	const day = match[3]!;
	if (month < 1 || month > 12) return occurredOn;
	const mon = MONTH_ABBREV[month - 1]!;
	const withYear = `${mon} ${day}, ${year}`;
	if (options.year === 'always') return withYear;
	const todayYear = today.slice(0, 4);
	if (year === todayYear) return `${mon} ${day}`;
	return withYear;
}
