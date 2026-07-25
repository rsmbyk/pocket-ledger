import { expect, test } from '@playwright/test';
import { ensureCategory, openAdd, selectTxCategory } from './nav';

test.describe('002 month charts', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByTestId('month-summary')).toBeVisible();
	});

	test('shows zero totals for an empty month', async ({ page }) => {
		await expect(page.getByTestId('month-income')).toContainText('0');
		await expect(page.getByTestId('month-expense')).toContainText('0');
		await expect(page.getByTestId('month-net')).toContainText('0');
		await expect(page.getByTestId('month-net')).toHaveClass(/text-muted-foreground/);
		await expect(page.getByTestId('month-footer-net')).toHaveClass(/text-muted-foreground/);
		await expect(page.getByTestId('month-opening')).toContainText('0');
		await expect(page.getByTestId('month-ending')).toContainText('0');
		await expect(page.getByTestId('income-category-chart')).toContainText(/no income/i);
		await expect(page.getByTestId('category-chart')).toContainText(/no expenses/i);
	});

	test('updates month totals after income and expense', async ({ page }) => {
		await ensureCategory(page, 'Salary', 'income');
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const incomeDialog = page.getByRole('dialog');
		await incomeDialog.getByRole('button', { name: 'Income', exact: true }).click();
		await incomeDialog.getByLabel(/amount/i).fill('100000');
		await selectTxCategory(page, 'Salary', incomeDialog);
		await incomeDialog.getByRole('button', { name: 'Save' }).click();

		await openAdd(page);
		const expenseDialog = page.getByRole('dialog');
		await expenseDialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await expenseDialog.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', expenseDialog);
		await expenseDialog.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('month-income')).toContainText('100');
		await expect(page.getByTestId('month-expense')).toContainText('15');
		await expect(page.getByTestId('month-net')).toContainText('85');
		await expect(page.getByTestId('month-net')).toHaveClass(/text-emerald-600/);
		await expect(page.getByTestId('month-footer-net')).toHaveClass(/text-emerald-600/);
		await expect(page.getByTestId('income-category-chart')).toContainText('Salary');
		await expect(page.getByTestId('category-chart')).toContainText('Food');
		await expect(page.getByTestId('income-category-chart').getByText('Income', { exact: true })).toBeVisible();
		await expect(page.getByTestId('category-chart').getByText('Expenses', { exact: true })).toBeVisible();
		await expect(page.getByTestId('month-ending')).toContainText('85');
	});

	test('navigates to previous month', async ({ page }) => {
		await page.goto('/#/pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await mainRow.getByTestId('pocket-edit').click();
		const form = page.getByTestId('pocket-form-dialog');
		await expect(form).toBeVisible();
		await page.getByTestId('pocket-opening-enabled').check();
		await page.getByTestId('pocket-asof-input').locator('input[type="date"]').fill('2026-01-01');
		await page.getByTestId('pocket-save').click();
		await expect(form).toBeHidden();

		await page.goto('/');
		await expect(page.getByTestId('month-summary')).toBeVisible();
		const before = await page.getByTestId('month-label').innerText();
		await page.getByRole('button', { name: 'Previous month' }).click();
		await expect(page.getByTestId('month-label')).not.toHaveText(before);
	});
});
