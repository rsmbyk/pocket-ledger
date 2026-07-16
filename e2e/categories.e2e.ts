import { expect, test } from '@playwright/test';
import { openAdd } from './nav';

test.describe('010 / 018 custom categories', () => {
	test('adds a category from expense card modal and shows it in quick-add', async ({ page }) => {
		await page.goto('/#/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await page.getByTestId('category-add-expense').click();
		await page.getByTestId('category-name-input').fill('Coffee');
		await page.getByTestId('category-add').click();
		await expect(page.getByRole('textbox', { name: 'Rename Coffee' })).toBeVisible();

		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await expect(sheet.getByLabel('Category', { exact: true })).toContainText('Coffee');
	});

	test('deep-links to categories', async ({ page }) => {
		await page.goto('/#/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('nav-categories')).toHaveAttribute('aria-current', 'page');
	});

	test('021 shows income list before expense list', async ({ page }) => {
		await page.goto('/#/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		const incomeBeforeExpense = await page.evaluate(() => {
			const income = document.querySelector('[data-testid="category-list-income"]');
			const expense = document.querySelector('[data-testid="category-list-expense"]');
			if (!income || !expense) return false;
			return Boolean(income.compareDocumentPosition(expense) & Node.DOCUMENT_POSITION_FOLLOWING);
		});
		expect(incomeBeforeExpense).toBe(true);
	});
});
