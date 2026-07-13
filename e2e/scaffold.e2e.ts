import { expect, test } from '@playwright/test';

test.describe('000 scaffold', () => {
	test('shows mobile shell with default account', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Pocket Ledger')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByRole('button', { name: /add transaction/i })).toBeVisible();
	});

	test('theme menu can switch to dark mode', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /theme:/i }).click();
		await page.getByRole('menuitem', { name: 'Dark' }).click();
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('registers a service worker for PWA', async ({ page }) => {
		await page.goto('/');
		await expect.poll(async () => {
			return page.evaluate(async () => {
				if (!('serviceWorker' in navigator)) return false;
				const ready = await navigator.serviceWorker.ready;
				return Boolean(ready.active || ready.installing || ready.waiting);
			});
		}).toBe(true);
	});
});
