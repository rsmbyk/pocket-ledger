import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// Cloudflare Pages / Workers static assets serve at site root.
const appBase = '/';

// https://vite.dev/config/
export default defineConfig({
	base: appBase,
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
				start_url: appBase,
				scope: appBase,
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
				navigateFallback: `${appBase}index.html`,
				navigateFallbackDenylist: [/^\/api\//],
				additionalManifestEntries: [{ url: `${appBase}offline.html`, revision: '1' }]
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
	// VirtualBox shared folders need polling for HMR inside docker-vm.
	server: {
		watch:
			process.env.CHOKIDAR_USEPOLLING === 'true'
				? { usePolling: true, interval: 300 }
				: undefined
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
