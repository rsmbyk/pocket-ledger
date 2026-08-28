import { expect, test } from '@playwright/test';
import { goToNav, openAdd } from './nav';

test.describe('121 sync conflict', () => {
	test('409 closes the editor', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await expect(page.getByTestId('hex-kit-screen')).toBeVisible();
		await page.getByTestId('hex-kit-stored').check();
		await page.getByTestId('hex-kit-confirm').click();
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();

		await page.route('**/v1/sync/**', async (route) => {
			if (route.request().method() === 'PUT') {
				await route.fulfill({
					status: 409,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'conflict' })
				});
				return;
			}
			await route.continue();
		});

		await openAdd(page);
		await page.getByRole('textbox', { name: 'Amount' }).fill('1000');
		await page.getByTestId('tx-save').click();
		await expect(page.getByTestId('tx-dialog')).toBeHidden();
	});
});
