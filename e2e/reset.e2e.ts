import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('024 reset everything', () => {
	test('wipes transactions and can keep categories', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();
		await expect(page.getByTestId('account-balance')).toContainText('15');

		await goToNav(page, 'more');
		await page.getByTestId('reset-all').click();
		await expect(page.getByTestId('reset-dialog')).toBeVisible();
		await page.getByTestId('reset-preserve-categories').check();
		await page.getByTestId('reset-all-confirm').click();
		await page.goto('/#/');
		await expect(page.getByTestId('account-balance')).toContainText('0');

		await page.goto('/#/categories');
		await expect(page.getByRole('textbox', { name: 'Name for Food' })).toBeVisible();
	});
});
