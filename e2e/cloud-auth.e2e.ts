import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('119 cloud onboarding', () => {
	test('signed-out users are not forced through Google', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await goToNav(page, 'more');
		await expect(page.getByTestId('google-sign-in')).toBeVisible();
		await goToNav(page, 'home');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('privacy explains encryption without a nested skip card', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await expect(page.getByTestId('device-skip-warning')).toHaveCount(0);
		await expect(page.getByTestId('settings-section-privacy')).toContainText(
			/anyone with this browser/i
		);
	});

	test('new account cannot skip the hex kit', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await expect(page.getByTestId('hex-kit-screen')).toBeVisible();
		await expect(page.getByTestId('hex-kit-confirm')).toBeDisabled();
		await page.getByTestId('hex-kit-stored').check();
		await page.getByTestId('hex-kit-confirm').click();
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await expect(page.getByTestId('export-backup')).toHaveCount(0);
	});

	test('debug reset stay signed in returns to passphrase without GIS', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await page.getByTestId('hex-kit-stored').check();
		await page.getByTestId('hex-kit-confirm').click();
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await page.getByTestId('debug-reset-cloud-stay').click();
		await page.getByTestId('debug-reset-cloud-stay-confirm').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await expect(page.getByTestId('google-sign-in')).toHaveCount(0);
	});

	test('debug reset and sign out shows Sign in again', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await page.getByTestId('hex-kit-stored').check();
		await page.getByTestId('hex-kit-confirm').click();
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await page.getByTestId('debug-reset-cloud-sign-out').click();
		await page.getByTestId('debug-reset-cloud-sign-out-confirm').click();
		await page.goto('/settings');
		await expect(page.getByTestId('google-sign-in')).toBeVisible();
	});
});
