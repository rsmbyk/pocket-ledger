import { expect, test } from '@playwright/test';

test.describe('003–008 base features', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('More tab shows backup and privacy', async ({ page }) => {
		await page.getByRole('tab', { name: 'More' }).click();
		await expect(page.getByTestId('more-panel')).toBeVisible();
		await expect(page.getByTestId('export-backup')).toBeVisible();
		await expect(page.getByTestId('lock-status')).toContainText(/off/i);
	});

	test('export downloads a JSON backup', async ({ page }) => {
		await page.getByRole('tab', { name: 'More' }).click();
		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('export-backup').click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/pocket-ledger-.*\.json/);
	});

	test('creates a goal with progress', async ({ page }) => {
		await page.getByRole('tab', { name: 'More' }).click();
		await page.getByPlaceholder('Name').fill('Emergency');
		await page.getByPlaceholder('Target amount').fill('1000000');
		await page.getByRole('button', { name: 'Add goal' }).click();
		await expect(page.getByText('Emergency')).toBeVisible();
		await expect(page.getByText(/0%/)).toBeVisible();

		await page.locator('form').filter({ hasText: 'Set saved' }).locator('input').fill('250000');
		await page.getByRole('button', { name: 'Set saved' }).click();
		await expect(page.getByText(/25%/)).toBeVisible();
	});

	test('captures net worth snapshot', async ({ page }) => {
		await page.getByRole('button', { name: 'Add transaction' }).click();
		await page.getByRole('button', { name: 'Income', exact: true }).click();
		await page.getByLabel(/amount/i).fill('85000');
		await page.getByLabel('Category', { exact: true }).selectOption({ label: 'Salary' });
		await page.getByRole('button', { name: 'Save' }).click();

		await page.getByRole('tab', { name: 'More' }).click();
		await page.getByTestId('capture-net-worth').click();
		await expect(page.getByTestId('net-worth-chart')).toBeVisible();
		await expect(page.getByTestId('net-worth-list')).toContainText(/85/);
	});

	test('enables passphrase lock and requires unlock', async ({ page }) => {
		await page.getByRole('tab', { name: 'More' }).click();
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
		await page.getByRole('tab', { name: 'More' }).click();
		await page.getByRole('textbox', { name: 'Amount', exact: true }).fill('50000');
		await page.getByRole('button', { name: 'Add rule' }).click();
		await expect(page.getByTestId('recurring-list')).toContainText(/monthly/i);
		await expect(page.getByTestId('recurring-list')).toContainText(/50/);
	});
});
