import { expect, test } from '@playwright/test';
import { openAdd, selectTxCategory } from './nav';

test.describe('123 overlay catalog / categories list / picker', () => {
	test('virgin catalog lists groups and stock chips without seeding Dexie add controls as names', async ({
		page
	}) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('category-chip').filter({ hasText: /^Salary$/ })).toBeVisible();
		await expect(page.getByTestId('category-chip').filter({ hasText: /^Groceries$/ })).toBeVisible();
		await expect(page.getByTestId('category-group-stock-group:work')).toBeVisible();
		await expect(page.getByTestId('category-group-stock-group:home')).toBeVisible();

		const incomeBeforeExpense = await page.evaluate(() => {
			const income = document.querySelector('[data-testid="category-list-income"]');
			const expense = document.querySelector('[data-testid="category-list-expense"]');
			if (!income || !expense) return false;
			return Boolean(income.compareDocumentPosition(expense) & Node.DOCUMENT_POSITION_FOLLOWING);
		});
		expect(incomeBeforeExpense).toBe(true);
	});

	test('deep-links to categories', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('nav-categories')).toHaveAttribute('aria-current', 'page');
	});

	test('adds a custom category from a group chip and shows it in quick-add search', async ({
		page
	}) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await page
			.getByTestId('category-group-stock-group:food-drink')
			.getByTestId('category-add-in-group')
			.click();
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		await expect(page.getByTestId('category-chip').filter({ hasText: /^Warung$/ })).toBeVisible();

		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await selectTxCategory(page, 'Warung', sheet);
		await expect(sheet.getByTestId('tx-category')).toContainText('Warung');
	});

	test('hides a stock category from the picker and can show it again', async ({ page }) => {
		await page.goto('/categories');
		await page.getByTestId('category-edit-mode').click();
		const groceries = page.getByTestId('category-chip').filter({ hasText: /^Groceries$/ });
		await groceries.getByTestId('category-hide').click();

		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await page.getByTestId('category-picker-search').fill('Groceries');
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toHaveCount(0);
		await page.keyboard.press('Escape');

		await page.goto('/categories');
		await page.getByTestId('category-edit-mode').click();
		await page
			.getByTestId('category-chip')
			.filter({ hasText: /^Groceries$/ })
			.getByTestId('category-show')
			.click();
	});

	test('reorder mode shows group names and discard restores factory order', async ({ page }) => {
		await page.goto('/categories');
		await page.getByTestId('category-reorder').click();
		await expect(page.getByTestId('category-reorder-save')).toBeVisible();
		await expect(page.getByTestId('category-reorder-discard')).toBeVisible();
		await expect(page.getByTestId('category-reorder-reset')).toBeVisible();
		await expect(page.getByTestId('category-chip')).toHaveCount(0);
		await expect(page.getByTestId('category-group-row-stock-group:home')).toBeVisible();
		await page.getByTestId('category-reorder-discard').click();
		await expect(page.getByTestId('category-reorder-save')).toBeDisabled();
	});

	test('form picker groups expense categories and filters by search', async ({ page }) => {
		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await expect(page.getByTestId('picker-group-stock-group:food-drink')).toBeVisible();
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toHaveCount(0);
		await page.getByTestId('category-picker-search').fill('groc');
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toBeVisible();
		await expect(page.getByTestId('picker-group-stock-group:home')).toHaveCount(0);
		await page.getByRole('option', { name: 'Groceries', exact: true }).click();
		await expect(sheet.getByTestId('tx-category')).toContainText('Groceries');
	});
});
