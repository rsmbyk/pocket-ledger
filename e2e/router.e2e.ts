import { expect, test } from '@playwright/test';

test.describe('009 router', () => {
	test('tab selection updates the URL hash', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await page.getByRole('tab', { name: 'Activity' }).click();
		await expect(page).toHaveURL(/#\/activity$/);
		await expect(page.getByTestId('activity-list').or(page.getByText(/No transactions/i))).toBeVisible();
	});

	test('hash deep-link opens More', async ({ page }) => {
		await page.goto('/#/more');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByTestId('more-panel')).toBeVisible();
	});
});
