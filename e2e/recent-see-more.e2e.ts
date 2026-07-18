import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('066 recent see more', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('shows control when empty and navigates to Activity', async ({ page }) => {
		await expect(page.getByTestId('recent-empty')).toBeVisible();
		await expect(page.getByTestId('recent-see-more')).toHaveText('See more in Activity');
		await page.getByTestId('recent-see-more').click();
		await expect(page.getByTestId('activity-panel')).toBeVisible();
	});

	test('shows control when Recent has rows', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'home');
		await expect(page.getByTestId('recent-list')).toBeVisible();
		await expect(page.getByTestId('recent-see-more')).toBeVisible();
		await page.getByTestId('recent-see-more').click();
		await expect(page.getByTestId('activity-panel')).toBeVisible();
	});
});
