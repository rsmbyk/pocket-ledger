import { expect, test } from '@playwright/test';
import { ensureCategory, openAdd, selectTxCategory } from './nav';

test.describe('047 tx sheet polish', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
	});

	test('Void is outlined danger and labels do not open category', async ({ page }) => {
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByRole('textbox', { name: 'Amount' }).fill('15000');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();

		const voidBtn = page.getByTestId('tx-void');
		await expect(voidBtn).toBeVisible();
		await expect(voidBtn).toHaveClass(/border-destructive/);

		const categoryTrigger = page.getByRole('button', { name: 'Category' });
		await page.getByText('Category', { exact: true }).first().click({ force: true });
		await expect(page.getByRole('menuitem', { name: 'Food', exact: true })).toHaveCount(0);
		await categoryTrigger.click();
		await expect(page.getByRole('menuitem', { name: 'Food', exact: true })).toBeVisible();
	});
});
