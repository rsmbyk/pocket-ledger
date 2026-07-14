import { expect, test } from '@playwright/test';

test.describe('011 field encryption', () => {
	test('unlocked UI still shows plaintext notes after enabling lock', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Add transaction' }).click();
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByLabel(/note/i).fill('secret lunch');
		await sheet.getByRole('button', { name: 'Save' }).click();

		await page.getByRole('tab', { name: 'More' }).click();
		await page.getByTestId('enable-lock-pass').fill('secret-pass');
		await page.getByPlaceholder('Confirm passphrase').fill('secret-pass');
		await page.getByTestId('enable-lock').click();
		await expect(page.getByTestId('lock-status')).toContainText(/on/i);

		await page.getByRole('tab', { name: 'Activity' }).click();
		await expect(page.getByTestId('activity-list')).toContainText('secret lunch');
	});
});
