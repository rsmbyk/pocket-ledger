import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('013 desktop layout', () => {
	test('wide viewport uses app rail, page title, and dialog add', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();

		await expect(page.getByTestId('app-drawer-rail')).toBeVisible();
		await expect(page.getByTestId('open-menu')).toBeVisible();
		await expect(page.getByTestId('page-title')).toHaveText('Home');
		await expect(page.getByTestId('balance-hero')).toBeVisible();
		await expect(page.getByTestId('month-summary')).toBeVisible();
		await expect(page.getByTestId('recent-card')).toBeVisible();
		await expect(page.getByTestId('nav-home')).toHaveAttribute('aria-current', 'page');
		await expect(page.getByTestId('toolbar-add')).toHaveCount(0);
		await expect(page.getByTestId('open-command')).toHaveCount(0);
		await expect(page.getByTestId('stage-context')).toHaveCount(0);

		await openAdd(page);
		await expect(page.getByTestId('tx-dialog')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();
	});

	test('narrow viewport uses overlay drawer and bottom sheet', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await expect(page.getByTestId('page-title')).toHaveText('Home');
		await expect(page.getByTestId('app-shell')).toBeVisible();

		await expect(page.getByTestId('app-drawer-rail')).toBeHidden();
		await expect(page.getByTestId('open-menu')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Add transaction' })).toHaveCount(0);

		await openAdd(page);
		await expect(page.getByTestId('tx-sheet')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('tx-sheet')).toBeHidden();

		await page.getByTestId('open-menu').click();
		await expect(page.getByTestId('app-drawer-sheet')).toBeVisible();
		await expect(page.getByTestId('app-drawer-sheet').getByRole('heading', { name: 'Main' })).toBeVisible();
		await page.getByTestId('nav-activity').click();
		await expect(page).toHaveURL(/#\/activity$/);
		await expect(page.getByTestId('app-drawer-sheet')).toBeHidden();
		await expect(page.getByTestId('page-title')).toHaveText('Activity');
	});

	test('drawer shows app icon and flat nav without add', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		const rail = page.getByTestId('app-drawer-rail');
		await expect(rail.locator('img[src="/favicon.svg"]')).toBeVisible();
		await expect(rail.getByText('Pocket Ledger')).toBeVisible();
		await expect(rail.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(rail.getByText('Menu', { exact: true })).toBeHidden();
		await expect(rail.getByTestId('nav-add')).toHaveCount(0);
	});

	test('mobile drawer sheet matches flat nav rules', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await page.getByTestId('open-menu').click();

		const sheet = page.getByTestId('app-drawer-sheet');
		await expect(sheet).toBeVisible();
		await expect(sheet.locator('img[src="/favicon.svg"]')).toBeVisible();
		await expect(sheet.getByText('Menu', { exact: true })).toBeHidden();
		await expect(sheet.getByTestId('nav-add')).toHaveCount(0);
	});

	test('desktop categories split into two columns', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await goToNav(page, 'categories');
		await expect(page.getByTestId('page-title')).toHaveText('Categories');
		await expect(page.getByTestId('categories-desktop-grid')).toBeVisible();
		await expect(page.getByTestId('category-list-expense')).toBeVisible();
		await expect(page.getByTestId('category-list-income')).toBeVisible();
	});

	test('command palette navigates and opens add', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();

		await page.keyboard.press('Control+K');
		await expect(page.getByTestId('command-palette')).toBeVisible();
		await page.getByTestId('cmd-activity').click();
		await expect(page).toHaveURL(/#\/activity$/);
		await expect(page.getByTestId('page-title')).toHaveText('Activity');

		await page.keyboard.press('Control+K');
		await expect(page.getByTestId('command-palette')).toBeVisible();
		await page.getByTestId('cmd-add').click();
		await expect(page.getByTestId('tx-dialog')).toBeVisible();
	});

	test('activity uses a table', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByTestId('tx-dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByTestId('tx-save').click();

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-list').getByRole('columnheader', { name: 'Date' })).toBeVisible();
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});
});
