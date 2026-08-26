/** Google Identity Services helper (Spec 119). */

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (opts: {
						client_id: string;
						callback: (res: { credential: string }) => void;
					}) => void;
					prompt: () => void;
				};
			};
		};
	}
}

export async function promptGoogleIdToken(clientId: string): Promise<string> {
	await loadScript('https://accounts.google.com/gsi/client');
	return new Promise((resolve, reject) => {
		if (!window.google?.accounts.id) {
			reject(new Error('Google Sign-In failed to load'));
			return;
		}
		window.google.accounts.id.initialize({
			client_id: clientId,
			callback: (res) => resolve(res.credential)
		});
		window.google.accounts.id.prompt();
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
