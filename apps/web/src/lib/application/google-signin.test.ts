import { afterEach, describe, expect, it, vi } from 'vitest';
import { GSI_CLIENT_SRC, clickGoogleSignInButton, disableGoogleAutoSelect, gisButtonTheme, mountGoogleSignInButton } from './google-signin';

type GisId = {
	initialize: ReturnType<typeof vi.fn>;
	renderButton: ReturnType<typeof vi.fn>;
	prompt: ReturnType<typeof vi.fn>;
	disableAutoSelect: ReturnType<typeof vi.fn>;
};

function stubDocument(existingScript: boolean) {
	const created: { src?: string; async?: boolean; onload?: () => void; onerror?: () => void } =
		{};
	const doc = {
		querySelector: vi.fn((sel: string) => {
			if (sel === `script[src="${GSI_CLIENT_SRC}"]` && existingScript) return {};
			return null;
		}),
		createElement: vi.fn(() => created),
		head: { appendChild: vi.fn() }
	};
	vi.stubGlobal('document', doc);
	return { doc, created };
}

function stubGis(): GisId {
	const gis: GisId = {
		initialize: vi.fn(),
		renderButton: vi.fn(),
		prompt: vi.fn(),
		disableAutoSelect: vi.fn()
	};
	vi.stubGlobal('window', {
		google: { accounts: { id: gis } }
	});
	return gis;
}

describe('gisButtonTheme', () => {
	it('maps light to outline and dark to outline_dark', () => {
		expect(gisButtonTheme('light')).toBe('outline');
		expect(gisButtonTheme('dark')).toBe('outline_dark');
	});
});

describe('mountGoogleSignInButton', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('initializes GIS with popup ux and renderButton, never prompt', async () => {
		stubDocument(true);
		const gis = stubGis();
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
		const onCredential = vi.fn();

		await mountGoogleSignInButton({
			host,
			clientId: 'cid.apps.googleusercontent.com',
			colorScheme: 'light',
			onCredential
		});

		expect(gis.initialize).toHaveBeenCalledWith(
			expect.objectContaining({
				client_id: 'cid.apps.googleusercontent.com',
				ux_mode: 'popup',
				auto_select: false
			})
		);
		expect(gis.disableAutoSelect).toHaveBeenCalled();
		expect(gis.disableAutoSelect.mock.invocationCallOrder[0]).toBeLessThan(
			gis.renderButton.mock.invocationCallOrder[0]!
		);
		expect(gis.renderButton).toHaveBeenCalledWith(
			host,
			expect.objectContaining({
				type: 'standard',
				text: 'signin_with',
				theme: 'outline',
				size: 'medium'
			})
		);
		expect(gis.renderButton).toHaveBeenCalledWith(
			host,
			expect.not.objectContaining({ size: 'large' })
		);
		expect(gis.prompt).not.toHaveBeenCalled();
	});

	it('renders outline_dark when the color scheme is dark', async () => {
		stubDocument(true);
		const gis = stubGis();
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;

		await mountGoogleSignInButton({
			host,
			clientId: 'cid.apps.googleusercontent.com',
			colorScheme: 'dark',
			onCredential: vi.fn()
		});

		expect(gis.renderButton).toHaveBeenCalledWith(
			host,
			expect.objectContaining({ theme: 'outline_dark' })
		);
	});

	it('forwards the GIS credential JWT to onCredential', async () => {
		stubDocument(true);
		const gis = stubGis();
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
		const onCredential = vi.fn();

		await mountGoogleSignInButton({ host, clientId: 'cid.apps.googleusercontent.com', onCredential });
		const initOpts = gis.initialize.mock.calls[0]?.[0] as {
			callback: (res: { credential: string }) => void;
		};
		initOpts.callback({ credential: 'jwt-from-gis' });
		expect(onCredential).toHaveBeenCalledWith('jwt-from-gis');
	});

	it('rejects when google.accounts.id is missing', async () => {
		stubDocument(true);
		vi.stubGlobal('window', {});
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;

		await expect(
			mountGoogleSignInButton({
				host,
				clientId: 'cid.apps.googleusercontent.com',
				onCredential: vi.fn()
			})
		).rejects.toThrow(/failed to load/i);
	});

	it('rejects when the GIS script fails to load', async () => {
		const { created, doc } = stubDocument(false);
		vi.stubGlobal('window', {});
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;

		const pending = mountGoogleSignInButton({
			host,
			clientId: 'cid.apps.googleusercontent.com',
			onCredential: vi.fn()
		});
		expect(doc.createElement).toHaveBeenCalled();
		created.onerror?.();
		await expect(pending).rejects.toThrow(/could not load google sign-in/i);
	});

	it('disableGoogleAutoSelect noops when GIS is missing', () => {
		vi.stubGlobal('window', {});
		expect(() => disableGoogleAutoSelect()).not.toThrow();
	});

	it('disableGoogleAutoSelect calls GIS when loaded', () => {
		const gis = stubGis();
		disableGoogleAutoSelect();
		expect(gis.disableAutoSelect).toHaveBeenCalled();
	});
});

describe('clickGoogleSignInButton', () => {
	it('clicks the GIS role=button inside the host', () => {
		const clicked = vi.fn();
		const inner = { click: clicked };
		const host = {
			querySelector: (sel: string) => (sel === 'div[role="button"]' ? inner : null)
		} as unknown as HTMLElement;
		clickGoogleSignInButton(host);
		expect(clicked).toHaveBeenCalled();
	});

	it('falls back to overlay then iframe', () => {
		const overlayClick = vi.fn();
		const overlay = { click: overlayClick };
		const host = {
			querySelector: (sel: string) => (sel === '[id$="-overlay"]' ? overlay : null)
		} as unknown as HTMLElement;
		clickGoogleSignInButton(host);
		expect(overlayClick).toHaveBeenCalled();

		const iframeClick = vi.fn();
		const iframe = { click: iframeClick };
		const iframeHost = {
			querySelector: (sel: string) => (sel === 'iframe' ? iframe : null)
		} as unknown as HTMLElement;
		clickGoogleSignInButton(iframeHost);
		expect(iframeClick).toHaveBeenCalled();
	});

	it('throws when GIS has not rendered a click target', () => {
		const host = { querySelector: () => null } as unknown as HTMLElement;
		expect(() => clickGoogleSignInButton(host)).toThrow(/not ready/i);
	});
});
