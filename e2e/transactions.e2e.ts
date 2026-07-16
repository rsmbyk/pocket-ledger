import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('001 transactions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('adds expense and updates balance and activity', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();

		await page.getByRole('button', { name: 'Expense', exact: true }).click();
		await page.getByRole('textbox', { name: 'Amount' }).fill('15000');
		await selectTxCategory(page, 'Food');
		await page.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('account-balance')).toContainText('15');
		await expect(page.getByTestId('account-balance')).toContainText('-');

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).toContainText('15');
	});

	test('adds income and increases balance', async ({ page }) => {
		await ensureCategory(page, 'Salary', 'income');
		await openAdd(page);
		await page.getByRole('button', { name: 'Income', exact: true }).click();
		await page.getByRole('textbox', { name: 'Amount' }).fill('100000');
		await selectTxCategory(page, 'Salary');
		await page.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('account-balance')).toContainText('100');
	});

	test('disables Save when amount is empty', async ({ page }) => {
		await openAdd(page);
		await expect(page.getByTestId('tx-save')).toBeDisabled();
		await expect(page.getByTestId('tx-occurred-on')).toContainText(/\d{2} \w{3} \d{4}/);
	});
});
