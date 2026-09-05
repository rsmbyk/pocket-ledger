/** Google Identity Services helper (Specs 119, 179, 182, 205, 212). */

export const GSI_CLIENT_SRC = 'https://accounts.google.com/gsi/client';
export const GIS_MAX_BUTTON_WIDTH = 400;

export function gisButtonTheme(colorScheme: 'light' | 'dark'): 'outline' | 'outline_dark' {
	return colorScheme === 'dark' ? 'outline_dark' : 'outline';
}

/** GIS `width` is pixels, max 400 (Spec 212). */
export function gisButtonWidth(hostWidth: number): number {
	if (!Number.isFinite(hostWidth) || hostWidth <= 0) return GIS_MAX_BUTTON_WIDTH;
	return Math.min(GIS_MAX_BUTTON_WIDTH, Math.floor(hostWidth));
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
	onCredential: (credential: string) => void;
}): Promise<void> {
	await loadScript(GSI_CLIENT_SRC);
	const gis = window.google?.accounts.id;
	if (!gis?.initialize || !gis.renderButton) {
		throw new Error('Google Sign-In failed to load');
	}
	gis.initialize({
		client_id: opts.clientId,
		ux_mode: 'popup',
		auto_select: false,
		callback: (res) => opts.onCredential(res.credential)
	});
	disableGoogleAutoSelect();
	opts.host.replaceChildren();
	gis.renderButton(opts.host, {
		type: 'standard',
		theme: gisButtonTheme(opts.colorScheme === 'dark' ? 'dark' : 'light'),
		size: 'large',
		width: gisButtonWidth(opts.host.clientWidth),
		text: 'signin_with'
	});
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
