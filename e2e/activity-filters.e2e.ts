import { expect, test, type Page } from '@playwright/test';
import {
	confirmVoid,
	ensureCategory,
	goToNav,
	openAdd,
	selectActivityFilterCategory,
	selectTxCategory
} from './nav';

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
	await expect(form).toBeHidden({ timeout: 10_000 });

	await openAdd(page);
	form = (await sheet.isVisible().catch(() => false)) ? sheet : dialog;
	await form.getByRole('button', { name: 'Expense', exact: true }).click();
	await form.getByRole('textbox', { name: 'Amount' }).fill('15000');
	await selectTxCategory(page, 'Food', form);
	await form.getByRole('textbox', { name: 'Note' }).fill('secret lunch');
	await form.getByRole('button', { name: 'Save' }).click();
	await expect(form).toBeHidden({ timeout: 10_000 });
}

/** Filters surface is bottom sheet, right sheet, or xl drawer depending on viewport. */
function filtersSurface(page: Page) {
	return page.locator(
		'[data-testid="activity-filters-sheet"], [data-testid="activity-filters-drawer"]'
	);
}

async function setFilterTypes(
	page: Page,
	types: Array<'income' | 'expense' | 'transfer'>
): Promise<void> {
	const trigger = page.getByTestId('activity-filter-type');
	await trigger.click();
	const incomeItem = page.getByTestId('activity-filter-type-income');
	await expect(incomeItem).toBeVisible();
	for (const t of ['income', 'expense', 'transfer'] as const) {
		const item = page.getByTestId(`activity-filter-type-${t}`);
		await expect(item).toBeVisible();
		const checked = (await item.getAttribute('aria-checked')) === 'true';
		const want = types.includes(t);
		if (checked !== want) {
			await item.click({ force: true });
			await expect(item).toHaveAttribute('aria-checked', want ? 'true' : 'false');
		}
	}
	// Close without Escape — Escape on a dirty sheet opens discard.
	const sheetTitle = filtersSurface(page).locator('p').filter({ hasText: /^Filters$/ });
	if (await sheetTitle.isVisible()) {
		await sheetTitle.click({ force: true });
	} else {
		await filtersSurface(page)
			.locator('div.border-b')
			.first()
			.click({ force: true, position: { x: 8, y: 8 } });
	}
	await expect(incomeItem).toBeHidden();
}

async function openAndApplyType(
	page: Page,
	type: 'all' | 'income' | 'expense' | 'transfer'
): Promise<void> {
	await page.getByTestId('activity-filters-open').click();
	await expect(filtersSurface(page)).toBeVisible();
	await setFilterTypes(page, type === 'all' ? [] : [type]);
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

		await goToNav(page, 'transactions');
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
		await goToNav(page, 'transactions');

		await page.getByTestId('activity-filters-open').click();
		await setFilterTypes(page, ['expense']);
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

	test('overlay and Escape close a clean Filters sheet', async ({ page }) => {
		await goToNav(page, 'transactions');
		await page.getByTestId('activity-filters-open').click();
		await expect(filtersSurface(page)).toBeVisible();
		await page.locator('[data-slot="sheet-overlay"]').click({ position: { x: 8, y: 8 } });
		await expect(filtersSurface(page)).toBeHidden();

		await page.getByTestId('activity-filters-open').click();
		await expect(filtersSurface(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(filtersSurface(page)).toBeHidden();
	});

	test('dirty overlay and Escape open discard confirm', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');
		await page.getByTestId('activity-filters-open').click();
		await setFilterTypes(page, ['expense']);
		await page.locator('[data-slot="sheet-overlay"]').click({ position: { x: 8, y: 8 } });
		await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeVisible();
		await expect(filtersSurface(page)).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeHidden();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeVisible();
		await expect(filtersSurface(page)).toBeVisible();
	});

	test('049 toolbar: Filters beside search; Add right-aligned; no Sort', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');

		const searchBox = await page.getByTestId('activity-filters').boundingBox();
		const filtersBtn = await page.getByTestId('activity-filters-open').boundingBox();
		const addBtn = await page.getByTestId('activity-add').boundingBox();
		expect(searchBox && filtersBtn && addBtn).toBeTruthy();
		expect(filtersBtn!.x).toBeGreaterThan(searchBox!.x);
		expect(Math.abs(filtersBtn!.y - searchBox!.y)).toBeLessThan(24);
		expect(addBtn!.y).toBeGreaterThan(searchBox!.y + searchBox!.height - 4);

		await expect(page.getByTestId('activity-filters-open')).toHaveText('');
		await expect(page.getByTestId('activity-sort-open')).toHaveCount(0);
		await expect(page.getByTestId('activity-range')).toBeVisible();
		await expect(page.getByTestId('activity-filter-start')).toHaveCount(0);
		await expect(page.getByTestId('activity-filter-end')).toHaveCount(0);
	});

	test('065 primary-outline when filters active', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');

		const filtersBtn = page.getByTestId('activity-filters-open');
		await expect(filtersBtn).not.toHaveAttribute('data-active', 'true');

		await openAndApplyType(page, 'expense');
		await expect(filtersBtn).toHaveAttribute('data-active', 'true');
		await expect(filtersBtn).toHaveAttribute('aria-pressed', 'true');
		await expect(filtersBtn).toHaveClass(/border-primary/);
		await expect(page.getByTestId('activity-filters-badge')).toBeVisible();

		await openAndApplyType(page, 'all');
		await expect(filtersBtn).not.toHaveAttribute('data-active', 'true');
	});

	test('134 date groups always; note primary; no per-row date', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');

		const foodRow = page
			.locator('button[data-testid^="activity-row-"]')
			.filter({ hasText: 'Food' });
		await expect(foodRow.getByTestId(/-note$/)).toContainText('secret lunch');
		await expect(foodRow.getByTestId(/-date$/)).toHaveCount(0);
		await expect(page.locator('[data-testid^="activity-date-group-"]')).toHaveCount(1);
		await expect(page.getByTestId('activity-range-trigger')).toBeVisible();
		await expect(page.locator('header').getByTestId('activity-range')).toHaveCount(0);
	});

	test('142 range picker lives in chrome band; Month and Manual interiors', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');
		const trigger = page.getByTestId('activity-range-trigger');
		await expect(trigger).toBeVisible();
		await expect(page.locator('header').getByTestId('activity-range')).toHaveCount(0);
		await expect(page.getByTestId('activity-chrome').getByTestId('activity-range')).toBeVisible();
		await trigger.click();
		await expect(page.getByTestId('activity-range-mode-month')).toBeVisible();
		await page.getByTestId('activity-range-month-2026-08').click();
		await expect(trigger).toContainText('August 2026');

		await trigger.click();
		await page.getByTestId('activity-range-mode-manual').click();
		await expect(page.getByTestId('activity-range-start')).toBeVisible();
		await expect(page.getByTestId('activity-range-end')).toBeVisible();
		await expect(page.locator('[data-testid^="activity-range-day-"]').first()).toBeVisible();
		await page.keyboard.press('Escape');

		await page.setViewportSize({ width: 1024, height: 480 });
		await page.evaluate(() => window.scrollTo(0, 800));
		await expect(page.getByTestId('activity-chrome')).toBeInViewport();
		await expect(trigger).toBeInViewport();
		await expect(page.getByTestId('activity-filter-search')).toBeInViewport();
		await expect(page.getByTestId('activity-filters-open')).toBeInViewport();
		await expect(page.getByTestId('activity-add')).toBeInViewport();
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
		await goToNav(page, 'transactions');
		await expect(page.getByTestId('activity-filters-drawer')).toBeVisible();
		await expect(page.getByTestId('activity-filters-open')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-sheet')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-close')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-clear')).toBeVisible();
		await expect(page.getByTestId('activity-filters-clear')).toHaveClass(/border/);
		await expect(page.getByTestId('activity-filters-apply')).toBeVisible();
		await expect(page.getByTestId('activity-sort-open')).toHaveCount(0);
		await expect(page.getByTestId('activity-filter-start')).toHaveCount(0);
		await setFilterTypes(page, ['expense']);
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
		await expect(page.getByTestId('recent-list')).toContainText('Food');
		await expect(page.getByTestId('recent-list')).toContainText('Salary');

		// Hash nav avoids flaky mobile drawer open after seeding (see desktop-layout for menu path).
		await page.goto('/transactions');
		await expect(page.getByTestId('activity-panel')).toBeVisible();
		await expect(page.getByTestId('activity-filters')).toBeVisible();
		await expect(page.getByTestId('activity-filters-open')).toBeVisible();
		await expect(page.getByTestId('activity-filter-search')).toBeVisible();
		await expect(page.getByTestId('activity-filter-type')).toHaveCount(0);

		await page.getByTestId('activity-filters-open').click();
		await expect(page.getByTestId('activity-filters-sheet')).toBeVisible();
		await setFilterTypes(page, ['expense']);
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.getByTestId('activity-filters-sheet')).toBeHidden();
		await expect(page.getByTestId('activity-filters-badge')).toHaveText('1');
		await expect(page.getByTestId('activity-list')).toBeVisible();
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

test.describe('101 activity date sort secondary createdAt', () => {
	test.use({ viewport: { width: 1024, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('same-day rows follow createdAt in the date sort direction', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');

		await openAdd(page);
		let form = (await page
			.getByTestId('tx-sheet')
			.isVisible()
			.catch(() => false))
			? page.getByTestId('tx-sheet')
			: page.getByTestId('tx-dialog');
		await form.getByRole('button', { name: 'Expense', exact: true }).click();
		await form.getByRole('textbox', { name: 'Amount' }).fill('1000');
		await selectTxCategory(page, 'Food', form);
		await form.getByRole('textbox', { name: 'Note' }).fill('earlier-created');
		await form.getByRole('button', { name: 'Save' }).click();

		await openAdd(page);
		form = (await page
			.getByTestId('tx-sheet')
			.isVisible()
			.catch(() => false))
			? page.getByTestId('tx-sheet')
			: page.getByTestId('tx-dialog');
		await form.getByRole('button', { name: 'Expense', exact: true }).click();
		await form.getByRole('textbox', { name: 'Amount' }).fill('2000');
		await selectTxCategory(page, 'Food', form);
		await form.getByRole('textbox', { name: 'Note' }).fill('later-created');
		await form.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'transactions');

		const notesDesc = page.locator('[data-testid="activity-list"] [data-testid$="-note"]');
		await expect(notesDesc).toHaveCount(2);
		await expect(notesDesc.nth(0)).toContainText('later-created');
		await expect(notesDesc.nth(1)).toContainText('earlier-created');
	});
});

test.describe('102 activity session sort + filters', () => {
	test.use({ viewport: { width: 1024, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('persists applied filters across reload', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');

		await openAndApplyType(page, 'expense');
		await page.getByTestId('activity-filter-search').fill('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await page.reload();
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'transactions');

		await expect(page.getByTestId('activity-sort-open')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-badge')).toHaveText('1');
		await expect(page.getByTestId('activity-filter-search')).toHaveValue('lunch');
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-list')).not.toContainText('Salary');

		await page.getByTestId('activity-filters-open').click();
		await expect(page.getByTestId('activity-filter-type')).toContainText('Expense');
	});
});

test.describe('107 filter category picker + type coupling', () => {
	test.use({ viewport: { width: 1024, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('type All groups Income and Expenses; Income narrows; Transfer disables', async ({
		page
	}) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');

		await page.getByTestId('activity-filters-open').click();
		await expect(filtersSurface(page)).toBeVisible();
		await page.getByTestId('activity-filter-category').click();
		await expect(page.getByTestId('picker-kind-income')).toBeVisible();
		await expect(page.getByTestId('picker-kind-expense')).toBeVisible();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Food', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Admin Fee' })).toHaveCount(0);
		await expect(page.getByRole('option', { name: 'Bonus', exact: true })).toHaveCount(0);
		await page.keyboard.press('Escape');

		await setFilterTypes(page, ['income']);
		await page.getByTestId('activity-filter-category').click();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Food', exact: true })).toHaveCount(0);
		await expect(page.getByRole('option', { name: 'Admin Fee' })).toHaveCount(0);
		await page.keyboard.press('Escape');

		await setFilterTypes(page, ['transfer']);
		await expect(page.getByTestId('activity-filter-category')).toBeDisabled();
		await expect(page.getByTestId('activity-filter-category')).toContainText('All');
		await page.getByTestId('activity-filters-apply').click();
		await expect(filtersSurface(page)).toBeHidden();
		// No transfers seeded — filtered empty (not income/expense rows).
		await expect(page.getByTestId('activity-empty-filtered')).toBeVisible();
		await expect(page.getByTestId('activity-list')).toHaveCount(0);
	});

	test('clears incompatible category when type changes', async ({ page }) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');

		await page.getByTestId('activity-filters-open').click();
		await selectActivityFilterCategory(page, 'Food');
		await expect(page.getByTestId('activity-filter-category')).toContainText('Food');
		await page.keyboard.press('Escape');
		await setFilterTypes(page, ['income']);
		await expect(page.getByTestId('activity-filter-category')).toContainText('All');
	});
});

test.describe('132 activity category filter used-only', () => {
	test.use({ viewport: { width: 1024, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('hides Category when the ledger is empty', async ({ page }) => {
		await goToNav(page, 'transactions');
		await page.getByTestId('activity-filters-open').click();
		await expect(filtersSurface(page)).toBeVisible();
		await expect(page.getByTestId('activity-filter-category')).toHaveCount(0);
	});

	test('lists only used categories and still shows unused ones on the tx sheet', async ({
		page
	}) => {
		await seedIncomeAndExpense(page);
		await goToNav(page, 'transactions');
		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filter-category').click();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Bonus', exact: true })).toHaveCount(0);
		await page.getByTestId('category-picker-search').fill('work');
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Food', exact: true })).toHaveCount(0);
		await page.keyboard.press('Escape');
		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Income', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await expect(page.getByRole('option', { name: 'Bonus', exact: true })).toBeVisible();
	});

	test('voided transactions still count as used', async ({ page }) => {
		await ensureCategory(page, 'Groceries', 'expense');
		await openAdd(page);
		const form = page.getByRole('dialog');
		await form.getByRole('button', { name: 'Expense', exact: true }).click();
		await form.getByRole('textbox', { name: 'Amount' }).fill('15000');
		await selectTxCategory(page, 'Groceries', form);
		await form.getByRole('button', { name: 'Save' }).click();
		await expect(form).toBeHidden({ timeout: 10_000 });

		await goToNav(page, 'transactions');
		await page
			.getByTestId('activity-list')
			.locator('[data-testid^="activity-row-"]')
			.first()
			.click();
		await page.getByTestId('tx-void').click();
		await confirmVoid(page);

		await page.getByTestId('activity-filters-open').click();
		await expect(page.getByTestId('activity-filter-category')).toBeVisible();
		await page.getByTestId('activity-filter-category').click();
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toBeVisible();
	});
});
