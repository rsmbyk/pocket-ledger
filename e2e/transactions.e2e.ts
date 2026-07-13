import { expect, test } from '@playwright/test';

test.describe('001 transactions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('adds expense and updates balance and activity', async ({ page }) => {
		await page.getByRole('button', { name: 'Add transaction' }).click();
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();

		await page.getByRole('button', { name: 'Expense', exact: true }).click();
		await page.getByLabel(/amount/i).fill('15000');
		await page.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await page.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('account-balance')).toContainText('15');
		await expect(page.getByTestId('account-balance')).toContainText('-');

		await page.getByRole('tab', { name: 'Activity' }).click();
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).toContainText('15');
	});

	test('adds income and increases balance', async ({ page }) => {
		await page.getByRole('button', { name: 'Add transaction' }).click();
		await page.getByRole('button', { name: 'Income', exact: true }).click();
		await page.getByLabel(/amount/i).fill('100000');
		await page.getByLabel('Category', { exact: true }).selectOption({ label: 'Salary' });
		await page.getByRole('button', { name: 'Save' }).click();

		await expect(page.getByTestId('account-balance')).toContainText('100');
	});

	test('rejects empty amount', async ({ page }) => {
		await page.getByRole('button', { name: 'Add transaction' }).click();
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.getByRole('alert')).toContainText(/amount/i);
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();
	});
});
