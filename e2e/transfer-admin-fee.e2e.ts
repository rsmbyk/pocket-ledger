import { expect, test } from '@playwright/test';
import { confirmVoid, ensureCategory, goToNav, openAdd, selectActivityFilterCategory, selectTxCategory } from './nav';

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

	async function createFeeTransfer(
		page: import('@playwright/test').Page,
		amount: string,
		fee: string
	) {
		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-mode-transfer').click();
		await dialog.getByTestId('tx-transfer-source').click();
		await page.locator('[data-testid^="tx-transfer-source-option-"]').nth(0).click();
		await dialog.getByTestId('tx-transfer-dest').click();
		await page.locator('[data-testid^="tx-transfer-dest-option-"]').nth(1).click();
		await dialog.getByTestId('tx-transfer-amount').fill(amount);
		if (fee) await dialog.getByTestId('tx-transfer-fee').fill(fee);
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });
	}

	test('create transfer with fee shows fee chrome and Admin Fee chart', async ({ page }) => {
		await ensureVacationPocket(page);
		await createFeeTransfer(page, '10000', '250');

		const feeLine = page.locator('[data-testid$="-transfer-fee"]').first();
		await expect(feeLine).toBeVisible();
		await expect(feeLine).toContainText(/250/);

		await expect(page.getByTestId('admin-fee-system').first()).toBeVisible();
	});

	test('blank fee stays 1:1 without fee chrome', async ({ page }) => {
		await ensureVacationPocket(page);
		await createFeeTransfer(page, '5000', '');
		await expect(page.locator('[data-testid$="-transfer-fee"]')).toHaveCount(0);
	});

	test('Activity Admin Fee filter shows fee transfers', async ({ page }) => {
		await ensureVacationPocket(page);
		await ensureCategory(page, 'Salary', 'income');
		await openAdd(page);
		const form = page.getByRole('dialog');
		await form.getByTestId('tx-type-income').click();
		await form.getByRole('textbox', { name: 'Amount' }).fill('1000');
		await selectTxCategory(page, 'Salary', form);
		await form.getByRole('button', { name: 'Save' }).click();
		await expect(form).toBeHidden({ timeout: 10_000 });
		await createFeeTransfer(page, '8000', '100');

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/transactions');
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
		await page.getByTestId('activity-filters-open').click();
		await selectActivityFilterCategory(page, 'Admin Fee');
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.locator('[data-testid$="-transfer-fee"]').first()).toBeVisible();
	});

	test('edit fee updates row and chart; void clears Admin Fee', async ({ page }) => {
		await ensureVacationPocket(page);
		await createFeeTransfer(page, '10000', '250');
		await expect(page.locator('[data-testid$="-transfer-fee"]').first()).toContainText(/250/);
		await expect(page.getByTestId('admin-fee-system').first()).toBeVisible();

		await page.locator('[data-testid^="recent-row-"]').first().click();
		const edit = page.getByTestId('tx-dialog');
		await expect(edit.getByTestId('tx-transfer-fee')).toBeVisible();
		await edit.getByTestId('tx-transfer-fee').fill('100');
		await edit.getByTestId('tx-save').click();
		await expect(edit).toBeHidden({ timeout: 10_000 });
		await expect(page.locator('[data-testid$="-transfer-fee"]').first()).toContainText(/100/);

		await page.locator('[data-testid^="recent-row-"]').first().click();
		await page.getByTestId('tx-void').click();
		await confirmVoid(page);
		await expect(page.getByTestId('admin-fee-system')).toHaveCount(0);
		await expect(page.locator('[data-testid^="recent-row-"]').first()).toHaveClass(/opacity-70/);
		await expect(page.locator('[data-testid$="-transfer-fee"]').first()).toBeVisible();
	});

	test('expense fee books Admin Fee; income has no Fee field', async ({ page }) => {
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-type-expense').click();
		await expect(dialog.getByTestId('tx-expense-fee')).toBeVisible();
		await dialog.getByTestId('tx-amount').fill('15000');
		await dialog.getByTestId('tx-expense-fee').fill('250');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });
		await expect(page.getByText(/Fee\s.*250/).first()).toBeVisible();
		await expect(page.getByTestId('admin-fee-system').first()).toBeVisible();

		await openAdd(page);
		const again = page.getByRole('dialog');
		await again.getByTestId('tx-type-income').click();
		await expect(again.getByTestId('tx-expense-fee')).toHaveCount(0);
		await again.getByTestId('tx-close').click();
	});

	test('Categories panel has no Admin Fee row; Normal picker excludes it', async ({ page }) => {
		await goToNav(page, 'categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('categories-panel').getByText('Admin Fee')).toHaveCount(0);

		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-type-expense').click();
		await dialog.getByTestId('tx-category').click();
		await expect(page.getByRole('menuitem', { name: 'Admin Fee' })).toHaveCount(0);
		await page.keyboard.press('Escape');
	});
});
