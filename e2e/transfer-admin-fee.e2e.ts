import { expect, test } from '@playwright/test';
import { goToNav, openAdd } from './nav';

test.describe('106 transfer admin fee', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	async function ensureVacationPocket(page: import('@playwright/test').Page) {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
	}

	test('create transfer with fee shows fee chrome and Admin Fee chart', async ({ page }) => {
		await ensureVacationPocket(page);
		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-mode-transfer').click();
		await dialog.getByTestId('tx-transfer-source').click();
		await page.locator('[data-testid^="tx-transfer-source-option-"]').nth(0).click();
		await dialog.getByTestId('tx-transfer-dest').click();
		await page.locator('[data-testid^="tx-transfer-dest-option-"]').nth(1).click();
		await dialog.getByTestId('tx-transfer-amount').fill('10000');
		await expect(dialog.getByTestId('tx-transfer-fee')).toBeVisible();
		await dialog.getByTestId('tx-transfer-fee').fill('250');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });

		const feeLine = page.locator('[data-testid$="-transfer-fee"]').first();
		await expect(feeLine).toBeVisible();
		await expect(feeLine).toContainText(/250/);

		await expect(page.getByTestId('admin-fee-system').first()).toBeVisible();
	});

	test('blank fee stays 1:1 without fee chrome', async ({ page }) => {
		await ensureVacationPocket(page);
		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-mode-transfer').click();
		await dialog.getByTestId('tx-transfer-source').click();
		await page.locator('[data-testid^="tx-transfer-source-option-"]').nth(0).click();
		await dialog.getByTestId('tx-transfer-dest').click();
		await page.locator('[data-testid^="tx-transfer-dest-option-"]').nth(1).click();
		await dialog.getByTestId('tx-transfer-amount').fill('5000');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });
		await expect(page.locator('[data-testid$="-transfer-fee"]')).toHaveCount(0);
	});

	test('Activity Admin Fee filter shows fee transfers', async ({ page }) => {
		await ensureVacationPocket(page);
		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-mode-transfer').click();
		await dialog.getByTestId('tx-transfer-source').click();
		await page.locator('[data-testid^="tx-transfer-source-option-"]').nth(0).click();
		await dialog.getByTestId('tx-transfer-dest').click();
		await page.locator('[data-testid^="tx-transfer-dest-option-"]').nth(1).click();
		await dialog.getByTestId('tx-transfer-amount').fill('8000');
		await dialog.getByTestId('tx-transfer-fee').fill('100');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/#/activity');
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filter-category').selectOption({ label: 'Admin Fee' });
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.locator('[data-testid$="-transfer-fee"]').first()).toBeVisible();
	});
});
