/** Google Identity Services helper (Specs 119, 179, 182). */

export const GSI_CLIENT_SRC = 'https://accounts.google.com/gsi/client';

export function gisButtonTheme(colorScheme: 'light' | 'dark'): 'outline' | 'outline_dark' {
	return colorScheme === 'dark' ? 'outline_dark' : 'outline';
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
					}) => void;
					renderButton: (parent: HTMLElement, opts: Record<string, string | number>) => void;
					prompt: () => void;
				};
			};
		};
	}
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
		callback: (res) => opts.onCredential(res.credential)
	});
	opts.host.replaceChildren();
	gis.renderButton(opts.host, {
		type: 'standard',
		theme: gisButtonTheme(opts.colorScheme === 'dark' ? 'dark' : 'light'),
		size: 'large',
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
