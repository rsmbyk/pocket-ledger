import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav } from './nav';


test.describe('003–008 base features', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('More tab shows backup and privacy', async ({ page }) => {
		await goToNav(page, 'more');
		await expect(page.getByTestId('more-panel')).toBeVisible();
		await expect(page.getByTestId('more-sections')).toBeVisible();
		await expect(page.getByTestId('export-backup')).toBeVisible();
		await expect(page.getByTestId('reset-all')).toBeVisible();
		await expect(page.getByTestId('lock-status')).toContainText(/off/i);
	});

	test('export downloads a JSON backup', async ({ page }) => {
		await goToNav(page, 'more');
		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('export-backup').click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/pocket-ledger-.*\.json/);
	});

	test('creates a goal with deadline', async ({ page }) => {
		await goToNav(page, 'more');
		const more = page.getByTestId('more-section-goals');
		await more.getByPlaceholder('Name').fill('Emergency');
		await more.getByPlaceholder('Target amount').fill('1000000');
		await more.locator('input[type="date"]').fill('2026-12-31');
		await more.getByRole('button', { name: 'Add goal' }).click();
		await expect(page.getByTestId('goals-list')).toContainText('Emergency');
		await expect(page.getByTestId('more-section-backup')).toBeVisible();
		await expect(page.getByTestId('more-section-privacy')).toBeVisible();
		await expect(page.getByTestId('capture-net-worth')).toHaveCount(0);
	});

	test('enables passphrase lock and requires unlock', async ({ page }) => {
		await goToNav(page, 'more');
		await page.getByTestId('enable-lock-pass').fill('secret-pass');
		await page.getByPlaceholder('Confirm passphrase').fill('secret-pass');
		await page.getByTestId('enable-lock').click();
		await expect(page.getByTestId('lock-status')).toContainText(/on/i);

		await page.reload();
		await expect(page.getByTestId('unlock-screen')).toBeVisible();
		await page.getByTestId('unlock-passphrase').fill('secret-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('adds a recurring rule', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await goToNav(page, 'more');
		await page.getByRole('textbox', { name: 'Amount', exact: true }).fill('50000');
		await page.getByRole('button', { name: 'Add rule' }).click();
		await expect(page.getByTestId('recurring-list')).toContainText(/monthly/i);
		await expect(page.getByTestId('recurring-list')).toContainText(/50/);
	});
});
