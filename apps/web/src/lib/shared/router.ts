/** Primary shell panels addressable via path URLs. */
export type AppRoute = 'home' | 'transactions' | 'pockets' | 'categories' | 'more';

const ROUTES: readonly AppRoute[] = ['home', 'transactions', 'pockets', 'categories', 'more'];

/**
 * Parse a URL pathname into an app route. Unknown paths fall back to home.
 * `/activity` is an alias for Transactions (spec 134).
 */
export function parsePath(pathname: string): AppRoute {
	const trimmed = pathname.replace(/\/+$/, '') || '/';
	if (trimmed === '/' || trimmed === '/home') return 'home';
	if (trimmed === '/activity') return 'transactions';
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

/** True when the address bar still uses the retired Activity path. */
export function isLegacyActivityPath(pathname: string): boolean {
	const trimmed = pathname.replace(/\/+$/, '') || '/';
	return trimmed === '/activity';
}
