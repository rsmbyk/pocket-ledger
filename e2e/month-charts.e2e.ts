import { expect, test } from '@playwright/test';
import { openAdd } from './nav';

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
		await expect(page.getByTestId('month-opening')).toContainText('0');
		await expect(page.getByTestId('month-ending')).toContainText('0');
		await expect(page.getByTestId('income-category-chart')).toContainText(/no income/i);
		await expect(page.getByTestId('category-chart')).toContainText(/no expenses/i);
	});

	test('updates month totals after income and expense', async ({ page }) => {
		await openAdd(page);
		const incomeDialog = page.getByRole('dialog');
		await incomeDialog.getByRole('button', { name: 'Income', exact: true }).click();
		await incomeDialog.getByLabel(/amount/i).fill('100000');
		await incomeDialog.getByLabel('Category', { exact: true }).selectOption({ label: 'Salary' });
		await incomeDialog.getByRole('button', { name: 'Save' }).click();

		await openAdd(page);
		const expenseDialog = page.getByRole('dialog');
		await expenseDialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await expenseDialog.getByLabel(/amount/i).fill('15000');
		await expenseDialog.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await expenseDialog.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('month-income')).toContainText('100');
		await expect(page.getByTestId('month-expense')).toContainText('15');
		await expect(page.getByTestId('month-net')).toContainText('85');
		await expect(page.getByTestId('income-category-chart')).toContainText('Salary');
		await expect(page.getByTestId('category-chart')).toContainText('Food');
		await expect(page.getByTestId('month-ending')).toContainText('85');
	});

	test('navigates to previous month', async ({ page }) => {
		const before = await page.getByTestId('month-label').innerText();
		await page.getByRole('button', { name: 'Previous month' }).click();
		await expect(page.getByTestId('month-label')).not.toHaveText(before);
	});
});
