import { expect, test } from '@playwright/test';

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
		await expect(page.getByTestId('cashflow-chart')).toBeVisible();
		await expect(page.getByTestId('category-chart')).toContainText(/no expenses/i);
	});

	test('updates month totals after income and expense', async ({ page }) => {
		await page.getByRole('button', { name: 'Add transaction' }).click();
		await page.getByRole('button', { name: 'Income', exact: true }).click();
		await page.getByLabel(/amount/i).fill('100000');
		await page.getByLabel('Category', { exact: true }).selectOption({ label: 'Salary' });
		await page.getByRole('button', { name: 'Save' }).click();

		await page.getByRole('button', { name: 'Add transaction' }).click();
		await page.getByRole('button', { name: 'Expense', exact: true }).click();
		await page.getByLabel(/amount/i).fill('15000');
		await page.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await page.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('month-income')).toContainText('100');
		await expect(page.getByTestId('month-expense')).toContainText('15');
		await expect(page.getByTestId('month-net')).toContainText('85');
		await expect(page.getByTestId('category-chart')).toContainText('Food');
	});

	test('navigates to previous month', async ({ page }) => {
		const before = await page.getByTestId('month-label').innerText();
		await page.getByRole('button', { name: 'Previous month' }).click();
		await expect(page.getByTestId('month-label')).not.toHaveText(before);
	});
});
