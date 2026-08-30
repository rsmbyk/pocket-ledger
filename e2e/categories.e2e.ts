import { expect, test } from '@playwright/test';
import { categoryChip, longPress, openAdd, selectCategoriesKind, selectTxCategory } from './nav';

test.describe('123 overlay catalog / 124–126 categories chrome', () => {
	test('defaults to Income and does not show expense groups', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('category-kind-income')).toHaveAttribute('aria-selected', 'true');
		await expect(page.getByTestId('category-group-stock-group:work')).toBeVisible();
		const salary = categoryChip(page, 'Salary');
		await salary.scrollIntoViewIfNeeded();
		await expect(salary).toBeVisible();
		await expect(page.getByTestId('category-group-stock-group:home')).toHaveCount(0);
		await expect(categoryChip(page, 'Groceries')).toHaveCount(0);
		await expect(page.getByTestId('category-edit-mode')).toHaveCount(0);
	});

	test('Expenses tab shows Home and Groceries', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await expect(page.getByTestId('category-group-stock-group:home')).toBeVisible();
		const groceries = categoryChip(page, 'Groceries');
		await groceries.scrollIntoViewIfNeeded();
		await expect(groceries).toBeVisible();
		await expect(categoryChip(page, 'Salary')).toHaveCount(0);
	});

	test('kind survives reload in the same tab', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.reload();
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('category-kind-expense')).toHaveAttribute('aria-selected', 'true');
		await expect(page.getByTestId('category-group-stock-group:home')).toBeVisible();
	});

	test('kind survives leaving and returning to Categories', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await page.goto('/categories');
		await expect(page.getByTestId('category-kind-expense')).toHaveAttribute('aria-selected', 'true');
	});

	test('deep-links to categories', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await expect(page.getByTestId('nav-categories')).toHaveAttribute('aria-current', 'page');
	});

	test('adds a custom category from a group header plus', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page
			.getByTestId('category-group-stock-group:food-drink')
			.getByTestId('category-add-in-group')
			.click();
		await expect(page.getByTestId('category-add-dialog')).toBeVisible();
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		await expect(categoryChip(page, 'Warung')).toBeVisible();
		await expect(
			page.getByTestId('category-group-stock-group:food-drink').getByRole('button', { name: 'Add', exact: true })
		).toHaveCount(0);

		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await selectTxCategory(page, 'Warung', sheet);
		await expect(sheet.getByTestId('tx-category')).toContainText('Warung');
	});

	test('searches by category and group label', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-search').fill('groc');
		await expect(page.getByTestId('category-group-stock-group:food-drink')).toBeVisible();
		await expect(categoryChip(page, 'Groceries')).toBeVisible();
		await expect(page.getByTestId('category-group-stock-group:home')).toHaveCount(0);

		await page.getByTestId('category-search').fill('home');
		await expect(page.getByTestId('category-group-stock-group:home')).toBeVisible();
		await expect(categoryChip(page, 'Rent')).toBeVisible();
		await expect(page.getByTestId('category-group-stock-group:utilities')).toHaveCount(0);

		await page.getByTestId('category-search').fill('zzzz-no-match');
		await expect(page.getByTestId('category-search-empty')).toBeVisible();
		await expect(page.getByTestId('category-add-group')).toBeVisible();
		await expect(page.getByTestId('category-reorder')).toBeVisible();
	});

	test('hides a stock category from the picker without edit mode', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		const groceries = categoryChip(page, 'Groceries');
		await groceries.scrollIntoViewIfNeeded();
		await groceries.hover();
		await groceries.getByTestId('category-hide').click();
		await expect(groceries).toHaveAttribute('data-hidden', 'true');

		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await page.getByTestId('category-picker-search').fill('Groceries');
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toHaveCount(0);
		await page.keyboard.press('Escape');

		await page.goto('/categories');
		await expect(page.getByTestId('category-kind-expense')).toHaveAttribute('aria-selected', 'true');
		const groceriesAgain = categoryChip(page, 'Groceries');
		await groceriesAgain.scrollIntoViewIfNeeded();
		await groceriesAgain.hover();
		await groceriesAgain.getByTestId('category-show').click();
	});

	test('custom chip can be renamed from hover edit', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page
			.getByTestId('category-group-stock-group:food-drink')
			.getByTestId('category-add-in-group')
			.click();
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		const warung = categoryChip(page, 'Warung');
		await warung.hover();
		await warung.getByTestId('category-edit-name').click();
		await page.getByRole('textbox', { name: 'Name for Warung' }).fill('Warung kopi');
		await page.getByTestId('category-save-name').click();
		await expect(categoryChip(page, 'Warung kopi')).toBeVisible();
		const groceries = categoryChip(page, 'Groceries');
		await groceries.hover();
		await expect(groceries.getByTestId('category-edit-name')).toHaveCount(0);
	});

	test('add group uses the selected tab kind and has no kind dropdown', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-add-group').click();
		await expect(page.getByTestId('category-add-group-dialog')).toBeVisible();
		await expect(page.getByTestId('category-group-kind')).toHaveCount(0);
		await page.getByTestId('category-group-name-input').fill('Side');
		await page.getByTestId('category-group-add').click();
		await expect(
			page.locator('[data-testid^="category-group-"]', { has: page.getByText('Side', { exact: true }) })
		).toBeVisible();
	});

	test('reorder hides search, has no Done, and Discard exits', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-search').fill('groc');
		await expect(categoryChip(page, 'Groceries')).toBeVisible();
		await page.getByTestId('category-reorder').click();
		await expect(page.getByTestId('category-search')).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(0);
		await expect(page.getByTestId('category-reorder-save')).toBeVisible();
		await expect(page.getByTestId('category-reorder-discard')).toBeVisible();
		await expect(page.getByTestId('category-reorder-reset')).toBeVisible();
		await expect(page.getByTestId('category-chip')).toHaveCount(0);
		await expect(page.getByTestId('category-group-row-stock-group:home')).toBeVisible();
		await expect(page.getByTestId('category-group-row-stock-group:work')).toHaveCount(0);
		await page.getByTestId('category-reorder-discard').click();
		await expect(page.getByTestId('category-search')).toBeVisible();
		await expect(page.getByTestId('category-search')).toHaveValue('');
		await expect(page.getByTestId('category-group-stock-group:home')).toBeVisible();
		await expect(categoryChip(page, 'Groceries')).toBeVisible();
	});

	test('reorder lets you switch kinds without a leave confirm', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-reorder').click();
		await expect(page.getByTestId('category-search')).toHaveCount(0);
		await selectCategoriesKind(page, 'income');
		await expect(page.getByTestId('category-reorder-leave-confirm')).toHaveCount(0);
		await expect(page.getByTestId('category-group-row-stock-group:work')).toBeVisible();
		await expect(page.getByTestId('category-reorder-save')).toBeVisible();
		await selectCategoriesKind(page, 'expense');
		await expect(page.getByTestId('category-group-row-stock-group:home')).toBeVisible();
		await page.getByTestId('category-reorder-discard').click();
		await expect(page.getByTestId('category-search')).toBeVisible();
		await expect(page.getByTestId('category-chip').first()).toBeVisible();
	});

	test('group header title and plus share a midline', async ({ page }) => {
		await page.goto('/categories');
		const card = page.getByTestId('category-group-stock-group:work');
		await expect(card).toBeVisible();
		const title = card.locator('[data-slot=card-title]');
		const plus = card.getByTestId('category-add-in-group');
		const titleBox = await title.boundingBox();
		const plusBox = await plus.boundingBox();
		expect(titleBox).toBeTruthy();
		expect(plusBox).toBeTruthy();
		const titleMid = titleBox!.y + titleBox!.height / 2;
		const plusMid = plusBox!.y + plusBox!.height / 2;
		expect(Math.abs(titleMid - plusMid)).toBeLessThanOrEqual(3);
	});

	test('tabs match search inset below md', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		const tabs = page.getByTestId('category-kind-tabs');
		const search = page.getByTestId('category-search');
		const tabsBox = await tabs.boundingBox();
		const searchBox = await search.boundingBox();
		expect(tabsBox).toBeTruthy();
		expect(searchBox).toBeTruthy();
		expect(Math.abs(tabsBox!.x - searchBox!.x)).toBeLessThanOrEqual(2);
		expect(Math.abs(tabsBox!.x + tabsBox!.width - (searchBox!.x + searchBox!.width))).toBeLessThanOrEqual(
			2
		);
		expect(tabsBox!.width).toBeLessThanOrEqual(searchBox!.width + 2);
	});

	test('tap toggles hide below md without an eye button', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		const groceries = categoryChip(page, 'Groceries');
		await groceries.scrollIntoViewIfNeeded();
		await expect(groceries.getByTestId('category-hide')).toHaveCount(0);
		await groceries.click();
		await expect(groceries).toHaveAttribute('data-hidden', 'true');

		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await page.getByTestId('category-picker-search').fill('Groceries');
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toHaveCount(0);
		await page.keyboard.press('Escape');

		await page.goto('/categories');
		const groceriesAgain = categoryChip(page, 'Groceries');
		await groceriesAgain.scrollIntoViewIfNeeded();
		await groceriesAgain.click();
		await expect(groceriesAgain).not.toHaveAttribute('data-hidden', 'true');
	});

	test('long-press renames custom and does not hide it below md', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page
			.getByTestId('category-group-stock-group:food-drink')
			.getByTestId('category-add-in-group')
			.click();
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		const warung = categoryChip(page, 'Warung');
		await warung.scrollIntoViewIfNeeded();
		await expect(warung.getByTestId('category-edit-name')).toBeHidden();
		await longPress(warung);
		await expect(page.getByRole('textbox', { name: 'Name for Warung' })).toBeVisible();
		await expect(warung).not.toHaveAttribute('data-hidden', 'true');
	});

	test('long-press on stock does not toggle below md', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		const groceries = categoryChip(page, 'Groceries');
		await groceries.scrollIntoViewIfNeeded();
		await longPress(groceries);
		await expect(groceries).not.toHaveAttribute('data-hidden', 'true');
		await expect(page.getByRole('textbox', { name: 'Name for Groceries' })).toHaveCount(0);
	});

	test('desktop click on chip label does not toggle', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		const groceries = categoryChip(page, 'Groceries');
		await groceries.scrollIntoViewIfNeeded();
		await groceries.getByText('Groceries', { exact: true }).click();
		await expect(groceries).not.toHaveAttribute('data-hidden', 'true');
		await groceries.hover();
		await expect(groceries.getByTestId('category-hide')).toBeVisible();
	});

	test('reorder drop lands a group between two neighbors', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-reorder').click();
		const home = page.getByTestId('category-group-row-stock-group:home');
		const utilities = page.getByTestId('category-group-row-stock-group:utilities');
		const food = page.getByTestId('category-group-row-stock-group:food-drink');
		await expect(home).toBeVisible();
		const homeBox = await home.boundingBox();
		const utilitiesBox = await utilities.boundingBox();
		expect(homeBox).toBeTruthy();
		expect(utilitiesBox).toBeTruthy();
		expect(utilitiesBox!.y - (homeBox!.y + homeBox!.height)).toBeGreaterThanOrEqual(8);

		const handle = food.getByRole('button', { name: /Drag to reorder/ });
		const handleBox = await handle.boundingBox();
		expect(handleBox).toBeTruthy();
		const dropY = homeBox!.y + homeBox!.height + 4;
		const dropX = (homeBox!.x + homeBox!.width / 2);
		await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
		await page.mouse.down();
		await page.mouse.move(dropX, dropY, { steps: 24 });
		await page.mouse.up();

		const rows = page.locator('[data-testid^="category-group-row-"]');
		await expect(rows.nth(0)).toHaveAttribute('data-testid', 'category-group-row-stock-group:home');
		await expect(rows.nth(1)).toHaveAttribute(
			'data-testid',
			'category-group-row-stock-group:food-drink'
		);
		await expect(rows.nth(2)).toHaveAttribute(
			'data-testid',
			'category-group-row-stock-group:utilities'
		);
		await expect(page.getByTestId('category-reorder-save')).toBeEnabled();

		await page.getByTestId('category-reorder-discard').click();
		await page.getByTestId('category-reorder').click();
		const rowsAgain = page.locator('[data-testid^="category-group-row-"]');
		await expect(rowsAgain.nth(0)).toHaveAttribute(
			'data-testid',
			'category-group-row-stock-group:home'
		);
		await expect(rowsAgain.nth(1)).toHaveAttribute(
			'data-testid',
			'category-group-row-stock-group:utilities'
		);
		await expect(rowsAgain.nth(2)).toHaveAttribute(
			'data-testid',
			'category-group-row-stock-group:food-drink'
		);
	});

	test('form picker groups expense categories and filters by search', async ({ page }) => {
		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Expense', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		const foodDrink = page.getByTestId('picker-group-stock-group:food-drink');
		await foodDrink.scrollIntoViewIfNeeded();
		await expect(foodDrink).toBeVisible();
		const groceriesOption = page.getByRole('option', { name: 'Groceries', exact: true });
		await groceriesOption.scrollIntoViewIfNeeded();
		await expect(groceriesOption).toBeVisible();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toHaveCount(0);
		await page.getByTestId('category-picker-search').fill('groc');
		await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toBeVisible();
		await expect(page.getByTestId('picker-group-stock-group:home')).toHaveCount(0);
		await page.getByRole('option', { name: 'Groceries', exact: true }).click();
		await expect(sheet.getByTestId('tx-category')).toContainText('Groceries');
	});
});
