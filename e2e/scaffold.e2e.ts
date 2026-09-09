import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('000 scaffold', () => {
	test('shows shell with default account', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('app-drawer-rail').getByText('Pocket Ledger')).toBeVisible();
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await expect(page.getByTestId('theme-cycle')).toBeVisible();
		await expect(page.getByTestId('recent-add')).toBeVisible();
		await expect(page.getByTestId('shell-stage-skeleton')).toHaveCount(0);
	});

	test('startup splash leaves no Starting up copy', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await expect(page.getByText('Starting up')).toHaveCount(0);
		await expect(page.getByText('Preparing your local ledger')).toHaveCount(0);
		await expect(page.getByTestId('startup-loading')).toHaveCount(0);
		await expect(page.getByTestId('shell-stage-skeleton')).toHaveCount(0);
	});

	test('theme cycle can switch to dark mode', async ({ page }) => {
		await page.goto('/');
		const theme = page.getByTestId('theme-cycle');
		// Default preference is System; cycle order is Light → System → Dark.
		await theme.click();
		await expect(theme).toHaveAttribute('aria-label', 'Theme: Dark');
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('ready nav to Settings is instant', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await goToNav(page, 'settings');
		await expect(page.getByTestId('settings-panel')).toBeVisible();
		await expect(page.getByTestId('shell-stage-skeleton')).toHaveCount(0);
	});

	test('registers a service worker for PWA', async ({ page }) => {
		await page.goto('/');
		await expect
			.poll(
				async () => {
					return page.evaluate(async () => {
						if (!('serviceWorker' in navigator)) return false;
						const ready = await navigator.serviceWorker.ready;
						return Boolean(ready.active || ready.installing || ready.waiting);
					});
				},
				{ timeout: 15_000 }
			)
			.toBe(true);
	});
});
