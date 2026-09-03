/** Primary shell panels addressable via path URLs. */
export type AppRoute = 'home' | 'transactions' | 'pockets' | 'categories' | 'settings';

const ROUTES: readonly AppRoute[] = ['home', 'transactions', 'pockets', 'categories', 'settings'];

/**
 * Pocket id from `/pockets/:id`. Null on the list, extra segments, or other routes.
 */
export function parsePocketId(pathname: string): string | null {
	const trimmed = pathname.replace(/\/+$/, '') || '/';
	const match = /^\/pockets\/([^/]+)$/.exec(trimmed);
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
 * Parse a URL pathname into an app route. Unknown paths fall back to home.
 * `/activity` is an alias for Transactions (spec 134).
 * `/more` is an alias for Settings (spec 154).
 * `/pockets/:id` stays on the Pockets panel (spec 148).
 */
export function parsePath(pathname: string): AppRoute {
	const trimmed = pathname.replace(/\/+$/, '') || '/';
	if (trimmed === '/' || trimmed === '/home') return 'home';
	if (trimmed === '/activity') return 'transactions';
	if (trimmed === '/more') return 'settings';
	if (parsePocketId(trimmed)) return 'pockets';
	const name = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
	if (!name.includes('/') && (ROUTES as readonly string[]).includes(name)) {
		return name as AppRoute;
	}
	return 'home';
}

/** Pathname for a route (`/` for home). */
export function routeToPath(route: AppRoute): string {
	return route === 'home' ? '/' : `/${route}`;
}

export function isAppRoute(value: string): value is AppRoute {
	return (ROUTES as readonly string[]).includes(value);
}

function trimmedPath(pathname: string): string {
	return pathname.replace(/\/+$/, '') || '/';
}

/** True when the address bar still uses the retired Activity path. */
export function isLegacyActivityPath(pathname: string): boolean {
	return trimmedPath(pathname) === '/activity';
}

/** True when the address bar still uses the retired More path. */
export function isLegacyMorePath(pathname: string): boolean {
	return trimmedPath(pathname) === '/more';
}
