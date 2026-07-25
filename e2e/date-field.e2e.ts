import { expect, test } from '@playwright/test';
import { openAdd } from './nav';

test.describe('100 DateField mobile picker', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await expect(page.getByTestId('recent-add')).toBeVisible();
	});

	test('tx date field accepts a chosen date on mobile viewport', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		await expect(field).toBeVisible();
		await expect(field).toContainText(/\d{2} \w{3} \d{4}/);

		const native = field.locator('input[type="date"]');
		await expect(native).toBeEnabled();
		await native.fill('2026-01-15');
		await expect(field).toContainText('15 Jan 2026');
	});

	test('date chrome hit target is the native input', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		const native = field.locator('input[type="date"]');

		await expect(native).toHaveClass(/opacity-0/);
		await expect(native).not.toHaveClass(/sr-only/);

		// Center click on the field should hit the overlay input (not a decorative button).
		await field.click();
		await native.fill('2026-03-04');
		await expect(field).toContainText('04 Mar 2026');
	});
});
