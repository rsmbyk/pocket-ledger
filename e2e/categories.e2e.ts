import { expect, test } from '@playwright/test';
import { confirmVoid, ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('010 / 018 / 022 custom categories', () => {
	test('adds a category from expense card modal and shows it in quick-add', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await page.getByTestId('category-add-expense').click();
		await page.getByTestId('category-name-input').fill('Coffee');
		await page.getByTestId('category-add').click();
		await expect(page.getByRole('textbox', { name: 'Name for Coffee' })).toBeVisible();
		await expect(page.getByTestId('category-save-name').first()).toBeDisabled();
		await expect(page.getByTestId('category-add-expense')).toHaveAttribute(
			'aria-label',
			'Add expense category'
		);

		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await expect(page.getByRole('menuitem', { name: 'Coffee', exact: true })).toBeVisible();
	});

	test('deep-links to categories', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('nav-categories')).toHaveAttribute('aria-current', 'page');
	});

	test('021 shows income list before expense list', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		const incomeBeforeExpense = await page.evaluate(() => {
			const income = document.querySelector('[data-testid="category-list-income"]');
			const expense = document.querySelector('[data-testid="category-list-expense"]');
			if (!income || !expense) return false;
			return Boolean(income.compareDocumentPosition(expense) & Node.DOCUMENT_POSITION_FOLLOWING);
		});
		expect(incomeBeforeExpense).toBe(true);
	});

	test('050 delete is outlined danger', async ({ page }) => {
		await page.goto('/categories');
		await page.getByTestId('category-add-expense').click();
		await page.getByTestId('category-name-input').fill('Snack');
		await page.getByTestId('category-add').click();
		await expect(page.getByRole('textbox', { name: 'Name for Snack' })).toBeVisible();
		const del = page.getByTestId('category-delete').first();
		await expect(del).toHaveClass(/border-destructive/);
		await expect(del).toHaveClass(/text-destructive/);
	});

	test('056 warns when category is in use; 057 danger chrome on unused delete', async ({ page }) => {
		await page.goto('/');
		await ensureCategory(page, 'Coffee', 'expense');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('5000');
		await selectTxCategory(page, 'Coffee', sheet);
		await sheet.getByRole('button', { name: 'Save' }).click();

		await page.goto('/categories');
		const coffeeRow = page.locator('li', { has: page.getByRole('textbox', { name: 'Name for Coffee' }) });
		await coffeeRow.getByTestId('category-delete').click();
		await expect(page.getByTestId('category-in-use-dialog')).toBeVisible();
		await expect(page.getByTestId('confirm-dialog-danger-header')).toHaveCount(0);
		await page.getByTestId('category-in-use-dismiss').click();
		await expect(page.getByRole('textbox', { name: 'Name for Coffee' })).toBeVisible();

		await page.getByTestId('category-add-expense').click();
		await page.getByTestId('category-name-input').fill('UnusedCat');
		await page.getByTestId('category-add').click();
		await expect(page.getByRole('textbox', { name: 'Name for UnusedCat' })).toBeVisible();
		const unusedRow = page.locator('li', {
			has: page.getByRole('textbox', { name: 'Name for UnusedCat' })
		});
		await unusedRow.getByTestId('category-delete').click();
		await expect(page.getByTestId('confirm-dialog-danger-header')).toBeVisible();
		await page.getByTestId('category-delete-confirm').click();
		await expect(page.getByRole('textbox', { name: 'Name for UnusedCat' })).toHaveCount(0);
	});

	test('103 soft-deletes category used only by voided transactions', async ({ page }) => {
		await page.goto('/');
		await ensureCategory(page, 'VoidOnly', 'expense');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('2500');
		await selectTxCategory(page, 'VoidOnly', sheet);
		await sheet.getByRole('button', { name: 'Save' }).click();
		await expect(page.getByTestId('recent-list')).toContainText('VoidOnly');

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		const editSheet = page.getByRole('dialog');
		await editSheet.getByRole('button', { name: 'Void' }).click();
		await confirmVoid(page);
		await expect(page.getByTestId('tx-dialog')).toBeHidden();

		await goToNav(page, 'categories');
		const row = page.locator('li', {
			has: page.getByRole('textbox', { name: 'Name for VoidOnly' })
		});
		await row.getByTestId('category-delete').click();
		await expect(page.getByTestId('confirm-dialog-danger-header')).toBeVisible();
		await page.getByTestId('category-delete-confirm').click();
		await expect(page.getByRole('textbox', { name: 'Name for VoidOnly' })).toHaveCount(0);

		await goToNav(page, 'home');
		await expect(
			page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first()
		).toContainText('VoidOnly');
	});
});
