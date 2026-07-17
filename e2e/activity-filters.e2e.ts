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
	await form.getByRole('textbox', { name: 'Amount' }).fill('100000');
	await selectTxCategory(page, 'Salary', form);
	await form.getByRole('button', { name: 'Save' }).click();

	await openAdd(page);
	form = (await sheet.isVisible().catch(() => false)) ? sheet : dialog;
	await form.getByRole('button', { name: 'Expense', exact: true }).click();
	await form.getByRole('textbox', { name: 'Amount' }).fill('15000');
	await selectTxCategory(page, 'Food', form);
	await form.getByRole('textbox', { name: 'Note' }).fill('secret lunch');
	await form.getByRole('button', { name: 'Save' }).click();
}

/** Filters surface is bottom sheet, right sheet, or xl drawer depending on viewport. */
function filtersSurface(page: Page) {
	return page.locator(
		'[data-testid="activity-filters-sheet"], [data-testid="activity-filters-drawer"]'
	);
}

async function openAndApplyType(page: Page, type: 'all' | 'income' | 'expense'): Promise<void> {
	await page.getByTestId('activity-filters-open').click();
	await expect(filtersSurface(page)).toBeVisible();
	await page.getByTestId('activity-filter-type').selectOption(type);
	await page.getByTestId('activity-filters-apply').click();
	await expect(filtersSurface(page)).toBeHidden();
}

test.describe('017 / 045 activity filters', () => {
	test.use({ viewport: { width: 1024, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('filters by type via Apply and searches amount with separators', async ({ page }) => {
		await seedIncomeAndExpense(page);

		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-filters')).toBeVisible();
		await expect(page.getByTestId('activity-filters-open')).toBeVisible();
		await expect(page.getByTestId('activity-filter-type')).toHaveCount(0);

		await openAndApplyType(page, 'expense');
		await expect(page.getByTestId('activity-filters-badge')).toHaveText('1');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await openAndApplyType(page, 'all');
		await expect(page.getByTestId('activity-filters-badge')).toHaveCount(0);
		await page.getByTestId('activity-filter-search').fill('100,000');
		await expect(page.getByTestId('activity-list')).toContainText('Salary');
		await expect(page.getByTestId('activity-list')).not.toContainText('Food');

		await page.getByTestId('activity-filter-search').fill('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});

	test('dirty close warns and keeps applied filters', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'activity');

		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filter-type').selectOption('expense');
		await page.getByTestId('activity-filters-close').click();
		await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeVisible();
		await expect(page.getByTestId('confirm-dialog-danger-header')).toHaveCount(0);
		const discardConfirm = page.getByTestId('activity-filters-discard-confirm');
		await expect(discardConfirm).toHaveClass(/bg-destructive/);
		await expect(discardConfirm).toHaveClass(/border-destructive/);
		await discardConfirm.click();
		await expect(filtersSurface(page)).toBeHidden();
		await expect(page.getByTestId('activity-list')).toContainText('Salary');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});

	test('049 toolbar: Sort then Filters beside search; Add right-aligned', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'activity');

		const searchBox = await page.getByTestId('activity-filters').boundingBox();
		const sortBtn = await page.getByTestId('activity-sort-open').boundingBox();
		const filtersBtn = await page.getByTestId('activity-filters-open').boundingBox();
		const addBtn = await page.getByTestId('activity-add').boundingBox();
		expect(searchBox && sortBtn && filtersBtn && addBtn).toBeTruthy();
		expect(sortBtn!.x).toBeGreaterThan(searchBox!.x);
		expect(filtersBtn!.x).toBeGreaterThan(sortBtn!.x);
		expect(Math.abs(filtersBtn!.y - searchBox!.y)).toBeLessThan(24);
		expect(addBtn!.y).toBeGreaterThan(searchBox!.y + searchBox!.height - 4);

		await expect(page.getByTestId('activity-filters-open')).toHaveText('');
		await expect(page.getByTestId('activity-sort-open')).toHaveText('');

		await page.getByTestId('activity-sort-open').click();
		await expect(page.getByTestId('activity-sort-sheet')).toBeVisible();
		await page.getByTestId('activity-sort-occurredOn-asc').click();
		await expect(page.getByTestId('activity-sort-sheet')).toBeHidden();
	});

	test('064 Categories sort puts income before expense; note is own line', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'activity');

		const foodRow = page.locator('button[data-testid^="activity-row-"]').filter({ hasText: 'Food' });
		await expect(foodRow.getByTestId(/-note$/)).toContainText('secret lunch');
		await expect(foodRow.getByTestId(/-date$/)).toBeVisible();

		await page.getByTestId('activity-sort-open').click();
		await page.getByTestId('activity-sort-category').click();
		const rows = page.locator('button[data-testid^="activity-row-"]');
		await expect(rows.first()).toContainText('Salary');
		await expect(rows.nth(1)).toContainText('Food');
	});
});

test.describe('049 / 058 activity filters xl drawer', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('always shows in-layout drawer without open button or Close', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'activity');
		await expect(page.getByTestId('activity-filters-drawer')).toBeVisible();
		await expect(page.getByTestId('activity-filters-open')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-sheet')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-close')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-clear')).toBeVisible();
		await expect(page.getByTestId('activity-filters-clear')).toHaveClass(/border/);
		await expect(page.getByTestId('activity-filters-apply')).toBeVisible();
		await expect(page.getByTestId('activity-sort-open')).toBeVisible();
		await page.getByTestId('activity-sort-open').click();
		await expect(page.getByTestId('activity-sort-sheet')).toBeVisible();
		await page.getByTestId('activity-sort-close').click();
		await page.getByTestId('activity-filter-type').selectOption('expense');
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.getByTestId('activity-filters-drawer')).toBeVisible();
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');
	});
});

test.describe('020 / 045 activity filters mobile', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Mobile chrome hides the sidebar h1; wait for shell instead (see desktop-layout.e2e).
		await expect(page.getByTestId('app-shell')).toBeVisible();
	});

	test('opens bottom sheet; Apply commits; Clear then Apply resets', async ({ page }) => {
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
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.getByTestId('activity-filters-sheet')).toBeHidden();
		await expect(page.getByTestId('activity-filters-badge')).toHaveText('1');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await page.getByTestId('activity-filter-search').fill('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');

		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filters-clear').click();
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.getByTestId('activity-filters-badge')).toHaveCount(0);
		await page.getByTestId('activity-filter-search').fill('');
		await expect(page.getByTestId('activity-list')).toContainText('Salary');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
	});
});
