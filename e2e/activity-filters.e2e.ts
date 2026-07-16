import { expect, test } from '@playwright/test';
import { goToNav, openAdd } from './nav';

test.describe('017 activity filters', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('filters by type and searches amount with separators', async ({ page }) => {
		await openAdd(page);
		let dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Income', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('100000');
		await dialog.getByLabel('Category', { exact: true }).selectOption({ label: 'Salary' });
		await dialog.getByRole('button', { name: 'Save' }).click();

		await openAdd(page);
		dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('15000');
		await dialog.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await dialog.getByLabel(/note/i).fill('secret lunch');
		await dialog.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-filters')).toBeVisible();
		await page.getByTestId('activity-filter-type').selectOption('expense');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await page.getByTestId('activity-filter-type').selectOption('all');
		await page.getByTestId('activity-filter-search').fill('100,000');
		await expect(page.getByTestId('activity-list')).toContainText('Salary');
		await expect(page.getByTestId('activity-list')).not.toContainText('Food');

		await page.getByTestId('activity-filter-search').fill('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});
});
