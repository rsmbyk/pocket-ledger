import { expect, test } from '@playwright/test';
import { addPocketBudget, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('246 pocket budgets', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('details card is always on; create pocket-wide and category budgets', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await expect(page.getByTestId('pocket-details-budgets-card')).toBeVisible();
		await expect(page.getByTestId('pocket-details-budgets-empty')).toBeVisible();
		await expect(page.getByTestId('pocket-details-add-budget')).toBeVisible();

		await addPocketBudget(page, { amount: '100000', selectAll: true });
		const list = page.getByTestId('pocket-details-budgets-list');
		await expect(list).toBeVisible();
		await expect(list.getByTestId('budget-progress-percent')).toHaveText('0%');
		await expect(list.getByTestId('budget-progress-amounts')).toContainText('100,000');

		await addPocketBudget(page, { amount: '10000', category: 'Groceries', hardLimit: true });
		await expect(list.getByText('Groceries')).toBeVisible();
		await expect(list.getByText('Hard', { exact: true })).toBeVisible();
	});

	test('soft exceed warns and Close still saves; overlay does not dismiss', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await addPocketBudget(page, { amount: '1000', category: 'Groceries' });

		await page.getByTestId('pocket-details-add').click();
		const sheet = page.getByTestId('tx-dialog');
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('1500');
		await selectTxCategory(page, 'Groceries', sheet);
		await sheet.getByRole('button', { name: 'Save' }).click();

		const warn = page.getByTestId('tx-budget-warn');
		await expect(warn).toBeVisible();
		await expect(warn).not.toContainText('hard limit');
		await page.locator('[data-slot="dialog-overlay"]').last().click({ position: { x: 1, y: 1 }, force: true });
		await expect(warn).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(warn).toBeHidden();
		await expect(sheet).toBeHidden();

		await expect(page.getByTestId('pocket-details-budgets-list').getByTestId('budget-progress-percent')).toHaveText(
			'150%'
		);
	});

	test('create start date defaults to today; edit monthly shows effectiveStartOn', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await page.getByTestId('pocket-details-add-budget').click();
		const dialog = page.getByTestId('pocket-budget-form-dialog');
		await expect(dialog).toBeVisible();
		const todayIso = await page.evaluate(() => {
			const d = new Date();
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${day}`;
		});
		const monthStart = `${todayIso.slice(0, 8)}01`;
		await expect(page.getByTestId('pocket-budget-start-input').locator('input[type="date"]')).toHaveValue(
			todayIso
		);
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();

		await addPocketBudget(page, {
			amount: '10000',
			category: 'Groceries',
			monthly: true,
			startOn: '2020-01-01'
		});
		await page.getByTestId('pocket-details-budgets-list').getByText('Groceries').click();
		await expect(dialog).toBeVisible();
		await expect(page.getByTestId('pocket-budget-start-input').locator('input[type="date"]')).toHaveValue(
			monthStart
		);
	});

	test('monthly window ignores spending from before this month', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await addPocketBudget(page, {
			amount: '10000',
			category: 'Groceries',
			monthly: true,
			startOn: '2020-01-01'
		});

		const lastMonthIso = await page.evaluate(() => {
			const d = new Date();
			d.setDate(1);
			d.setMonth(d.getMonth() - 1);
			d.setDate(15);
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${day}`;
		});

		await page.getByTestId('pocket-details-add').click();
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('5000');
		await selectTxCategory(page, 'Groceries', sheet);
		await sheet.getByTestId('tx-occurred-on').locator('input[type="date"]').fill(lastMonthIso);
		await sheet.getByRole('button', { name: 'Save' }).click();
		await expect(sheet).toBeHidden();
		await expect(page.getByTestId('pocket-details-budgets-list').getByTestId('budget-progress-percent')).toHaveText(
			'0%'
		);

		await page.getByTestId('pocket-details-add').click();
		await expect(sheet).toBeVisible();
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('5000');
		await selectTxCategory(page, 'Groceries', sheet);
		await sheet.getByRole('button', { name: 'Save' }).click();
		await expect(sheet).toBeHidden();
		await expect(page.getByTestId('pocket-details-budgets-list').getByTestId('budget-progress-percent')).toHaveText(
			'50%'
		);
	});

	test('hard limit blocks and Close keeps the sheet', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await addPocketBudget(page, { amount: '1000', category: 'Groceries', hardLimit: true });

		await page.getByTestId('pocket-details-add').click();
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('1500');
		await selectTxCategory(page, 'Groceries', sheet);
		await sheet.getByRole('button', { name: 'Save' }).click();

		const warn = page.getByTestId('tx-budget-warn');
		await expect(warn).toBeVisible();
		await expect(warn.getByTestId('confirm-dialog-danger-header')).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(warn).toBeHidden();
		await expect(sheet).toBeVisible();
		await expect(page.getByTestId('pocket-details-budgets-list').getByTestId('budget-progress-percent')).toHaveText(
			'0%'
		);
	});
});
