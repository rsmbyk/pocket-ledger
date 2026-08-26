import { defineConfig, devices } from '@playwright/test';

const port = 4173;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		trace: 'on-first-retry'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: [
		{
			command:
				'AUTH_ALLOW_FAKE=1 COOKIE_SECURE=0 WEB_ORIGIN=http://127.0.0.1:4173 PORT=8787 npm run start -w @pocket-ledger/api',
			port: 8787,
			reuseExistingServer: !process.env.CI,
			timeout: 60_000
		},
		{
			command:
				'VITE_API_URL=http://127.0.0.1:8787 VITE_FAKE_GOOGLE=1 npm run build -w @pocket-ledger/web && npm run preview -w @pocket-ledger/web -- --host 127.0.0.1 --port 4173',
			port,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000
		}
	]
});
