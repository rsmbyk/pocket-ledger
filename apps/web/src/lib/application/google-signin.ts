/** Google Identity Services helper (Specs 119, 179, 182, 205, 212, 215, 217, 218). */

export const GSI_CLIENT_SRC = 'https://accounts.google.com/gsi/client?hl=en';
/** Fallback `renderButton` width when the host has no layout yet (Spec 217). */
export const GIS_MAX_BUTTON_WIDTH = 400;
export const GIS_CALLBACK_PATH = '/v1/auth/gis-callback';
export const GIS_NONCE_KEY = 'pl_gis_nonce';

export function gisLoginUri(apiBase: string): string {
	return `${apiBase.replace(/\/$/, '')}${GIS_CALLBACK_PATH}`;
}

/** Android, iOS, Client Hints mobile, or an installed PWA (Spec 218). */
export function gisNeedsRedirectUx(input?: {
	userAgent?: string;
	mobile?: boolean;
	standalone?: boolean;
}): boolean {
	if (input?.standalone === true) return true;
	if (input?.mobile === true) return true;
	if (input?.mobile === false && input.standalone === false) {
		return /Android|iPhone|iPad|iPod/i.test(input.userAgent ?? '');
	}
	if (typeof navigator !== 'undefined') {
		const uaData = (
			navigator as Navigator & { userAgentData?: { mobile?: boolean } }
		).userAgentData;
		if (uaData?.mobile === true) return true;
		const standalone = input?.standalone ?? displayModeStandalone();
		if (standalone) return true;
		const ua = input?.userAgent ?? navigator.userAgent;
		return /Android|iPhone|iPad|iPod/i.test(ua);
	}
	return /Android|iPhone|iPad|iPod/i.test(input?.userAgent ?? '');
}

function displayModeStandalone(): boolean {
	try {
		return Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches);
	} catch {
		return false;
	}
}

export function createGisNonce(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function persistGisNonce(nonce: string, storage: Storage = sessionStorage): void {
	storage.setItem(GIS_NONCE_KEY, nonce);
}

export function takeGisNonce(storage: Storage = sessionStorage): string | null {
	const nonce = storage.getItem(GIS_NONCE_KEY);
	storage.removeItem(GIS_NONCE_KEY);
	return nonce;
}

export function jwtNonce(jwt: string): string | null {
	const part = jwt.split('.')[1];
	if (!part) return null;
	try {
		const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
		const pad = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
		const payload = JSON.parse(atob(pad)) as { nonce?: unknown };
		return typeof payload.nonce === 'string' && payload.nonce.length > 0 ? payload.nonce : null;
	} catch {
		return null;
	}
}

export type GisRedirectHash =
	| { kind: 'credential'; credential: string }
	| { kind: 'error' }
	| { kind: 'none' };

export function consumeGisRedirectHash(
	hash: string,
	deps?: { expectedNonce?: string | null; strip?: () => void }
): GisRedirectHash {
	const raw = hash.startsWith('#') ? hash.slice(1) : hash;
	const params = new URLSearchParams(raw);
	if (params.has('pl_gis_error')) {
		deps?.strip?.();
		return { kind: 'error' };
	}
	const credential = params.get('pl_gis');
	if (!credential) return { kind: 'none' };
	deps?.strip?.();
	if (!deps?.expectedNonce || jwtNonce(credential) !== deps.expectedNonce) {
		return { kind: 'error' };
	}
	return { kind: 'credential', credential };
}

export function gisButtonTheme(colorScheme: 'light' | 'dark'): 'outline' | 'outline_dark' {
	return colorScheme === 'dark' ? 'outline_dark' : 'outline';
}

/** GIS `width` is the host’s laid-out pixels (Spec 217). */
export function gisButtonWidth(hostWidth: number): number {
	if (!Number.isFinite(hostWidth) || hostWidth <= 0) return GIS_MAX_BUTTON_WIDTH;
	return Math.floor(hostWidth);
}

/** Shipped knobs: 182 theme, 217 host width, 215 locale. */
export function gisRenderButtonOptions(opts: {
	colorScheme: 'light' | 'dark';
	hostWidth: number;
}): Record<string, string | number> {
	return {
		type: 'standard',
		theme: gisButtonTheme(opts.colorScheme),
		size: 'large',
		text: 'signin_with',
		shape: 'rectangular',
		logo_alignment: 'left',
		width: gisButtonWidth(opts.hostWidth),
		locale: 'en'
	};
}

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (opts: {
						client_id: string;
						callback: (res: { credential: string }) => void;
						ux_mode?: 'popup' | 'redirect';
						login_uri?: string;
						nonce?: string;
						auto_select?: boolean;
					}) => void;
					renderButton: (parent: HTMLElement, opts: Record<string, string | number>) => void;
					prompt: () => void;
					disableAutoSelect: () => void;
				};
			};
		};
	}
}

/** Stop GIS from personalizing the button to "Sign in as Name" (205). */
export function disableGoogleAutoSelect(): void {
	window.google?.accounts.id.disableAutoSelect?.();
}

export async function mountGoogleSignInButton(opts: {
	host: HTMLElement;
	clientId: string;
	colorScheme?: 'light' | 'dark';
	apiBase?: string;
	redirectUx?: boolean;
	nonce?: string;
	persistNonce?: (nonce: string) => void;
	onCredential: (credential: string) => void;
}): Promise<void> {
	await loadScript(GSI_CLIENT_SRC);
	const gis = window.google?.accounts.id;
	if (!gis?.initialize || !gis.renderButton) {
		throw new Error('Google Sign-In failed to load');
	}
	const redirect = opts.redirectUx ?? gisNeedsRedirectUx();
	const apiBase = (opts.apiBase ?? '').trim();
	if (redirect && !apiBase) {
		throw new Error('Google Sign-In redirect is not configured');
	}
	const nonce = redirect ? (opts.nonce ?? createGisNonce()) : undefined;
	if (redirect && nonce) {
		(opts.persistNonce ?? persistGisNonce)(nonce);
	}
	gis.initialize({
		client_id: opts.clientId,
		ux_mode: redirect ? 'redirect' : 'popup',
		auto_select: false,
		...(redirect && apiBase ? { login_uri: gisLoginUri(apiBase), nonce } : {}),
		callback: (res) => opts.onCredential(res.credential)
	});
	disableGoogleAutoSelect();
	opts.host.replaceChildren();
	gis.renderButton(
		opts.host,
		gisRenderButtonOptions({
			colorScheme: opts.colorScheme === 'dark' ? 'dark' : 'light',
			hostWidth: opts.host.clientWidth
		})
	);
}

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve();
			return;
		}
		const el = document.createElement('script');
		el.src = src;
		el.async = true;
		el.onload = () => resolve();
		el.onerror = () => reject(new Error('Could not load Google Sign-In'));
		document.head.appendChild(el);
	});
}
