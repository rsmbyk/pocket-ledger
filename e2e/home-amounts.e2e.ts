import { expect, test } from '@playwright/test';
import { ensureCategory, openAdd, selectTxCategory } from './nav';

test.describe('048 home amount hide + by-category icons', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByRole('textbox', { name: 'Amount' }).fill('15000');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByTestId('tx-save').click();
	});

	test('hides signs and colors; persists across reload', async ({ page }) => {
		await expect(page.getByTestId('account-balance')).not.toContainText('••••');
		await page.getByTestId('toggle-home-amounts').click();
		await expect(page.getByTestId('account-balance')).toHaveText('••••');

		const recentAmount = page
			.getByTestId('recent-list')
			.locator('[data-testid^="recent-row-"]')
			.first()
			.locator('p.tabular-nums');
		await expect(recentAmount).toHaveText('••••');
		await expect(recentAmount).not.toContainText('+');
		await expect(recentAmount).not.toContainText('−');
		await expect(recentAmount).toHaveClass(/text-muted-foreground/);

		await page.reload();
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await expect(page.getByTestId('account-balance')).toHaveText('••••');
	});

	test('by-category titles have icons; sum tiles do not', async ({ page }) => {
		await expect(page.getByTestId('month-income').locator('svg')).toHaveCount(0);
		await expect(page.getByTestId('month-expense').locator('svg')).toHaveCount(0);
		await expect(page.getByTestId('income-category-chart').locator('p').first().locator('svg')).toHaveCount(
			1
		);
		await expect(page.getByTestId('category-chart').locator('p').first().locator('svg')).toHaveCount(1);
	});
});
