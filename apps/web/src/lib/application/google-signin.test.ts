import { afterEach, describe, expect, it, vi } from 'vitest';
import { GSI_CLIENT_SRC, mountGoogleSignInButton } from './google-signin';

type GisId = {
	initialize: ReturnType<typeof vi.fn>;
	renderButton: ReturnType<typeof vi.fn>;
	prompt: ReturnType<typeof vi.fn>;
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
		prompt: vi.fn()
	};
	vi.stubGlobal('window', {
		google: { accounts: { id: gis } }
	});
	return gis;
}

describe('mountGoogleSignInButton', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('initializes GIS with popup ux and renderButton, never prompt', async () => {
		stubDocument(true);
		const gis = stubGis();
		const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
		const onCredential = vi.fn();

		await mountGoogleSignInButton({ host, clientId: 'cid.apps.googleusercontent.com', onCredential });

		expect(gis.initialize).toHaveBeenCalledWith(
			expect.objectContaining({
				client_id: 'cid.apps.googleusercontent.com',
				ux_mode: 'popup'
			})
		);
		expect(gis.renderButton).toHaveBeenCalledWith(
			host,
			expect.objectContaining({ type: 'standard', text: 'signin_with' })
		);
		expect(gis.prompt).not.toHaveBeenCalled();
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
});
