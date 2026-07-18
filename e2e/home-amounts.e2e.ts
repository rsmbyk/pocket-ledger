import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

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

	test('show money requires passphrase when lock is on', async ({ page }) => {
		await goToNav(page, 'more');
		await page.getByTestId('enable-lock-pass').fill('secret-pass');
		await page.getByPlaceholder('Confirm passphrase').fill('secret-pass');
		await page.getByTestId('enable-lock').click();
		await expect(page.getByTestId('lock-status')).toContainText(/on/i);

		await goToNav(page, 'home');
		await page.getByTestId('toggle-home-amounts').click();
		await expect(page.getByTestId('account-balance')).toHaveText('••••');
		await page.getByTestId('toggle-home-amounts').click();
		await expect(page.getByTestId('show-money-dialog')).toBeVisible();
		await page.getByTestId('show-money-passphrase').fill('wrong-pass');
		await page.getByTestId('show-money-confirm').click();
		await expect(page.getByTestId('show-money-error')).toBeVisible();
		await expect(page.getByTestId('account-balance')).toHaveText('••••');
		await page.getByTestId('show-money-passphrase').fill('secret-pass');
		await page.getByTestId('show-money-confirm').click();
		await expect(page.getByTestId('show-money-dialog')).toBeHidden();
		await expect(page.getByTestId('account-balance')).not.toHaveText('••••');
	});
});
