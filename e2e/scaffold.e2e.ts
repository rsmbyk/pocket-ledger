import { expect, test } from '@playwright/test';

test.describe('000 scaffold', () => {
	test('shows shell with default account', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('app-drawer-rail').getByText('Pocket Ledger')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByTestId('theme-cycle')).toBeVisible();
		await expect(page.getByTestId('recent-add')).toBeVisible();
	});

	test('theme cycle can switch to dark mode', async ({ page }) => {
		await page.goto('/');
		const theme = page.getByTestId('theme-cycle');
		// Default preference is System; cycle order is Light → System → Dark.
		await theme.click();
		await expect(theme).toHaveAttribute('aria-label', 'Theme: Dark');
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('registers a service worker for PWA', async ({ page }) => {
		await page.goto('/');
		await expect
			.poll(async () => {
				return page.evaluate(async () => {
					if (!('serviceWorker' in navigator)) return false;
					const ready = await navigator.serviceWorker.ready;
					return Boolean(ready.active || ready.installing || ready.waiting);
				});
			})
			.toBe(true);
	});
});
