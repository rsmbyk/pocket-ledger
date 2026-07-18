import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('070–077 pockets pack', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('nav includes Pockets between Activity and Categories', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page).toHaveURL(/#\/pockets$/);
		await goToNav(page, 'categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
	});

	test('Main shows icon; create pocket; rename Main; no Main delete', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page.getByTestId('pocket-main-icon')).toBeVisible();

		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await expect(mainRow.getByTestId('pocket-delete')).toHaveCount(0);

		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-save')).toBeDisabled();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await expect(page.getByTestId('pocket-save')).toBeEnabled();
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
		await expect(page.getByTestId('pockets-panel').getByText('Vacation')).toBeVisible();

		await mainRow.getByTestId('pocket-edit').click();
		await expect(page.getByTestId('pocket-save')).toBeDisabled();
		await page.getByTestId('pocket-name-input').fill('Household');
		await expect(page.getByTestId('pocket-save')).toBeEnabled();
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
		await expect(mainRow.getByText('Household')).toBeVisible();
		await expect(page.getByTestId('pocket-main-icon')).toBeVisible();
	});

	test('Transfer tab with two pockets creates transfer', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();

		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByTestId('tx-mode-tabs')).toBeVisible();
		await dialog.getByTestId('tx-mode-transfer').click();
		await dialog.getByTestId('tx-transfer-source').click();
		await expect(page.locator('[data-testid^="tx-transfer-source-option-"]')).toHaveCount(2);
		await page.keyboard.press('Escape');
		await dialog.getByTestId('tx-transfer-source').click();
		const sourceOptions = page.locator('[data-testid^="tx-transfer-source-option-"]');
		await sourceOptions.nth(0).click();
		await dialog.getByTestId('tx-transfer-dest').click();
		await page.locator('[data-testid^="tx-transfer-dest-option-"]').nth(0).click();
		await expect(dialog.getByTestId('tx-transfer-same-pocket-warn')).toBeVisible();
		await dialog.getByTestId('tx-transfer-dest').click();
		await page.locator('[data-testid^="tx-transfer-dest-option-"]').nth(1).click();
		await expect(dialog.getByTestId('tx-transfer-same-pocket-warn')).toHaveCount(0);
		await dialog.getByLabel(/amount/i).fill('10000');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });
		await expect(page.getByTestId('recent-list')).toContainText('Transfer');
		await expect(page.locator('[data-testid$="-transfer-icon"]').first()).toBeVisible();
	});

	test('Normal add shows pocket picker; inline amount error', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();

		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByTestId('tx-pocket')).toBeVisible();
		await dialog.getByTestId('tx-amount').fill('0');
		await dialog.getByTestId('tx-save').click();
		await expect(dialog.getByTestId('tx-field-error-amount')).toBeVisible();
		await expect(dialog).toBeVisible();
	});

	test('Dirty dismiss keeps sheet and shows discard', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-amount').fill('1500');
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(sheet).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeHidden();
		await expect(sheet).toBeVisible();
		await expect(sheet.getByTestId('tx-amount')).toHaveValue(/1,?500/);

		await sheet.getByTestId('tx-amount').fill('2500');
		await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 8, y: 8 } });
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(sheet).toBeVisible();
	});

	test('Recent shows pocket under amount', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('1200');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(
			page.locator('[data-testid^="recent-row-"][data-testid$="-pocket"]').or(
				page.locator('[data-testid^="recent-row-"] >> [data-testid$="-pocket"]')
			).first()
		).toBeVisible({ timeout: 10_000 });
	});

	test('Activity pocket filter Apply', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/#/pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		await page.goto('/#/activity');
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filter-pocket').click();
		const vacationOption = page.locator('[data-testid^="activity-filter-pocket-option-"]').nth(1);
		await vacationOption.click();
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.getByTestId('activity-filters-badge')).toBeVisible();
	});
});
