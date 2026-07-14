import { expect, test } from '@playwright/test';

test.describe('010 custom categories', () => {
	test('adds a category and shows it in quick-add', async ({ page }) => {
		await page.goto('/#/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await page.getByTestId('category-name-input').fill('Coffee');
		await page.getByTestId('category-add').click();
		await expect(page.getByRole('textbox', { name: 'Rename Coffee' })).toBeVisible();

		await page.getByRole('button', { name: 'Add transaction' }).click();
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await expect(sheet.getByLabel('Category', { exact: true })).toContainText('Coffee');
	});

	test('deep-links to categories tab', async ({ page }) => {
		await page.goto('/#/categories');
		await expect(page.getByRole('tab', { name: 'Categories' })).toHaveAttribute(
			'data-state',
			'active'
		);
	});
});
