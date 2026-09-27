import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('254 unlock screen keyboard flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await goToNav(page, 'more');
		await page.getByTestId('enable-lock-pass').fill('secret-pass');
		await page.getByPlaceholder('Confirm passphrase').fill('secret-pass');
		await page.getByTestId('enable-lock').click();
		await expect(page.getByTestId('lock-status')).toContainText(/on/i);
	});

	test('passphrase field is focused on load and Enter unlocks', async ({ page }) => {
		await page.reload();
		await expect(page.getByTestId('unlock-screen')).toBeVisible();
		await expect(page.getByTestId('unlock-passphrase')).toBeFocused();

		await page.keyboard.type('secret-pass');
		await page.keyboard.press('Enter');

		await expect(page.getByTestId('app-shell')).toBeVisible();
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('autofill that fires no input event still unlocks with Enter', async ({ page }) => {
		await page.reload();
		await expect(page.getByTestId('unlock-screen')).toBeVisible();
		await expect(page.getByTestId('unlock-passphrase')).toBeFocused();

		// Simulate a password manager writing the value without dispatching
		// `input`/`change` — bound state would stay empty.
		await page
			.getByTestId('unlock-passphrase')
			.evaluate((el: HTMLInputElement) => void (el.value = 'secret-pass'));

		await page.keyboard.press('Enter');

		await expect(page.getByTestId('app-shell')).toBeVisible();
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('Enter on an empty field does nothing', async ({ page }) => {
		await page.reload();
		await expect(page.getByTestId('unlock-screen')).toBeVisible();
		await expect(page.getByTestId('unlock-passphrase')).toBeFocused();

		await page.keyboard.press('Enter');

		await expect(page.getByTestId('unlock-screen')).toBeVisible();
		await expect(page.getByTestId('unlock-field-error-passphrase')).toHaveCount(0);
	});
});
