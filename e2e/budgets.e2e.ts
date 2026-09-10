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

test.describe('247 budget chrome', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('Select all disables when every category is checked', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await page.getByTestId('pocket-details-add-budget').click();
		const dialog = page.getByTestId('pocket-budget-form-dialog');
		await expect(dialog).toBeVisible();
		const selectAll = page.getByTestId('pocket-budget-select-all');
		await expect(selectAll).toBeEnabled();
		await selectAll.click();
		await expect(selectAll).toBeDisabled();
		await dialog.getByRole('checkbox', { name: 'Groceries', exact: true }).uncheck();
		await expect(selectAll).toBeEnabled();
	});

	test('pocket-wide shows Landmark and sorts first even when a category row is hotter', async ({
		page
	}) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await addPocketBudget(page, { amount: '100000', selectAll: true });
		await addPocketBudget(page, { amount: '1000', category: 'Groceries' });

		await page.getByTestId('pocket-details-add').click();
		const sheet = page.getByTestId('tx-dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('1500');
		await selectTxCategory(page, 'Groceries', sheet);
		await sheet.getByRole('button', { name: 'Save' }).click();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(sheet).toBeHidden();

		const list = page.getByTestId('pocket-details-budgets-list');
		const rows = list.locator('[data-testid^="pocket-details-budget-row-"]');
		await expect(rows.first()).toContainText('Main');
		await expect(rows.nth(1)).toContainText('Groceries');
		await expect(list.locator('[data-testid^="pocket-details-budget-pocket-icon-"]')).toHaveCount(1);
		await expect(rows.first().locator('[data-testid^="pocket-details-budget-pocket-icon-"]')).toBeVisible();
		await expect(rows.nth(1).locator('[data-testid^="pocket-details-budget-pocket-icon-"]')).toHaveCount(0);
	});

	test('Restart disables when the stored window already starts today', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await addPocketBudget(page, { amount: '10000', category: 'Groceries' });
		await page.getByTestId('pocket-details-budgets-list').getByText('Groceries').click();
		const dialog = page.getByTestId('pocket-budget-form-dialog');
		await expect(dialog).toBeVisible();
		await expect(page.getByTestId('pocket-budget-restart')).toBeDisabled();
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();

		await addPocketBudget(page, { amount: '20000', category: 'Rent', startOn: '2020-01-01' });
		await page.getByTestId('pocket-details-budgets-list').getByText('Rent').click();
		await expect(dialog).toBeVisible();
		await expect(page.getByTestId('pocket-budget-restart')).toBeEnabled();
	});

	test('Applies to search filters categories and shows empty copy', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await page.getByTestId('pocket-details-add-budget').click();
		const dialog = page.getByTestId('pocket-budget-form-dialog');
		await expect(dialog).toBeVisible();
		const search = page.getByTestId('pocket-budget-applies-search');
		await search.fill('groc');
		await expect(dialog.getByRole('checkbox', { name: 'Groceries', exact: true })).toBeVisible();
		await expect(dialog.getByRole('checkbox', { name: 'Rent', exact: true })).toBeHidden();
		await expect(dialog.getByRole('checkbox', { name: 'Home', exact: true })).toBeHidden();
		await search.fill('zzzz');
		const empty = page.getByTestId('pocket-budget-applies-search-empty');
		await expect(empty).toBeVisible();
		await expect(empty).toContainText('No matches');
		await expect(empty).toContainText('Try a different category or group name.');
	});
});
