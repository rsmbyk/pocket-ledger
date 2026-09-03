import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('013 desktop layout', () => {
	test('wide viewport uses app rail, page title, and dialog add', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();

		await expect(page.getByTestId('app-drawer-rail')).toBeVisible();
		await expect(page.getByTestId('open-menu')).toBeVisible();
		await expect(page.getByTestId('page-title')).toHaveText('Home');
		await expect(page.getByTestId('balance-hero')).toBeVisible();
		await expect(page.getByTestId('month-summary')).toBeVisible();
		await expect(page.getByTestId('recent-card')).toBeVisible();
		await expect(page.getByTestId('nav-home')).toHaveAttribute('aria-current', 'page');
		await expect(page.getByTestId('toolbar-add')).toHaveCount(0);
		await expect(page.getByTestId('open-command')).toHaveCount(0);
		await expect(page.getByTestId('stage-context')).toHaveCount(0);

		await openAdd(page);
		await expect(page.getByTestId('tx-dialog')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();
	});

	test('narrow viewport uses overlay drawer and bottom sheet', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await expect(page.getByTestId('page-title')).toHaveText('Home');
		await expect(page.getByTestId('app-shell')).toBeVisible();

		await expect(page.getByTestId('app-drawer-rail')).toBeHidden();
		await expect(page.getByTestId('open-menu')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Add transaction' })).toHaveCount(0);

		await openAdd(page);
		await expect(page.getByTestId('tx-sheet')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Add transaction' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('tx-sheet')).toBeHidden();

		await page.getByTestId('open-menu').click();
		await expect(page.getByTestId('app-drawer-sheet')).toBeVisible();
		await expect(page.getByTestId('app-drawer-sheet').getByText('Pocket Ledger')).toBeVisible();
		await expect(
			page.getByTestId('app-drawer-sheet').getByRole('heading', { name: 'Main' })
		).toHaveCount(0);
		await page.getByTestId('nav-transactions').click();
		await expect(page).toHaveURL(/\/transactions\/?$/);
		await expect(page.getByTestId('app-drawer-sheet')).toBeHidden();
		await expect(page.getByTestId('page-title')).toHaveText('Transactions');
	});

	test('drawer shows app icon and flat nav without add', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		const rail = page.getByTestId('app-drawer-rail');
		await expect(rail.locator('img[src="/favicon.svg"]')).toBeVisible();
		await expect(rail.getByText('Pocket Ledger')).toBeVisible();
		await expect(rail.getByRole('heading', { name: 'Main' })).toHaveCount(0);
		await expect(rail.getByText('Menu', { exact: true })).toBeHidden();
		await expect(rail.getByTestId('nav-add')).toHaveCount(0);
	});

	test('mobile drawer sheet matches flat nav rules', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await page.getByTestId('open-menu').click();

		const sheet = page.getByTestId('app-drawer-sheet');
		await expect(sheet).toBeVisible();
		await expect(sheet.locator('img[src="/favicon.svg"]')).toBeVisible();
		await expect(sheet.getByText('Menu', { exact: true })).toBeHidden();
		await expect(sheet.getByTestId('nav-add')).toHaveCount(0);
	});

	test('categories shows one kind at a time on a wide viewport', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await goToNav(page, 'categories');
		await expect(page.getByTestId('page-title')).toHaveText('Categories');
		await expect(page.getByTestId('categories-desktop-grid')).toBeVisible();
		await expect(page.getByTestId('category-list-income')).toBeVisible();
		await expect(page.getByTestId('category-list-expense')).toHaveCount(0);
		await expect(page.getByTestId('category-kind-tabs')).toBeVisible();
	});

	test('categories uses the full inset width', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		const homeWidth = await page.getByTestId('app-stage').evaluate((el) => el.getBoundingClientRect().width);
		await goToNav(page, 'categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		const categoriesWidth = await page
			.getByTestId('app-stage')
			.evaluate((el) => el.getBoundingClientRect().width);
		expect(categoriesWidth).toBeGreaterThan(homeWidth + 40);
	});

	test('categories stays viewport-tall instead of lengthening the document', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
		await page.getByTestId('category-kind-expense').click();
		await expect(page.getByTestId('category-chip').first()).toBeVisible();

		const metrics = await page.evaluate(() => {
			const grid = document.querySelector('[data-testid="categories-desktop-grid"]');
			const tabs = document.querySelector('[data-testid="category-kind-tabs"]');
			return {
				docOverflow: document.documentElement.scrollHeight - window.innerHeight,
				tabsBottom: tabs?.getBoundingClientRect().bottom ?? 0,
				gridScrollable: Boolean(grid && grid.scrollHeight > grid.clientHeight + 8)
			};
		});

		expect(metrics.docOverflow).toBeLessThanOrEqual(8);
		expect(metrics.tabsBottom).toBeGreaterThan(0);
		expect(metrics.tabsBottom).toBeLessThanOrEqual(800);
		expect(metrics.gridScrollable).toBe(true);
	});

	test('category chips in a group share one width', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await page.getByTestId('category-kind-expense').click();
		await expect(page.getByTestId('category-chip').first()).toBeVisible();

		const widths = await page.evaluate(() => {
			const groups = [
				...document.querySelectorAll(
					'[data-testid="category-list-expense"] [data-testid^="category-group-"]'
				)
			];
			for (const group of groups) {
				const chips = [...group.querySelectorAll('[data-testid="category-chip"]')];
				if (chips.length < 2) continue;
				return chips.map((el) => Math.round(el.getBoundingClientRect().width));
			}
			return [];
		});

		expect(widths.length).toBeGreaterThan(1);
		expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
	});

	test('category search lines up with the catalog cards', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/categories');
		await page.getByTestId('category-kind-expense').click();
		await expect(page.getByTestId('category-chip').first()).toBeVisible();

		const inset = await page.evaluate(() => {
			const search = document.querySelector('[data-testid="category-search"]');
			const scroller = document.querySelector('[data-testid="categories-desktop-grid"]');
			const card = scroller?.querySelector('[data-slot="card"]');
			if (!search || !scroller || !card) return null;
			const q = search.getBoundingClientRect();
			const c = card.getBoundingClientRect();
			const s = scroller.getBoundingClientRect();
			return {
				searchLeft: q.left,
				cardLeft: c.left,
				scrollerLeft: s.left,
				searchWidth: q.width,
				cardRowRight: c.right
			};
		});

		expect(inset).not.toBeNull();
		expect(Math.abs(inset!.searchLeft - inset!.cardLeft)).toBeLessThanOrEqual(8);
		expect(inset!.searchLeft).toBeGreaterThanOrEqual(inset!.scrollerLeft - 1);
	});

	test('command palette navigates and opens add', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();

		await page.keyboard.press('Control+K');
		await expect(page.getByTestId('command-palette')).toBeVisible();
		await page.getByTestId('cmd-transactions').click();
		await expect(page).toHaveURL(/\/transactions\/?$/);
		await expect(page.getByTestId('page-title')).toHaveText('Transactions');

		await page.keyboard.press('Control+K');
		await expect(page.getByTestId('command-palette')).toBeVisible();
		await page.getByTestId('cmd-add').click();
		await expect(page.getByTestId('tx-dialog')).toBeVisible();
	});

	test('activity uses a stacked list', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByTestId('tx-dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByTestId('tx-save').click();

		await goToNav(page, 'transactions');
		await expect(page.getByTestId('activity-list').getByRole('columnheader')).toHaveCount(0);
		await expect(page.getByTestId('activity-list')).toContainText('Food');
		await expect(page.getByTestId('activity-sort-open')).toHaveCount(0);
		await expect(page.getByTestId('activity-filters-open')).toHaveCount(0);
	});
});
