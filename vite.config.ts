import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages project site is served under /pocket-ledger/.
// Local preview and CI e2e use root base unless GITHUB_PAGES=true.
const repoBase = process.env.GITHUB_PAGES === 'true' ? '/pocket-ledger/' : '/';

// https://vite.dev/config/
export default defineConfig({
	base: repoBase,
	plugins: [
		tailwindcss(),
		svelte(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg', 'offline.html', 'icons/*.png'],
			manifest: {
				name: 'Pocket Ledger',
				short_name: 'Pocket Ledger',
				description: 'Offline-first personal finance tracker',
				theme_color: '#0a0a0a',
				background_color: '#0a0a0a',
				display: 'standalone',
				start_url: repoBase,
				scope: repoBase,
				icons: [
					{
						src: 'icons/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icons/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'icons/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
				navigateFallback: `${repoBase}index.html`,
				navigateFallbackDenylist: [/^\/api\//],
				additionalManifestEntries: [{ url: `${repoBase}offline.html`, revision: '1' }]
			},
			devOptions: {
				enabled: true
			}
		})
	],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
