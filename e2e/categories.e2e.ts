import { expect, test, type Page } from '@playwright/test';
import {
	categoryChip,
	dragCategoryGroup,
	openAdd,
	selectCategoriesKind,
	selectTxCategory
} from './nav';

async function expectRowBefore(page: Page, firstId: string, secondId: string): Promise<void> {
	const first = page.getByTestId(`category-group-row-${firstId}`);
	const second = page.getByTestId(`category-group-row-${secondId}`);
	await expect(first).toBeVisible();
	await expect(second).toBeVisible();
	const a = await first.boundingBox();
	const b = await second.boundingBox();
	expect(a && b && a.y < b.y).toBe(true);
}

async function expectFirstGroup(
	page: Page,
	kind: 'income' | 'expense',
	groupId: string
): Promise<void> {
	const list = page.getByTestId(`category-list-${kind}`);
	await expect(list.locator('[data-testid^="category-group-"]').first()).toHaveAttribute(
		'data-testid',
		`category-group-${groupId}`
	);
}

test.describe('123 overlay catalog / 124–125 categories chrome', () => {
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

	test('reorder keeps both kind drafts and Discard restores view', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-reorder').click();
		await dragCategoryGroup(page, 'stock-group:utilities', 'stock-group:home');
		await expect(page.getByTestId('category-reorder-save')).toBeEnabled();
		await expectRowBefore(page, 'stock-group:utilities', 'stock-group:home');
		await selectCategoriesKind(page, 'income');
		await expect(page.getByTestId('category-reorder-leave-confirm')).toHaveCount(0);
		await expect(page.getByTestId('category-group-row-stock-group:work')).toBeVisible();
		await dragCategoryGroup(page, 'stock-group:work', 'stock-group:business-creating');
		await selectCategoriesKind(page, 'expense');
		await expectRowBefore(page, 'stock-group:utilities', 'stock-group:home');
		await page.getByTestId('category-reorder-discard').click();
		await expect(page.getByTestId('category-chip').first()).toBeVisible();
		await expectFirstGroup(page, 'expense', 'stock-group:home');
	});

	test('reorder Save persists both kinds', async ({ page }) => {
		await page.goto('/categories');
		await selectCategoriesKind(page, 'expense');
		await page.getByTestId('category-reorder').click();
		await dragCategoryGroup(page, 'stock-group:utilities', 'stock-group:home');
		await selectCategoriesKind(page, 'income');
		await dragCategoryGroup(page, 'stock-group:work', 'stock-group:business-creating');
		await page.getByTestId('category-reorder-save').click();
		await expect(page.getByTestId('category-chip').first()).toBeVisible();
		await expect(page.getByTestId('category-kind-income')).toHaveAttribute('aria-selected', 'true');
		await expectFirstGroup(page, 'income', 'stock-group:business-creating');
		await selectCategoriesKind(page, 'expense');
		await expectFirstGroup(page, 'expense', 'stock-group:utilities');
		await page.reload();
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await selectCategoriesKind(page, 'expense');
		await expectFirstGroup(page, 'expense', 'stock-group:utilities');
		await selectCategoriesKind(page, 'income');
		await expectFirstGroup(page, 'income', 'stock-group:business-creating');
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
