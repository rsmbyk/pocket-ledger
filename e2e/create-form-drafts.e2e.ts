import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, openAddCategory, selectTxCategory } from './nav';

test.describe('Create-form draft on discard (104)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await page.evaluate(() => sessionStorage.clear());
	});

	test('tx create: Save draft restores dirty; Discard clears', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-amount').fill('1500');
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('tx-discard-save-draft')).toBeVisible();
		await page.getByTestId('tx-discard-save-draft').click();
		await expect(sheet).toBeHidden();

		await openAdd(page);
		await expect(sheet).toBeVisible();
		await expect(sheet.getByTestId('tx-amount')).toHaveValue(/1,?500/);

		// Restored draft is dirty with no further edits
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await page.getByTestId('tx-discard-confirm').click();
		await expect(sheet).toBeHidden();

		await openAdd(page);
		await expect(sheet.getByTestId('tx-amount')).toHaveValue('');
		await sheet.getByTestId('tx-close').click();
		await expect(sheet).toBeHidden();
	});

	test('tx create: successful save clears draft', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-amount').fill('2200');
		await sheet.getByTestId('tx-close').click();
		await page.getByTestId('tx-discard-save-draft').click();

		await openAdd(page);
		await expect(sheet.getByTestId('tx-amount')).toHaveValue(/2,?200/);
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();
		await expect(sheet).toBeHidden();

		await openAdd(page);
		await expect(sheet.getByTestId('tx-amount')).toHaveValue('');
		await sheet.getByTestId('tx-close').click();
	});

	test('tx edit: discard has no Save draft', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-amount').fill('1100');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();
		await expect(sheet).toBeHidden();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-amount').fill('3300');
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('tx-discard-save-draft')).toHaveCount(0);
		await page.getByTestId('confirm-dialog-cancel').click();
		await sheet.getByTestId('tx-close').click();
		await page.getByTestId('tx-discard-confirm').click();
	});

	test('pocket create: Save draft restores dirty', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await page.getByTestId('pocket-add').click();
		const dialog = page.getByTestId('pocket-form-dialog');
		await expect(dialog).toBeVisible();
		await page.getByTestId('pocket-name-input').fill('Vacation Draft');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('pocket-discard-confirm')).toBeVisible();
		await page.getByTestId('pocket-discard-save-draft').click();
		await expect(dialog).toBeHidden();

		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-name-input')).toHaveValue('Vacation Draft');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('pocket-discard-confirm')).toBeVisible();
		await page.getByTestId('pocket-discard-confirm').click();
		await expect(dialog).toBeHidden();

		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-name-input')).toHaveValue('');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(dialog).toBeHidden();
	});

	test('category create: drafts isolated per kind', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();

		await openAddCategory(page, 'expense');
		await page.getByTestId('category-name-input').fill('Draft Expense');
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-discard-confirm')).toBeVisible();
		await page.getByTestId('category-discard-save-draft').click();

		await openAddCategory(page, 'income');
		await expect(page.getByTestId('category-name-input')).toHaveValue('');
		await page.getByTestId('category-name-input').fill('Draft Income');
		await page.getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('category-discard-save-draft').click();

		await openAddCategory(page, 'expense');
		await expect(page.getByTestId('category-name-input')).toHaveValue('Draft Expense');
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-discard-confirm')).toBeVisible();
		await page.getByTestId('category-discard-confirm').click();

		await openAddCategory(page, 'income');
		await expect(page.getByTestId('category-name-input')).toHaveValue('Draft Income');
		await page.getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('category-discard-confirm').click();
	});
});
