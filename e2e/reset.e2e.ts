import { expect, test } from '@playwright/test';
import { categoryChip, ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('024 reset everything', () => {
	test('wipes transactions and custom categories; keep settings stays', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await ensureCategory(page, 'Warung', 'expense');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Warung', sheet);
		await sheet.getByTestId('tx-save').click();
		await expect(page.getByTestId('account-balance')).toContainText('15');

		await goToNav(page, 'more');
		await page.getByTestId('reset-all').click();
		await expect(page.getByTestId('reset-dialog')).toBeVisible();
		await page.getByTestId('reset-preserve-settings').check();
		await page.getByTestId('reset-all-confirm').click();
		await expect(page.getByTestId('reset-dialog')).toBeHidden();
		await page.goto('/');
		await expect(page.getByTestId('account-balance')).toContainText('0');

		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await page.getByTestId('category-kind-expense').click();
		await expect(categoryChip(page, 'Warung')).toHaveCount(0);
	});
});
