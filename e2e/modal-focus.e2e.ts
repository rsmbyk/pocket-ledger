import { expect, test } from '@playwright/test';
import {
	categoryChip,
	ensureCategory,
	goToNav,
	openAdd,
	openAddCategory,
	selectCategoriesKind,
	selectTxCategory
} from './nav';

test.describe('103 modal first-input autofocus', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('Add transaction focuses Amount', async ({ page }) => {
		await openAdd(page);
		const amount = page.getByTestId('tx-amount');
		await expect(amount).toBeVisible();
		await expect(amount).toBeFocused();
	});

	test('Add category focuses name', async ({ page }) => {
		await goToNav(page, 'categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await openAddCategory(page, 'expense');
		await expect(page.getByTestId('category-name-input')).toBeFocused();
	});

	test('Rename category focuses name', async ({ page }) => {
		await goToNav(page, 'categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await selectCategoriesKind(page, 'expense');
		await openAddCategory(page, 'expense');
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		const warung = categoryChip(page, 'Warung');
		await warung.hover();
		await warung.getByTestId('category-edit-name').click();
		await expect(page.getByTestId('category-rename-name-input')).toBeFocused();
	});

	test('Add pocket focuses name', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeVisible();
		await expect(page.getByTestId('pocket-name-input')).toBeFocused();
	});

	test('ConfirmDialog without text fields keeps focus inside confirm', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const form = page.locator('[data-testid="tx-dialog"], [data-testid="tx-sheet"]');
		await form.getByTestId('tx-type-expense').click();
		await form.getByTestId('tx-amount').fill('15000');
		await selectTxCategory(page, 'Food', form);
		await form.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(form).toBeVisible();
		await form.getByTestId('tx-void').click();

		const confirm = page.getByTestId('confirm-dialog');
		await expect(confirm).toBeVisible();
		const focusedInConfirm = confirm.locator(':focus');
		await expect(focusedInConfirm).toHaveCount(1);
		await expect(page.getByTestId('tx-amount')).not.toBeFocused();
	});

	test('Filters sheet does not autofocus Type select', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/transactions');
		await expect(page.getByTestId('activity-panel')).toBeVisible();
		await page.getByTestId('activity-filters-open').click();
		const sheet = page.getByTestId('activity-filters-sheet');
		await expect(sheet).toBeVisible();
		await expect(page.getByTestId('activity-filter-type')).not.toBeFocused();
		await expect(sheet).toBeFocused();
	});
});
