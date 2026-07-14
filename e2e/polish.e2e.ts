import { expect, test } from '@playwright/test';

test.describe('012 polish', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('empty home offers add CTA', async ({ page }) => {
		await expect(page.getByTestId('home-empty')).toBeVisible();
		await page.getByTestId('home-empty-add').click();
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();
	});

	test('edits and deletes a transaction from activity', async ({ page }) => {
		page.on('dialog', (dialog) => dialog.accept());

		await page.getByLabel('Add transaction').click();
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByTestId('tx-save').click();

		await page.getByRole('tab', { name: 'Activity' }).click();
		await page.getByTestId('activity-list').getByRole('button').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();
		await page.getByLabel(/amount/i).fill('10000');
		await page.getByTestId('tx-save').click();

		await expect(page.getByTestId('account-balance')).toContainText('10');
		await expect(page.getByTestId('activity-list')).toContainText('10');

		await page.getByTestId('activity-list').getByRole('button').first().click();
		await page.getByTestId('tx-delete').click();
		await expect(page.getByTestId('activity-empty')).toBeVisible();
		await expect(page.getByTestId('account-balance')).toContainText('0');
	});
});
