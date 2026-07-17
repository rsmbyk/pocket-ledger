import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';


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

	test('creates a goal with progress', async ({ page }) => {
		await goToNav(page, 'more');
		const more = page.getByTestId('more-panel');
		await more.getByPlaceholder('Name').fill('Emergency');
		await more.getByPlaceholder('Target amount').fill('1000000');
		await more.getByRole('button', { name: 'Add goal' }).click();
		await expect(more.getByText('Emergency')).toBeVisible();
		await expect(more.getByText(/0%/)).toBeVisible();

		await more.locator('form').filter({ hasText: 'Set saved' }).locator('input').fill('250000');
		await more.getByRole('button', { name: 'Set saved' }).click();
		await expect(more.getByText(/25%/)).toBeVisible();
	});

	test('captures net worth snapshot', async ({ page }) => {
		await ensureCategory(page, 'Salary', 'income');
		await openAdd(page);
		await page.getByRole('button', { name: 'Income', exact: true }).click();
		await page.getByLabel(/amount/i).fill('85000');
		await selectTxCategory(page, 'Salary');
		await page.getByRole('button', { name: 'Save' }).click();


		await goToNav(page, 'more');
		await page.getByTestId('capture-net-worth').click();
		await expect(page.getByTestId('net-worth-chart')).toBeVisible();
		await expect(page.getByTestId('net-worth-list')).toContainText(/85/);
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
