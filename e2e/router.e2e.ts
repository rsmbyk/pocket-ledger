import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('117 path router', () => {
	test('nav selection updates the URL path', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await goToNav(page, 'transactions');
		await expect(page).toHaveURL(/\/transactions\/?$/);
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
	});

	test('legacy /activity replace-navigates to /transactions', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await page.goto('/activity');
		await expect(page).toHaveURL(/\/transactions\/?$/);
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
	});

	test('path deep-link opens More', async ({ page }) => {
		await page.goto('/more');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByTestId('more-panel')).toBeVisible();
	});

	test('unknown path falls back to the home shell', async ({ page }) => {
		await page.goto('/not-a-panel');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});
});
