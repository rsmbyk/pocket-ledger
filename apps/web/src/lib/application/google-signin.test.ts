import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	GSI_CLIENT_SRC,
	disableGoogleAutoSelect,
	gisButtonTheme,
	gisButtonWidth,
	gisRenderButtonOptions,
	mountGoogleSignInButton
} from './google-signin';

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

describe('gisButtonWidth', () => {
	it('uses the host width and falls back when the host has no layout', () => {
		expect(gisButtonWidth(672)).toBe(672);
		expect(gisButtonWidth(336)).toBe(336);
		expect(gisButtonWidth(0)).toBe(400);
		expect(gisButtonWidth(Number.NaN)).toBe(400);
	});
});

describe('gisButtonTheme', () => {
	it('maps light to outline and dark to outline_dark', () => {
		expect(gisButtonTheme('light')).toBe('outline');
		expect(gisButtonTheme('dark')).toBe('outline_dark');
	});
});

describe('gisRenderButtonOptions', () => {
	it('uses shipped knobs, English locale, and host width', () => {
		expect(gisRenderButtonOptions({ colorScheme: 'dark', hostWidth: 672 })).toEqual({
			type: 'standard',
			theme: 'outline_dark',
			size: 'large',
			text: 'signin_with',
			shape: 'rectangular',
			logo_alignment: 'left',
			width: 672,
			locale: 'en'
		});
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
				size: 'large',
				width: 400,
				locale: 'en'
			})
		);
		expect(gis.renderButton).toHaveBeenCalledWith(
			host,
			expect.not.objectContaining({ size: 'medium' })
		);
		expect(gis.prompt).not.toHaveBeenCalled();
	});

	it('loads gsi/client with hl=en and does not reuse a script without it', async () => {
		const { created, doc } = stubDocument(false);
		const gis = stubGis();
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;

		const pending = mountGoogleSignInButton({
			host,
			clientId: 'cid.apps.googleusercontent.com',
			onCredential: vi.fn()
		});
		expect(doc.querySelector).toHaveBeenCalledWith(`script[src="${GSI_CLIENT_SRC}"]`);
		expect(GSI_CLIENT_SRC).toBe('https://accounts.google.com/gsi/client?hl=en');
		expect(created.src).toBe(GSI_CLIENT_SRC);
		created.onload?.();
		await pending;
		expect(gis.renderButton).toHaveBeenCalled();
	});

	it('passes the laid-out host width including over 400', async () => {
		stubDocument(true);
		const gis = stubGis();
		const host = { replaceChildren: vi.fn(), clientWidth: 672 } as unknown as HTMLElement;

		await mountGoogleSignInButton({
			host,
			clientId: 'cid.apps.googleusercontent.com',
			onCredential: vi.fn()
		});

		expect(gis.renderButton).toHaveBeenCalledWith(host, expect.objectContaining({ width: 672 }));
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
			expect.objectContaining({ theme: 'outline_dark', locale: 'en' })
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
