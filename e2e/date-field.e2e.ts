import { expect, test } from '@playwright/test';
import { openAdd } from './nav';

test.describe('100 DateField mobile picker', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
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

	test('clicking the visible date chrome focuses the native input', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		const native = field.locator('input[type="date"]');

		// Tap the left side of the field (display area), not a trailing control.
		const box = await field.boundingBox();
		expect(box).toBeTruthy();
		await page.mouse.click(box!.x + 24, box!.y + box!.height / 2);
		await expect(native).toBeFocused();
	});
});
