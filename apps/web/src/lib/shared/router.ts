/** Primary shell panels addressable via path URLs. */
export type AppRoute = 'home' | 'transactions' | 'pockets' | 'categories' | 'settings';

const ROUTES: readonly AppRoute[] = ['home', 'transactions', 'pockets', 'categories', 'settings'];

const SHELL_PATHS = new Set(['/transactions', '/pockets', '/categories', '/settings']);

/** Full-screen account / device gates (spec 203). */
export const GATE_PATHS = [
	'/unlock',
	'/onboarding',
	'/onboarding/kit',
	'/recovery',
	'/reset'
] as const;

const GATE_PATH_SET = new Set<string>(GATE_PATHS);

function trimmedPath(pathname: string): string {
	return pathname.replace(/\/+$/, '') || '/';
}

function canonicalForm(path: string): string | null {
	if (path === '/' || path === '/home') return '/';
	if (path === '/activity') return '/transactions';
	if (path === '/more') return '/settings';
	if (SHELL_PATHS.has(path) || GATE_PATH_SET.has(path)) return path;
	if (/^\/pockets\/[^/]+$/.test(path)) return path;
	return null;
}

/**
 * Walk up `pathname` until a canonical route (or `/pockets/:id`) matches.
 * Aliases collapse: `/home` → `/`, `/activity` → `/transactions`, `/more` → `/settings`.
 */
export function nearestValidPath(pathname: string): string {
	let current = trimmedPath(pathname);
	while (true) {
		const canonical = canonicalForm(current);
		if (canonical) return canonical;
		if (current === '/') return '/';
		const cut = current.lastIndexOf('/');
		current = cut <= 0 ? '/' : current.slice(0, cut);
	}
}

export function isGatePath(pathname: string): boolean {
	return GATE_PATH_SET.has(nearestValidPath(pathname));
}

/**
 * Pocket id from `/pockets/:id` (after nearest-parent walking).
 * Null on the list or other routes.
 */
export function parsePocketId(pathname: string): string | null {
	const nearest = nearestValidPath(pathname);
	const match = /^\/pockets\/([^/]+)$/.exec(nearest);
	if (!match?.[1]) return null;
	try {
		return decodeURIComponent(match[1]);
	} catch {
		return match[1];
	}
}

/** Pathname for a pocket details view. */
export function pocketDetailsPath(id: string): string {
	return `/pockets/${encodeURIComponent(id)}`;
}

/**
 * Parse a URL pathname into an app route. Unknown paths walk to the nearest parent (204).
 * `/activity` is an alias for Transactions (spec 134).
 * `/more` is an alias for Settings (spec 154).
 * `/pockets/:id` stays on the Pockets panel (spec 148).
 */
export function parsePath(pathname: string): AppRoute {
	const nearest = nearestValidPath(pathname);
	if (nearest === '/') return 'home';
	if (nearest === '/transactions') return 'transactions';
	if (nearest === '/pockets' || nearest.startsWith('/pockets/')) return 'pockets';
	if (nearest === '/categories') return 'categories';
	if (nearest === '/settings') return 'settings';
	return 'home';
}

/** Pathname for a route (`/` for home). */
export function routeToPath(route: AppRoute): string {
	return route === 'home' ? '/' : `/${route}`;
}

export function isAppRoute(value: string): value is AppRoute {
	return (ROUTES as readonly string[]).includes(value);
}

/** True when the address bar still uses the retired Activity path. */
export function isLegacyActivityPath(pathname: string): boolean {
	return trimmedPath(pathname) === '/activity';
}

/** True when the address bar still uses the retired More path. */
export function isLegacyMorePath(pathname: string): boolean {
	return trimmedPath(pathname) === '/more';
}
