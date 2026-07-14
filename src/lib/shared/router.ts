/** Primary shell panels addressable via location hash. */
export type AppRoute = 'home' | 'activity' | 'categories' | 'more';

const ROUTES: readonly AppRoute[] = ['home', 'activity', 'categories', 'more'];

/**
 * Parse `location.hash` into an app route. Unknown paths fall back to home.
 */
export function parseHash(hash: string): AppRoute {
	const raw = hash.replace(/^#\/?/, '').split(/[?#]/)[0] ?? '';
	const path = raw.replace(/\/+$/, '');
	if (!path || path === 'home') return 'home';
	if ((ROUTES as readonly string[]).includes(path)) {
		return path as AppRoute;
	}
	return 'home';
}

/** Hash fragment for a route (`#/` for home). */
export function routeToHash(route: AppRoute): string {
	return route === 'home' ? '#/' : `#/${route}`;
}

export function isAppRoute(value: string): value is AppRoute {
	return (ROUTES as readonly string[]).includes(value);
}
