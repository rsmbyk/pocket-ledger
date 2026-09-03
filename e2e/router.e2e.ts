import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('117 path router', () => {
	test('nav selection updates the URL path', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await goToNav(page, 'transactions');
		await expect(page).toHaveURL(/\/transactions\/?$/);
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
	});

	test('legacy /activity replace-navigates to /transactions', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await page.goto('/activity');
		await expect(page).toHaveURL(/\/transactions\/?$/);
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
	});

	test('legacy /more replace-navigates to /settings', async ({ page }) => {
		await page.goto('/more');
		await expect(page).toHaveURL(/\/settings\/?$/);
		await expect(page.getByTestId('settings-panel')).toBeVisible();
	});

	test('unknown path falls back to the home shell', async ({ page }) => {
		await page.goto('/not-a-panel');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});
});
