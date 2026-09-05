import { expect, type Locator, type Page } from '@playwright/test';

/** Hold the primary button on a locator's center (Spec 126 long-press). */
export async function longPress(locator: Locator, holdMs = 600): Promise<void> {
	await locator.evaluate((el, ms) => {
		const rect = el.getBoundingClientRect();
		const clientX = rect.left + rect.width / 2;
		const clientY = rect.top + rect.height / 2;
		const opts: PointerEventInit = {
			bubbles: true,
			cancelable: true,
			button: 0,
			buttons: 1,
			clientX,
			clientY,
			pointerId: 1,
			pointerType: 'touch'
		};
		el.dispatchEvent(new PointerEvent('pointerdown', opts));
		return new Promise<void>((resolve) => {
			window.setTimeout(() => {
				el.dispatchEvent(
					new PointerEvent('pointerup', { ...opts, buttons: 0 })
				);
				resolve();
			}, ms);
		});
	}, holdMs);
}

/** Navigate via the app drawer (desktop rail) or overlay sheet (mobile). */
export async function goToNav(
	page: Page,
	dest: 'home' | 'transactions' | 'pockets' | 'categories' | 'more' | 'settings'
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
	const navDest = dest === 'more' ? 'settings' : dest;

	if (railOnScreen) {
		await rail.getByTestId(`nav-${navDest}`).click();
		return;
	}

	await menu.click();

	if (await sheet.isVisible().catch(() => false)) {
		await sheet.getByTestId(`nav-${navDest}`).click();
		return;
	}

	await rail.waitFor({ state: 'visible', timeout: 10_000 });
	await rail.getByTestId(`nav-${navDest}`).click();
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

/** Category row on `/categories` (exact name, not substring). */
export function categoryChip(page: Page, name: string): Locator {
	return page.getByTestId('category-chip').filter({ has: page.getByText(name, { exact: true }) });
}

/** Switch Categories Income | Expenses tab. */
export async function selectCategoriesKind(
	page: Page,
	kind: 'expense' | 'income'
): Promise<void> {
	const tab = page.getByTestId(kind === 'expense' ? 'category-kind-expense' : 'category-kind-income');
	await tab.click();
	await expect(tab).toHaveAttribute('aria-selected', 'true');
}

/** Hover the group header (md+ actions are pointer-events-none until then), then click plus. */
export async function clickCategoryGroupAdd(group: Locator): Promise<void> {
	const add = group.getByTestId('category-add-in-group');
	await add.scrollIntoViewIfNeeded();
	await add.locator('xpath=ancestor::*[@data-slot="card-header"]').hover();
	await add.click();
}

/** Create a custom category via the group header plus, or no-op when the name is stock. */
export async function ensureCategory(
	page: Page,
	name: string,
	kind: 'expense' | 'income'
): Promise<void> {
	await page.goto('/categories');
	await expect(page.getByTestId('categories-panel')).toBeVisible();
	await selectCategoriesKind(page, kind);
	const chip = categoryChip(page, name);
	if ((await chip.count()) === 0) {
		const add = page.getByTestId('category-add-in-group').last();
		await add.scrollIntoViewIfNeeded();
		await add.locator('xpath=ancestor::*[@data-slot="card-header"]').hover();
		await add.click();
		await expect(page.getByTestId('category-name-input')).toBeVisible();
		await page.getByTestId('category-name-input').fill(name);
		await page.getByTestId('category-add').click();
		await chip.scrollIntoViewIfNeeded();
		await expect(chip).toBeVisible();
	}
	await page.goto('/');
	await expect(page.getByTestId('home-panel')).toBeVisible();
}

/** Open the pocket form via details toolbar Edit (149: no list pencil). */
export async function openPocketEditFromList(page: Page, row: Locator): Promise<void> {
	await row.click();
	await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
	await page.getByTestId('pocket-details-edit').click();
	await expect(page.getByTestId('pocket-form-dialog')).toBeVisible();
}

/** Add a goal from pocket details (152). Details must already be visible. */
export async function addPocketGoal(
	page: Page,
	opts: { target: string; description?: string; dated?: boolean }
): Promise<void> {
	await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
	await page.getByTestId('pocket-details-add-goal').click();
	const dialog = page.getByTestId('pocket-goal-form-dialog');
	await expect(dialog).toBeVisible();
	if (opts.description) {
		await page.getByTestId('pocket-goal-description-input').fill(opts.description);
	}
	await page.getByTestId('pocket-goal-target-input').fill(opts.target);
	if (opts.dated) {
		await page.getByTestId('pocket-goal-date-enabled').check();
	}
	await page.getByTestId('pocket-goal-save').click();
	await expect(dialog).toBeHidden();
}

/** Copy/download then ack the hex kit (202). Download avoids clipboard in CI. */
export async function confirmHexKit(page: Page): Promise<void> {
	await expect(page.getByTestId('hex-kit-screen')).toBeVisible();
	await page.getByTestId('hex-kit-download').click();
	await page.getByTestId('hex-kit-stored').check();
	await page.getByTestId('hex-kit-confirm').click();
}

/** Open the add-category dialog from the selected kind's first group plus. */
export async function openAddCategory(page: Page, kind: 'expense' | 'income'): Promise<void> {
	await selectCategoriesKind(page, kind);
	const add = page.getByTestId('category-add-in-group').first();
	await add.scrollIntoViewIfNeeded();
	await add.locator('xpath=ancestor::*[@data-slot="card-header"]').hover();
	await add.click();
	await expect(page.getByTestId('category-add-dialog')).toBeVisible();
}
