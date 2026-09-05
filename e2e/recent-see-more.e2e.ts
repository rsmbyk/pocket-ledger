import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('066 recent see more', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('hides control when empty (194)', async ({ page }) => {
		await expect(page.getByTestId('recent-empty')).toBeVisible();
		await expect(page.getByTestId('recent-see-more')).toHaveCount(0);
	});

	test('shows control when Recent has rows', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-type-expense').click();
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
