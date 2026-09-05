import { expect, test } from '@playwright/test';
import {
	categoryChip,
	clickCategoryGroupAdd,
	ensureCategory,
	goToNav,
	openAdd,
	openAddCategory,
	openPocketEditFromList,
	selectCategoriesKind,
	selectTxCategory
} from './nav';

test.describe('Create-form draft on discard (104 / 184)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await page.evaluate(() => sessionStorage.clear());
	});

	test('tx create: Save draft restores dirty; Discard clears', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-amount').fill('1500');
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('tx-discard-save-draft')).toBeVisible();
		await page.getByTestId('tx-discard-save-draft').click();
		await expect(sheet).toBeHidden();

		await openAdd(page);
		await expect(sheet).toBeVisible();
		await expect(sheet.getByTestId('tx-amount')).toHaveValue(/1,?500/);

		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await page.getByTestId('tx-discard-confirm').click();
		await expect(sheet).toBeHidden();

		await openAdd(page);
		await expect(sheet.getByTestId('tx-amount')).toHaveValue('');
		await sheet.getByTestId('tx-close').click();
		await expect(sheet).toBeHidden();
	});

	test('196 type tabs are not dirty', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();
		await goToNav(page, 'home');
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-mode-transfer').click();
		await sheet.getByTestId('tx-type-income').click();
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toHaveCount(0);
		await expect(sheet).toBeHidden();
	});

	test('tx create: successful save clears draft', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-amount').fill('2200');
		await sheet.getByTestId('tx-close').click();
		await page.getByTestId('tx-discard-save-draft').click();

		await openAdd(page);
		await expect(sheet.getByTestId('tx-amount')).toHaveValue(/2,?200/);
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();
		await expect(sheet).toBeHidden();

		await openAdd(page);
		await expect(sheet.getByTestId('tx-amount')).toHaveValue('');
		await sheet.getByTestId('tx-close').click();
	});

	test('tx edit: discard has no Save draft', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-amount').fill('1100');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();
		await expect(sheet).toBeHidden();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-amount').fill('3300');
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('tx-discard-save-draft')).toHaveCount(0);
		await page.getByTestId('confirm-dialog-cancel').click();
		await sheet.getByTestId('tx-close').click();
		await page.getByTestId('tx-discard-confirm').click();
	});

	test('pocket create: two-button discard; no restore', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await page.getByTestId('pocket-add').click();
		const dialog = page.getByTestId('pocket-form-dialog');
		await expect(dialog).toBeVisible();
		await page.getByTestId('pocket-name-input').fill('Vacation Draft');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('pocket-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('pocket-discard-save-draft')).toHaveCount(0);
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('pocket-name-input')).toHaveValue('Vacation Draft');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('pocket-discard-confirm').click();
		await expect(dialog).toBeHidden();

		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-name-input')).toHaveValue('');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(dialog).toBeHidden();
	});

	test('pocket edit: dirty leave warns', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Trip');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		const trip = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Trip' });
		await openPocketEditFromList(page, trip);
		const dialog = page.getByTestId('pocket-form-dialog');
		await page.getByTestId('pocket-name-input').fill('Trip fund');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('pocket-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('pocket-discard-save-draft')).toHaveCount(0);
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('pocket-name-input')).toHaveValue('Trip fund');
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('pocket-discard-confirm').click();
		await expect(dialog).toBeHidden();
	});

	test('category create: two-button discard; no restore', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await openAddCategory(page, 'expense');
		await page.getByTestId('category-name-input').fill('Draft Expense');
		await page.getByTestId('category-add-dialog').getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('category-discard-save-draft')).toHaveCount(0);
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('category-discard-confirm')).toHaveCount(0);
		await expect(page.getByTestId('category-name-input')).toHaveValue('Draft Expense');
		await page.getByTestId('category-add-dialog').getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('category-discard-confirm').click();
		await expect(page.getByTestId('category-add-dialog')).toBeHidden();

		await openAddCategory(page, 'expense');
		await expect(page.getByTestId('category-name-input')).toHaveValue('');
		await page.getByTestId('category-add-dialog').getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-add-dialog')).toBeHidden();
	});

	test('category add group and rename warn without Save draft', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-add-group').click();
		await page.getByTestId('category-group-name-input').fill('Side hustle');
		await page.getByTestId('category-add-group-dialog').getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-add-group-discard-confirm')).toBeVisible();
		await expect(page.getByTestId('category-discard-save-draft')).toHaveCount(0);
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('category-add-group-discard-confirm')).toHaveCount(0);
		await expect(page.getByTestId('category-group-name-input')).toHaveValue('Side hustle');
		await page.getByTestId('category-group-add').click();
		await expect(page.getByTestId('category-add-group-dialog')).toBeHidden();

		const custom = page
			.locator('[data-testid^="category-group-"]')
			.filter({ has: page.getByTestId('category-group-name').filter({ hasText: /^Side hustle$/ }) });
		await custom.locator('[data-slot=card-header]').hover();
		await custom.getByTestId('category-group-edit').click();
		await expect(page.getByTestId('category-rename-group-dialog')).toBeVisible();
		await page.getByTestId('category-rename-group-name-input').fill('Gig work');
		await page.getByTestId('category-rename-group-dialog').getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-rename-group-discard-confirm')).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('category-rename-group-discard-confirm')).toHaveCount(0);
		await expect(page.getByTestId('category-rename-group-name-input')).toHaveValue('Gig work');
		await page.getByTestId('category-rename-group-dialog').getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('category-rename-group-discard-confirm').click();
		await expect(page.getByTestId('category-rename-group-dialog')).toBeHidden();
	});

	test('category rename: dirty leave warns', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await clickCategoryGroupAdd(page.getByTestId('category-group-stock-group:food-drink'));
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		const warung = categoryChip(page, 'Warung');
		await warung.hover();
		await warung.getByTestId('category-edit-name').click();
		await page.getByTestId('category-rename-name-input').fill('Warung kopi');
		await page.getByTestId('category-rename-dialog').getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('category-rename-discard-confirm')).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('category-rename-discard-confirm')).toHaveCount(0);
		await expect(page.getByTestId('category-rename-name-input')).toHaveValue('Warung kopi');
		await page.getByTestId('category-rename-dialog').getByRole('button', { name: 'Cancel' }).click();
		await page.getByTestId('category-rename-discard-confirm').click();
		await expect(page.getByTestId('category-rename-dialog')).toBeHidden();
	});
});
