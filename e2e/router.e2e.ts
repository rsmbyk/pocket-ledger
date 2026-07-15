import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('009 router', () => {
	test('nav selection updates the URL hash', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await goToNav(page, 'activity');
		await expect(page).toHaveURL(/#\/activity$/);
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
	});

	test('hash deep-link opens More', async ({ page }) => {
		await page.goto('/#/more');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByTestId('more-panel')).toBeVisible();
	});
});
