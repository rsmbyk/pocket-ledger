import { afterEach, describe, expect, it, vi } from 'vitest';

describe('cloudConfigured', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it('is false when the API URL is missing', async () => {
		vi.stubEnv('VITE_API_URL', '');
		vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '123.apps.googleusercontent.com');
		vi.stubEnv('VITE_FAKE_GOOGLE', '');
		const { cloudConfigured } = await import('./cloud-api');
		expect(cloudConfigured()).toBe(false);
	});

	it('is false with only an API URL (no fake Google, no client id)', async () => {
		vi.stubEnv('VITE_API_URL', 'https://pocket-ledger-api-w6fanfnuqa-uc.a.run.app');
		vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
		vi.stubEnv('VITE_FAKE_GOOGLE', '');
		const { cloudConfigured } = await import('./cloud-api');
		expect(cloudConfigured()).toBe(false);
	});

	it('is true with API URL and a Google client id', async () => {
		vi.stubEnv('VITE_API_URL', 'https://pocket-ledger-api-w6fanfnuqa-uc.a.run.app');
		vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '123.apps.googleusercontent.com');
		vi.stubEnv('VITE_FAKE_GOOGLE', '');
		const { cloudConfigured } = await import('./cloud-api');
		expect(cloudConfigured()).toBe(true);
	});

	it('is true with API URL and fake Google', async () => {
		vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:8787');
		vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
		vi.stubEnv('VITE_FAKE_GOOGLE', '1');
		const { cloudConfigured } = await import('./cloud-api');
		expect(cloudConfigured()).toBe(true);
	});
});
