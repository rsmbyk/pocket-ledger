import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd } from './nav';

test.describe('011 field encryption', () => {
	test('unlocked UI still shows plaintext notes after enabling lock', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByLabel(/note/i).fill('secret lunch');
		await sheet.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'more');
		await page.getByTestId('enable-lock-pass').fill('secret-pass');
		await page.getByPlaceholder('Confirm passphrase').fill('secret-pass');
		await page.getByTestId('enable-lock').click();
		await expect(page.getByTestId('lock-status')).toContainText(/on/i);

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-list')).toContainText('secret lunch');
	});
});
