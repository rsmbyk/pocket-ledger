import { expect, test, type Page } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

async function seedIncomeAndExpense(page: Page): Promise<void> {
	await ensureCategory(page, 'Salary', 'income');
	await ensureCategory(page, 'Food', 'expense');
	await openAdd(page);
	const sheet = page.getByTestId('tx-sheet');
	const dialog = page.getByTestId('tx-dialog');
	let form = (await sheet.isVisible().catch(() => false)) ? sheet : dialog;

	await form.getByRole('button', { name: 'Income', exact: true }).click();
	await form.getByLabel(/amount/i).fill('100000');
	await selectTxCategory(page, 'Salary', form);
	await form.getByRole('button', { name: 'Save' }).click();

	await openAdd(page);
	form = (await sheet.isVisible().catch(() => false)) ? sheet : dialog;
	await form.getByRole('button', { name: 'Expense', exact: true }).click();
	await form.getByLabel(/amount/i).fill('15000');
	await selectTxCategory(page, 'Food', form);
	await form.getByLabel(/note/i).fill('secret lunch');
	await form.getByRole('button', { name: 'Save' }).click();
}

test.describe('017 activity filters', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('filters by type and searches amount with separators', async ({ page }) => {
		await seedIncomeAndExpense(page);

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-filters')).toBeVisible();
		await page.getByTestId('activity-filter-type').selectOption('expense');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await page.getByTestId('activity-filter-type').selectOption('all');
		await page.getByTestId('activity-filter-search').fill('100,000');
		await expect(page.getByTestId('activity-list')).toContainText('Salary');
		await expect(page.getByTestId('activity-list')).not.toContainText('Food');

		await page.getByTestId('activity-filter-search').fill('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});
});

test.describe('020 activity filters mobile', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Mobile chrome hides the sidebar h1; wait for shell instead (see desktop-layout.e2e).
		await expect(page.getByTestId('app-shell')).toBeVisible();
	});

	test('opens sheet for type filter; search stays on chrome', async ({ page }) => {
		test.setTimeout(60_000);
		await seedIncomeAndExpense(page);

		// Hash nav avoids flaky mobile drawer open after seeding (see desktop-layout for menu path).
		await page.goto('/#/activity');
		await expect(page.getByTestId('activity-panel')).toBeVisible();
		await expect(page.getByTestId('activity-filters')).toBeVisible();
		await expect(page.getByTestId('activity-filters-open')).toBeVisible();
		await expect(page.getByTestId('activity-filter-search')).toBeVisible();
		await expect(page.getByTestId('activity-filter-type')).toHaveCount(0);

		await page.getByTestId('activity-filters-open').click();
		await expect(page.getByTestId('activity-filters-sheet')).toBeVisible();
		await page.getByTestId('activity-filter-type').selectOption('expense');
		await page.getByTestId('activity-filters-done').click();
		await expect(page.getByTestId('activity-filters-sheet')).toBeHidden();
		await expect(page.getByTestId('activity-filters-badge')).toHaveText('1');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await page.getByTestId('activity-filter-search').fill('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');

		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filters-clear').click();
		await page.getByTestId('activity-filters-done').click();
		await expect(page.getByTestId('activity-filters-badge')).toHaveCount(0);
		await page.getByTestId('activity-filter-search').fill('');
		await expect(page.getByTestId('activity-list')).toContainText('Salary');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});
});
