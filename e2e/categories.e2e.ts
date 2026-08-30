import { expect, test, type Page } from '@playwright/test';
import {
	categoryChip,
	clickCategoryGroupAdd,
	longPress,
	openAdd,
	selectCategoriesKind,
	selectTxCategory
} from './nav';

async function firstRowCount(
	page: Page,
	parentTestId: string,
	childSelector: string
): Promise<number> {
	return page.evaluate(
		({ parentTestId, childSelector }) => {
			const parent = document.querySelector(`[data-testid="${parentTestId}"]`);
			if (!parent) return 0;
			const kids = [...parent.querySelectorAll(childSelector)];
			if (kids.length === 0) return 0;
			const top = kids[0]!.getBoundingClientRect().top;
			return kids.filter((el) => Math.abs(el.getBoundingClientRect().top - top) < 4).length;
		},
		{ parentTestId, childSelector }
	);
}

function groupCardByTitle(page: Page, title: string) {
	return page
		.locator('[data-testid^="category-group-"]')
		.filter({ has: page.getByTestId('category-add-in-group') })
		.filter({
			has: page.getByTestId('category-group-name').filter({ hasText: new RegExp(`^${title}$`) })
		});
}

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
		await clickCategoryGroupAdd(page.getByTestId('category-group-stock-group:food-drink'));
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
		await clickCategoryGroupAdd(page.getByTestId('category-group-stock-group:food-drink'));
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
		await expect(groupCardByTitle(page, 'Side')).toBeVisible();
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
		const header = card.locator('[data-slot=card-header]');
		await header.hover();
		const title = card.getByTestId('category-group-name');
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
		await clickCategoryGroupAdd(page.getByTestId('category-group-stock-group:food-drink'));
		await page.getByTestId('category-name-input').fill('Warung');
		await page.getByTestId('category-add').click();
		const warung = categoryChip(page, 'Warung');
		await warung.scrollIntoViewIfNeeded();
		await expect(warung.getByTestId('category-hide')).toHaveCount(0);
		await expect(warung.getByTestId('category-edit-name')).toHaveClass(/sr-only/);
		await longPress(warung.getByRole('button', { name: 'Hide Warung' }));
		const renameField = page.getByRole('textbox', { name: 'Name for Warung' });
		await expect(renameField).toBeVisible();
		await expect(
			page.getByTestId('category-chip').filter({ has: renameField })
		).not.toHaveAttribute('data-hidden', 'true');
	});

	test('long-press on stock does not toggle below md', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		const groceries = categoryChip(page, 'Groceries');
		await groceries.scrollIntoViewIfNeeded();
		await longPress(groceries.getByRole('button', { name: 'Hide Groceries' }));
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

	test('form picker search matches a group label and shows every member', async ({ page }) => {
		await page.goto('/');
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByRole('button', { name: 'Income', exact: true }).click();
		await sheet.getByTestId('tx-category').click();
		await page.getByTestId('category-picker-search').fill('work');
		await expect(page.getByTestId('picker-group-stock-group:work')).toBeVisible();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Bonus', exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Interest', exact: true })).toHaveCount(0);
		await page.getByTestId('category-picker-search').fill('zzzz');
		await expect(page.getByText('No matching categories.')).toBeVisible();
		await expect(page.getByRole('option', { name: 'Salary', exact: true })).toHaveCount(0);
	});

	test('tablet sidebar keeps one group column and two chip columns', async ({ page }) => {
		await page.setViewportSize({ width: 834, height: 1112 });
		await page.goto('/categories');
		await expect(page.getByTestId('app-drawer-rail')).toBeVisible();
		await expect(page.getByTestId('category-group-stock-group:work')).toBeVisible();
		expect(
			await firstRowCount(page, 'category-list-income', ':scope > [data-testid^="category-group-"]')
		).toBe(1);
		expect(
			await firstRowCount(page, 'category-group-stock-group:work', '[data-testid="category-chip"]')
		).toBe(2);
		const commission = categoryChip(page, 'Commission');
		await commission.scrollIntoViewIfNeeded();
		const clipped = await commission.locator('span.truncate').evaluate((el) => {
			return el.scrollWidth > el.clientWidth + 1;
		});
		expect(clipped).toBe(false);
	});

	test('wide catalog prefers a second group before a third chip column', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await expect(page.getByTestId('category-group-stock-group:work')).toBeVisible();
		expect(
			await firstRowCount(page, 'category-list-income', ':scope > [data-testid^="category-group-"]')
		).toBeGreaterThanOrEqual(2);
		expect(
			await firstRowCount(page, 'category-group-stock-group:work', '[data-testid="category-chip"]')
		).toBe(2);
	});

	test('very wide catalog can show four group columns', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/categories');
		await expect(page.getByTestId('category-group-stock-group:work')).toBeVisible();
		expect(
			await firstRowCount(page, 'category-list-income', ':scope > [data-testid^="category-group-"]')
		).toBe(4);
	});

	test('phone toolbar stretches Add group and Reorder; desktop hugs', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		const add = page.getByTestId('category-add-group');
		const reorder = page.getByTestId('category-reorder');
		const search = page.getByTestId('category-search');
		const addBox = await add.boundingBox();
		const reorderBox = await reorder.boundingBox();
		const searchBox = await search.boundingBox();
		expect(addBox).toBeTruthy();
		expect(reorderBox).toBeTruthy();
		expect(searchBox).toBeTruthy();
		expect(Math.abs(addBox!.width - reorderBox!.width)).toBeLessThanOrEqual(2);
		const pairLeft = Math.min(addBox!.x, reorderBox!.x);
		const pairRight = Math.max(addBox!.x + addBox!.width, reorderBox!.x + reorderBox!.width);
		expect(Math.abs(pairLeft - searchBox!.x)).toBeLessThanOrEqual(2);
		expect(Math.abs(pairRight - (searchBox!.x + searchBox!.width))).toBeLessThanOrEqual(2);

		await reorder.click();
		const save = page.getByTestId('category-reorder-save');
		const saveBox = await save.boundingBox();
		const grid = page.getByTestId('categories-desktop-grid');
		const gridBox = await grid.boundingBox();
		expect(saveBox).toBeTruthy();
		expect(gridBox).toBeTruthy();
		expect(saveBox!.width).toBeLessThan(gridBox!.width * 0.4);
		await page.getByTestId('category-reorder-discard').click();

		await page.setViewportSize({ width: 1024, height: 800 });
		await page.goto('/categories');
		const addWide = await page.getByTestId('category-add-group').boundingBox();
		const searchWide = await page.getByTestId('category-search').boundingBox();
		expect(addWide).toBeTruthy();
		expect(searchWide).toBeTruthy();
		expect(addWide!.width).toBeLessThan(searchWide!.width / 2);
	});

	test('desktop group header reveals hide, rename, and add on hover', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-add-group').click();
		await page.getByTestId('category-group-name-input').fill('Side hustle');
		await page.getByTestId('category-group-add').click();
		const custom = groupCardByTitle(page, 'Side hustle');
		await expect(custom).toBeVisible();
		const addWrap = custom.getByTestId('category-group-add-wrap');
		expect(Number(await addWrap.evaluate((el) => getComputedStyle(el).opacity))).toBe(0);
		await custom.locator('[data-slot=card-header]').hover();
		expect(Number(await addWrap.evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
		await expect(custom.getByTestId('category-group-hide')).toBeVisible();
		await expect(custom.getByTestId('category-group-edit')).toBeVisible();

		const work = page.getByTestId('category-group-stock-group:work');
		await page.getByTestId('category-kind-income').click();
		await work.locator('[data-slot=card-header]').hover();
		await expect(work.getByTestId('category-group-hide')).toBeVisible();
		await expect(work.getByTestId('category-add-in-group')).toBeVisible();
		await expect(work.getByTestId('category-group-edit')).toHaveCount(0);
		await work.getByTestId('category-group-hide').click();
		await expect(work).toHaveAttribute('data-group-hidden', 'true');
		await expect(categoryChip(page, 'Salary')).toHaveAttribute('data-hidden', 'true');
		await work.locator('[data-slot=card-header]').hover();
		await work.getByTestId('category-group-show').click();
		await expect(work).not.toHaveAttribute('data-group-hidden', 'true');
	});

	test('desktop pencil renames a custom group', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-add-group').click();
		await page.getByTestId('category-group-name-input').fill('Side hustle');
		await page.getByTestId('category-group-add').click();
		const custom = groupCardByTitle(page, 'Side hustle');
		await custom.locator('[data-slot=card-header]').hover();
		await custom.getByTestId('category-group-edit').click();
		await expect(page.getByTestId('category-rename-group-dialog')).toBeVisible();
		await page.getByTestId('category-rename-group-name-input').fill('Gig work');
		await page.getByTestId('category-rename-group-save').click();
		await expect(page.getByTestId('category-rename-group-dialog')).toHaveCount(0);
		await expect(groupCardByTitle(page, 'Gig work')).toBeVisible();
	});

	test('phone group name click renames custom; hold toggles hide', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-add-group').click();
		await page.getByTestId('category-group-name-input').fill('Side hustle');
		await page.getByTestId('category-group-add').click();
		const custom = groupCardByTitle(page, 'Side hustle');
		await expect(custom.getByTestId('category-add-in-group')).toBeVisible();
		await expect(custom.getByTestId('category-group-hide')).toHaveCount(0);
		await expect(custom.getByTestId('category-group-edit')).toHaveCount(0);
		await clickCategoryGroupAdd(custom);
		await page.getByTestId('category-name-input').fill('Gig');
		await page.getByTestId('category-add').click();

		await custom.getByTestId('category-group-name').click();
		await expect(page.getByTestId('category-rename-group-dialog')).toBeVisible();
		await page.getByRole('button', { name: 'Cancel' }).click();

		await longPress(custom.getByTestId('category-group-name'));
		await expect(page.getByTestId('category-rename-group-dialog')).toHaveCount(0);
		await expect(custom).toHaveAttribute('data-group-hidden', 'true');
	});

	test('phone stock name click does not rename; hold hides the group', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		const work = page.getByTestId('category-group-stock-group:work');
		await work.getByTestId('category-group-name').click();
		await expect(page.getByTestId('category-rename-group-dialog')).toHaveCount(0);
		await longPress(work.getByTestId('category-group-name'));
		await expect(work).toHaveAttribute('data-group-hidden', 'true');
	});
});
