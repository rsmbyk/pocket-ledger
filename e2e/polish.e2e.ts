import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd } from './nav';

test.describe('012 polish / 014 void / 030', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
	});

	test('empty home shows designed empty without CTA', async ({ page }) => {
		await expect(page.getByTestId('recent-empty')).toBeVisible();
		await expect(page.getByTestId('recent-empty').getByRole('button')).toHaveCount(0);
		await expect(page.getByTestId('recent-add')).toBeVisible();
	});

	test('edits and voids a transaction from activity', async ({ page }) => {
		page.on('dialog', (dialog) => dialog.accept());

		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByTestId('tx-save').click();

		await goToNav(page, 'activity');
		await expect(page.getByTestId('balance-compact')).toHaveCount(0);
		await page.getByTestId('activity-list').locator('[data-testid^="activity-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();
		await page.getByLabel(/amount/i).fill('10000');
		await page.getByTestId('tx-save').click();

		await goToNav(page, 'home');
		await expect(page.getByTestId('account-balance')).toContainText('10');

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-list')).toContainText('10');
		await page.getByTestId('activity-list').locator('[data-testid^="activity-row-"]').first().click();
		await page.getByTestId('tx-void').click();
		await expect(page.getByTestId('activity-list')).not.toContainText(/^Void$/);
		await expect(page.getByTestId('activity-empty')).toHaveCount(0);
		await expect(page.getByTestId('activity-list').locator('[data-testid^="activity-row-"]').first()).toHaveClass(
			/opacity-70/
		);

		await goToNav(page, 'home');
		await expect(page.getByTestId('account-balance')).toContainText('0');
	});

	test('recent row opens edit', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();
	});

	test('voided transaction opens read-only', async ({ page }) => {
		page.on('dialog', (dialog) => dialog.accept());
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await sheet.getByLabel('Category', { exact: true }).selectOption({ label: 'Food' });
		await sheet.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await page.getByTestId('tx-void').click();
		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Voided transaction' })).toBeVisible();
		await expect(page.getByTestId('tx-save')).toHaveCount(0);
		await expect(page.getByTestId('tx-void')).toHaveCount(0);
	});
});
