import { expect, test } from '@playwright/test';
import { goToNav } from './nav';

test.describe('154–159 Settings hub', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('Settings nav, card order, and /more alias', async ({ page }) => {
		await goToNav(page, 'settings');
		await expect(page).toHaveURL(/\/settings\/?$/);
		await expect(page.getByTestId('page-title')).toHaveText('Settings');
		await expect(page.getByTestId('settings-panel')).toBeVisible();
		const sections = page.locator('[data-testid^="settings-section-"]');
		await expect(sections).toHaveCount(6);
		await expect(sections.nth(0)).toHaveAttribute('data-testid', 'settings-section-cloud');
		await expect(sections.nth(1)).toHaveAttribute('data-testid', 'settings-section-currency');
		await expect(sections.nth(2)).toHaveAttribute('data-testid', 'settings-section-idle');
		await expect(sections.nth(3)).toHaveAttribute('data-testid', 'settings-section-privacy');
		await expect(sections.nth(4)).toHaveAttribute('data-testid', 'settings-section-backup');
		await expect(sections.nth(5)).toHaveAttribute('data-testid', 'settings-section-reset');

		await page.goto('/more');
		await expect(page).toHaveURL(/\/settings\/?$/);
		await expect(page.getByTestId('settings-panel')).toBeVisible();
	});

	test('155 currency picker drafts until Save', async ({ page }) => {
		await goToNav(page, 'settings');
		await expect(page.getByTestId('currency-save')).toBeDisabled();
		await expect(page.getByTestId('currency-cancel')).toBeDisabled();
		await expect(page.getByTestId('currency-default')).toBeDisabled();
		await page.getByTestId('currency-picker').click();
		await page.getByTestId('currency-picker-search').fill('USD');
		const usdRow = page.getByRole('button', { name: /USD\s+US Dollar/ });
		await expect(usdRow).toBeVisible();
		await expect(usdRow).not.toHaveText(/ - /);
		await usdRow.click();
		await expect(page.getByTestId('currency-save')).toBeEnabled();
		await expect(page.getByTestId('currency-picker')).not.toHaveText(/ - /);
		await page.getByTestId('currency-cancel').click();
		await expect(page.getByTestId('currency-picker')).toContainText('IDR');
		await page.getByTestId('currency-picker').click();
		await page.getByTestId('currency-picker-search').fill('USD');
		await page.getByRole('button', { name: /USD\s+US Dollar/ }).click();
		await page.getByTestId('currency-save').click();
		await goToNav(page, 'home');
		await expect(page.getByTestId('account-balance')).toContainText('USD');
	});

	test('156 idle Save persists; Cancel restores draft', async ({ page }) => {
		await goToNav(page, 'settings');
		await expect(page.getByTestId('idle-save')).toBeDisabled();
		await page.getByTestId('idle-minutes').click();
		await page.getByTestId('idle-minutes-10').click();
		await expect(page.getByTestId('idle-save')).toBeEnabled();
		await page.getByTestId('idle-cancel').click();
		await expect(page.getByTestId('idle-minutes')).toHaveText('30 minutes');
		await page.getByTestId('idle-minutes').click();
		await page.getByTestId('idle-minutes-10').click();
		await page.getByTestId('idle-save').click();
		await page.reload();
		await goToNav(page, 'settings');
		await expect(page.getByTestId('idle-minutes')).toHaveText('10 minutes');
	});

	test('157 enable lock stays disabled until passphrase matches', async ({ page }) => {
		await goToNav(page, 'settings');
		await expect(page.getByTestId('enable-lock')).toBeDisabled();
		await expect(page.getByTestId('device-skip-warning')).toHaveCount(0);
		await expect(page.getByTestId('enable-lock-requirements')).toHaveCount(0);
		await expect(page.getByText('Passphrases match')).toHaveCount(0);
		await page.getByTestId('enable-lock-pass').fill('secret-pass');
		await expect(page.getByTestId('enable-lock')).toBeDisabled();
		await expect(page.getByTestId('enable-lock-requirements')).toBeVisible();
		await expect(page.getByText('Passphrases match')).toHaveCount(0);
		await page.getByTestId('enable-lock-pass-confirm').fill('secret-pass');
		await expect(page.getByTestId('enable-lock')).toBeEnabled();
		await expect(page.getByTestId('enable-lock-requirements')).toBeVisible();
		await expect(page.getByText('Passphrases match')).toHaveCount(0);
	});

	test('158 invalid backup file opens the not-a-backup dialog', async ({ page }) => {
		await goToNav(page, 'settings');
		await expect(page.getByTestId('import-backup-choose')).toBeVisible();
		await expect(page.getByText('No file chosen')).toHaveCount(0);
		await page.getByTestId('import-backup').setInputFiles({
			name: 'not-a-backup.json',
			mimeType: 'application/json',
			buffer: Buffer.from('{')
		});
		await expect(page.getByTestId('backup-import-invalid-dialog')).toBeVisible();
		await expect(page.getByTestId('backup-import-summary')).toHaveCount(0);
	});

	test('166 wrong import passphrase stays on confirm and keeps the file', async ({ page }) => {
		await goToNav(page, 'settings');
		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('export-backup').click();
		await page.getByTestId('export-backup-pass').fill('export-pass');
		await page.getByTestId('export-backup-pass-confirm').fill('export-pass');
		await page.getByTestId('export-backup-confirm').click();
		const download = await downloadPromise;
		const filePath = await download.path();
		expect(filePath).toBeTruthy();

		await page.getByTestId('import-backup').setInputFiles(filePath!);
		await expect(page.getByTestId('backup-import-summary')).toBeVisible();
		await expect(page.getByTestId('import-backup-filename')).toBeVisible();
		await page.getByTestId('import-backup-open').click();
		await page.getByTestId('import-backup-pass').fill('wrong-pass');
		await page.getByTestId('import-backup-confirm').click();
		await expect(page.getByTestId('import-backup-dialog')).toBeVisible();
		await expect(page.getByTestId('import-backup-pass-error')).toHaveText('Incorrect passphrase');
		await expect(page.getByTestId('settings-panel').getByRole('alert')).toHaveCount(0);

		await page.getByTestId('import-backup-dialog').getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByTestId('import-backup-dialog')).toHaveCount(0);
		await expect(page.getByTestId('backup-import-summary')).toBeVisible();

		await page.getByTestId('import-backup-open').click();
		await page.getByTestId('import-backup-pass').fill('export-pass');
		await page.getByTestId('import-backup-confirm').click();
		await expect(page.getByTestId('import-backup-dialog')).toHaveCount(0);
		await expect(page.getByTestId('backup-import-summary')).toHaveCount(0);
	});
});
