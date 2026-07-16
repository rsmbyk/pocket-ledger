import { expect, test } from '@playwright/test';
import { goToNav, openAdd } from './nav';

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

		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByTestId('tx-save').click();

		await goToNav(page, 'activity');
		await page.getByTestId('activity-list').locator('[data-testid^="activity-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();
		await page.getByLabel(/amount/i).fill('10000');
		await page.getByTestId('tx-save').click();

		await expect(page.getByTestId('account-balance')).toContainText('10');
		await expect(page.getByTestId('activity-list')).toContainText('10');

		await page.getByTestId('activity-list').locator('[data-testid^="activity-row-"]').first().click();
		await page.getByTestId('tx-delete').click();
		await expect(page.getByTestId('activity-empty')).toBeVisible();
		await expect(page.getByTestId('account-balance')).toContainText('0');
	});

	test('recent row opens edit', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();
	});
});
