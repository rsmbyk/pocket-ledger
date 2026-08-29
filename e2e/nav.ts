import { expect, type Locator, type Page } from '@playwright/test';

/** Navigate via the app drawer (desktop rail) or overlay sheet (mobile). */
export async function goToNav(
	page: Page,
	dest: 'home' | 'activity' | 'pockets' | 'categories' | 'more'
): Promise<void> {
	const rail = page.getByTestId('app-drawer-rail');
	const sheet = page.getByTestId('app-drawer-sheet');
	const menu = page.getByTestId('open-menu');

	await Promise.race([
		rail.waitFor({ state: 'attached', timeout: 10_000 }),
		menu.waitFor({ state: 'visible', timeout: 10_000 })
	]);

	const railBox = await rail.boundingBox().catch(() => null);
	const railOnScreen = Boolean(railBox && railBox.x >= 0 && railBox.width > 40);

	if (railOnScreen) {
		await rail.getByTestId(`nav-${dest}`).click();
		return;
	}

	await menu.click();

	if (await sheet.isVisible().catch(() => false)) {
		await sheet.getByTestId(`nav-${dest}`).click();
		return;
	}

	await rail.waitFor({ state: 'visible', timeout: 10_000 });
	await rail.getByTestId(`nav-${dest}`).click();
}

/** Open add via Recent header or command palette (no empty-state CTAs). */
export async function openAdd(page: Page): Promise<void> {
	await page.getByTestId('app-shell').waitFor({ state: 'visible', timeout: 10_000 });

	const recentAdd = page.getByTestId('recent-add');
	if (await recentAdd.isVisible().catch(() => false)) {
		await recentAdd.click();
		return;
	}

	await page.keyboard.press('Control+K');
	await page.getByTestId('command-palette').waitFor({ state: 'visible', timeout: 5_000 });
	await page.getByTestId('cmd-add').click();
}

/** Pick a category from the searchable tx category combobox. */
export async function selectTxCategory(page: Page, name: string, root?: Locator): Promise<void> {
	const scope = root ?? page;
	await scope.getByTestId('tx-category').click();
	const search = page.getByTestId('category-picker-search');
	await search.waitFor({ state: 'visible', timeout: 5_000 });
	await search.fill(name);
	await page.getByRole('option', { name, exact: true }).click();
}

/** Pick a category from the Activity filter CategoryPicker. */
export async function selectActivityFilterCategory(page: Page, name: string): Promise<void> {
	await page.getByTestId('activity-filter-category').click();
	const search = page.getByTestId('category-picker-search');
	await search.waitFor({ state: 'visible', timeout: 5_000 });
	await search.fill(name);
	await page.getByRole('option', { name, exact: true }).click();
}

/** Confirm the in-app void ConfirmDialog. */
export async function confirmVoid(page: Page): Promise<void> {
	await page.getByTestId('tx-void-confirm').click();
}

/** Create a custom category via the group add chip, or no-op when the name is stock. */
export async function ensureCategory(
	page: Page,
	name: string,
	kind: 'expense' | 'income'
): Promise<void> {
	await page.goto('/categories');
	await expect(page.getByTestId('categories-panel')).toBeVisible();
	const chip = page.getByTestId('category-chip').filter({ hasText: new RegExp(`^${name}$`) });
	if ((await chip.count()) === 0) {
		const list = page.getByTestId(kind === 'expense' ? 'category-list-expense' : 'category-list-income');
		await list.getByTestId('category-add-in-group').last().click();
		await page.getByTestId('category-name-input').fill(name);
		await page.getByTestId('category-add').click();
		await expect(chip).toBeVisible();
	}
	await page.goto('/');
	await expect(page.getByTestId('home-panel')).toBeVisible();
}
