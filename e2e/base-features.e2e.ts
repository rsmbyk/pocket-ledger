import { expect, test } from '@playwright/test';
import { goToNav } from './nav';


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
		await expect(page.getByTestId('more-section-recurring')).toHaveCount(0);
	});

	test('export downloads a JSON backup', async ({ page }) => {
		await goToNav(page, 'more');
		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('export-backup').click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/pocket-ledger-.*\.json/);
	});

	test('creates a pocket goal with target', async ({ page }) => {
		await goToNav(page, 'pockets');
		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await mainRow.getByTestId('pocket-edit').click();
		await page.getByTestId('pocket-goal-enabled').check();
		await page.getByTestId('pocket-goal-target-input').fill('1000000');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
		await expect(mainRow).toContainText(/%|1,?000,?000/);
		await goToNav(page, 'more');
		await expect(page.getByTestId('more-section-backup')).toBeVisible();
		await expect(page.getByTestId('more-section-privacy')).toBeVisible();
		await expect(page.getByTestId('more-section-goals')).toHaveCount(0);
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
});
