import { expect, test, type Locator, type Page } from '@playwright/test';
import { ensureCategory, expectXlFilterCardColumn, expectXlFilterCardTitleAndPadding, goToNav, selectPlanCategory, selectPlansFilterCategory } from './nav';

function planForm(page: Page): Locator {
	return page.getByTestId('plan-dialog').or(page.getByTestId('plan-sheet'));
}

function planRow(page: Page, list: 'home' | 'plans' | 'pocket', text: string): Locator {
	const prefix =
		list === 'home' ? 'home-plan-row-' : list === 'plans' ? 'plans-row-' : 'pocket-plan-row-';
	return page.locator(`button[data-testid^="${prefix}"]`).filter({ hasText: text });
}

function ymdOffset(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function ymdOnOrAfterWeekday(weekday: number): string {
	const d = new Date();
	const delta = (weekday - d.getDay() + 7) % 7;
	d.setDate(d.getDate() + delta);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

async function addPlan(
	page: Page,
	opts: {
		from: 'pocket' | 'plans';
		description?: string;
		amount: string;
		note?: string;
		dueOn?: string;
		repeat?: 'once' | 'weekly' | 'monthly';
		/** `null` leaves Uncategorized; omit to pick Food. */
		category?: string | null;
	}
): Promise<void> {
	if (opts.from === 'pocket') {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
		await page.getByTestId('pocket-details-add-plan').click();
	} else {
		await goToNav(page, 'plans');
		await page.getByTestId('plans-add').click();
	}
	const form = planForm(page);
	await expect(form).toBeVisible();
	if (opts.description) {
		await form.getByTestId('plan-description').fill(opts.description);
	}
	await form.getByTestId('plan-type-expense').click();
	await form.getByTestId('plan-amount').fill(opts.amount);
	if (opts.category !== null) {
		await selectPlanCategory(page, opts.category ?? 'Food', form);
	}
	if (opts.note) await form.getByTestId('plan-note').fill(opts.note);
	if (opts.dueOn) {
		await form.getByTestId('plan-due').locator('input[type="date"]').fill(opts.dueOn);
	}
	if (opts.repeat) {
		await form.getByTestId('plan-repeat').selectOption(opts.repeat);
	}
	await form.getByTestId('plan-save').click();
	await expect(form).toBeHidden({ timeout: 10_000 });
}

test.describe('223 / 224 Plans', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
	});

	test('nav order includes Plans; Home window hides far dues; pocket lists all', async ({
		page
	}) => {
		const rail = page.getByTestId('app-drawer-rail');
		const nav = rail.getByTestId('app-nav');
		await expect(nav.getByTestId('nav-home')).toBeVisible();
		const ids = await nav.locator('[data-testid^="nav-"]').evaluateAll((els) =>
			els.map((el) => el.getAttribute('data-testid'))
		);
		expect(ids).toEqual([
			'nav-home',
			'nav-pockets',
			'nav-transactions',
			'nav-plans',
			'nav-categories',
			'nav-settings'
		]);

		await addPlan(page, {
			from: 'pocket',
			description: 'Soon rent',
			amount: '1000000',
			note: 'landlord',
			dueOn: ymdOffset(3)
		});
		await addPlan(page, {
			from: 'pocket',
			description: 'Far rent',
			amount: '2000000',
			dueOn: ymdOffset(21)
		});

		await goToNav(page, 'home');
		await expect(page.getByTestId('home-plans-card')).toBeVisible();
		await expect(page.getByTestId('home-plans-list')).toContainText('Soon rent');
		await expect(page.getByTestId('home-plans-list')).not.toContainText('Far rent');

		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await expect(page.getByTestId('pocket-details-plans-card')).toBeVisible();
		await expect(page.getByTestId('pocket-details-plans-list')).toContainText('Soon rent');
		await expect(page.getByTestId('pocket-details-plans-list')).toContainText('Far rent');
	});

	test('Home click opens accept; Plans page always edits; Save posts Once', async ({ page }) => {
		await addPlan(page, {
			from: 'plans',
			description: 'Lunch',
			amount: '50000',
			dueOn: ymdOffset(1)
		});

		await goToNav(page, 'home');
		await page.locator('button[data-testid^="home-plan-row-"]').first().click();
		const accept = planForm(page);
		await expect(accept).toBeVisible();
		await expect(accept.getByTestId('plan-accept-form')).toBeVisible();
		await expect(accept.getByTestId('plan-skip')).toBeVisible();
		await expect(accept.getByTestId('plan-drop')).toHaveCount(0);
		await expect(accept.getByTestId('plan-save-for-next')).toHaveCount(0);
		await expect(accept.getByTestId('plan-repeat')).toHaveCount(0);
		await accept.getByTestId('plan-save').click();
		await expect(accept).toBeHidden({ timeout: 10_000 });
		await expect(page.getByTestId('home-plans-card')).toHaveCount(0);
		await expect(page.getByTestId('recent-list')).toContainText('Food');

		await addPlan(page, {
			from: 'plans',
			description: 'Edit me',
			amount: '25000',
			dueOn: ymdOffset(2)
		});
		await goToNav(page, 'plans');
		await planRow(page, 'plans', 'Edit me').click();
		const edit = planForm(page);
		await expect(edit.getByTestId('plan-edit-form')).toBeVisible();
		await expect(edit.getByTestId('plan-drop')).toBeVisible();
		await expect(edit.getByTestId('plan-skip')).toHaveCount(0);
		await edit.getByTestId('plan-amount').fill('26000');
		await edit.getByTestId('plan-save').click();
		await expect(edit).toBeHidden({ timeout: 10_000 });
		await goToNav(page, 'home');
		await expect(page.getByTestId('recent-list')).toContainText('Food');
		await expect(page.getByTestId('home-plans-list')).toContainText('Edit me');
	});

	test('Skip gravestones Once; Drop removes the plan; search hits description and note', async ({
		page
	}) => {
		await addPlan(page, {
			from: 'plans',
			description: 'Skip me',
			amount: '10000',
			dueOn: ymdOffset(0)
		});
		await goToNav(page, 'home');
		await planRow(page, 'home', 'Skip me').click();
		const accept = planForm(page);
		await accept.getByTestId('plan-skip').click();
		await page.getByTestId('plan-skip-confirm').click();
		await expect(accept).toBeHidden({ timeout: 10_000 });
		await expect(page.getByTestId('home-plans-card')).toHaveCount(0);
		await expect(page.getByTestId('recent-list')).toHaveCount(0);

		await addPlan(page, {
			from: 'plans',
			description: 'Rent',
			note: 'landlord',
			amount: '1500000',
			dueOn: ymdOffset(4)
		});
		await goToNav(page, 'plans');
		await page.getByTestId('plans-filter-search').fill('Rent');
		await expect(page.getByTestId('plans-list')).toContainText('Rent');
		await page.getByTestId('plans-filter-search').fill('landlord');
		await expect(page.getByTestId('plans-list')).toContainText('Rent');

		await planRow(page, 'plans', 'Rent').click();
		const edit = planForm(page);
		await edit.getByTestId('plan-drop').click();
		await page.getByTestId('plan-drop-confirm').click();
		await expect(edit).toBeHidden({ timeout: 10_000 });
		await expect(page.getByTestId('plans-empty').or(page.getByTestId('plans-empty-filtered'))).toBeVisible();
	});

	test('Repeat labels follow Due; chip on lists; Save for next; accept Save leaves template amount', async ({
		page
	}) => {
		await addPlan(page, {
			from: 'plans',
			description: 'Weekly chore',
			amount: '1000000',
			dueOn: ymdOnOrAfterWeekday(1),
			repeat: 'weekly'
		});
		await goToNav(page, 'plans');
		const row = planRow(page, 'plans', 'Weekly chore');
		await expect(row.locator('[data-testid$="-repeat"]')).toHaveText(/Weekly/);
		await expect(row.locator('[data-testid$="-repeat"]')).not.toContainText('on Monday');
		const descBox = await row.locator('[data-testid$="-description"]').boundingBox();
		const chipBox = await row.locator('[data-testid$="-repeat"]').boundingBox();
		expect(descBox && chipBox).toBeTruthy();
		expect((chipBox?.y ?? 0) + 1).toBeGreaterThanOrEqual((descBox?.y ?? 0) + (descBox?.height ?? 0) - 2);
		const infoBox = await row.locator('[data-testid$="-tx-info"]').boundingBox();
		const moneyBox = await row.locator('[data-testid$="-money"]').boundingBox();
		expect(infoBox && moneyBox).toBeTruthy();
		if (infoBox && moneyBox) {
			const infoMid = infoBox.y + infoBox.height / 2;
			const moneyMid = moneyBox.y + moneyBox.height / 2;
			expect(Math.abs(infoMid - moneyMid)).toBeLessThan(8);
		}

		await row.click();
		const edit = planForm(page);
		await expect(edit.getByTestId('plan-repeat')).toContainText('Weekly (on Monday)');
		await edit.getByTestId('plan-due').locator('input[type="date"]').fill(ymdOnOrAfterWeekday(4));
		await expect(edit.getByTestId('plan-repeat')).toContainText('Weekly (on Thursday)');
		await edit.getByTestId('plan-close').click();
		const discard = page.getByTestId('plan-discard-confirm');
		if (await discard.isVisible().catch(() => false)) {
			await discard.click();
		}

		await goToNav(page, 'home');
		const homeRow = planRow(page, 'home', 'Weekly chore');
		if ((await homeRow.count()) === 0) {
			await goToNav(page, 'pockets');
			await page.locator('[data-testid^="pocket-row-"]').first().click();
			await planRow(page, 'pocket', 'Weekly chore').click();
		} else {
			await homeRow.click();
		}
		const accept = planForm(page);
		await expect(accept.getByTestId('plan-save-for-next')).toBeVisible();
		await expect(accept.getByTestId('plan-save-for-next')).toBeDisabled();
		await expect(accept.getByTestId('plan-repeat')).toHaveClass(/font-medium/);
		await expect(accept.getByTestId('plan-save')).toBeEnabled();
		await accept.getByTestId('plan-amount').fill('1100000');
		await expect(accept.getByTestId('plan-save-for-next')).toBeEnabled();
		await accept.getByTestId('plan-save').click();
		await expect(accept).toBeHidden({ timeout: 10_000 });

		await goToNav(page, 'plans');
		await planRow(page, 'plans', 'Weekly chore').click();
		const again = planForm(page);
		await expect(again.getByTestId('plan-amount')).toHaveValue(/1,?000,?000/);
		await again.getByTestId('plan-close').click();
	});

	test('234 xl filters are a content-sized card beside chrome', async ({ page }) => {
		await goToNav(page, 'plans');
		await expect(page.getByTestId('plans-panel')).toBeVisible();
		await expect(page.getByTestId('plans-filters-open')).toHaveCount(0);
		await expect(page.getByTestId('plans-filters-sheet')).toHaveCount(0);
		await expect(page.getByTestId('plans-filters-close')).toHaveCount(0);
		await expectXlFilterCardColumn(page, {
			chrome: 'plans-chrome',
			drawer: 'plans-filters-drawer',
			panel: 'plans-panel'
		});
		await expectXlFilterCardTitleAndPadding(page, {
			drawer: 'plans-filters-drawer',
			title: 'plans-filters-title'
		});
	});

	test('Plans filters are type, category, and pocket (244)', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/plans');
		await expect(page.getByTestId('plans-panel')).toBeVisible();
		await page.getByTestId('plans-filters-open').click();
		const sheet = page.getByTestId('plans-filters-sheet');
		await expect(sheet).toBeVisible();
		await expect(sheet.getByTestId('plans-filter-type')).toBeVisible();
		await expect(sheet.getByTestId('plans-filter-pocket')).toBeVisible();
		await expect(sheet.getByTestId('plans-filter-category')).toHaveCount(0);
		await expect(sheet.getByTestId('activity-filter-category')).toHaveCount(0);
		await expect(sheet.getByTestId('activity-filter-show-voided')).toHaveCount(0);
		await expect(page.getByTestId('activity-range-trigger')).toHaveCount(0);
	});

	test.describe('244 category filter', () => {
		test.use({ viewport: { width: 1024, height: 800 } });

		async function closePlanFilterMenu(page: Page): Promise<void> {
			const typeMenu = page.getByTestId('plans-filter-type-expense');
			if (await typeMenu.isVisible()) {
				await page.getByTestId('plans-filter-type').click();
				await expect(typeMenu).toBeHidden();
			}
		}

		test('used Food appears; Groceries does not; Transfer disables; Apply filters', async ({
			page
		}) => {
			await addPlan(page, { from: 'plans', description: 'Food lunch', amount: '15000' });
			await addPlan(page, {
				from: 'plans',
				description: 'Bare note',
				amount: '5000',
				category: null
			});

			await goToNav(page, 'plans');
			await page.getByTestId('plans-filters-open').click();
			const sheet = page.getByTestId('plans-filters-sheet');
			await expect(sheet).toBeVisible();
			await expect(sheet.getByTestId('plans-filter-category')).toBeVisible();
			await page.getByTestId('plans-filter-category').click();
			await expect(page.getByRole('option', { name: 'Food', exact: true })).toBeVisible();
			await expect(page.getByRole('option', { name: 'Groceries', exact: true })).toHaveCount(0);
			await page.keyboard.press('Escape');

			await page.getByTestId('plans-filter-type').click();
			const transfer = page.getByTestId('plans-filter-type-transfer');
			await expect(transfer).toBeVisible();
			await transfer.click({ force: true });
			await expect(transfer).toHaveAttribute('data-checked', 'true');
			await closePlanFilterMenu(page);
			await expect(page.getByTestId('plans-filter-category')).toBeDisabled();
			await expect(page.getByTestId('plans-filter-category')).toContainText('All');

			await page.getByTestId('plans-filters-clear').click();
			await expect(page.getByTestId('plans-filter-category')).toBeEnabled();

			await selectPlansFilterCategory(page, 'Food');
			await page.getByTestId('plans-filter-category').click();
			await expect(page.getByRole('option', { name: 'Food', exact: true })).toBeHidden();
			await page.getByTestId('plans-filters-apply').click();
			await expect(sheet).toBeHidden();
			await expect(page.getByTestId('plans-list')).toContainText('Food lunch');
			await expect(page.getByTestId('plans-list')).not.toContainText('Bare note');
		});
	});

	test.describe('243 dirty leave keep-open', () => {
		test.use({ viewport: { width: 1024, height: 800 } });

		async function dirtyPlanFilters(page: Page): Promise<void> {
			await goToNav(page, 'plans');
			await page.getByTestId('plans-filters-open').click();
			const sheet = page.getByTestId('plans-filters-sheet');
			await expect(sheet).toBeVisible();
			await page.getByTestId('plans-filter-type').click();
			const expense = page.getByTestId('plans-filter-type-expense');
			await expect(expense).toBeVisible();
			await expense.click({ force: true });
			await expect(expense).toHaveAttribute('data-checked', 'true');
			await page.getByTestId('plans-filter-type').click();
			await expect(expense).toBeHidden();
		}

		test('dirty overlay and Escape keep the sheet; Keep editing stays; Discard reopens', async ({
			page
		}) => {
			await dirtyPlanFilters(page);
			const sheet = page.getByTestId('plans-filters-sheet');
			await page.locator('[data-slot="sheet-overlay"]').click({ position: { x: 8, y: 8 } });
			await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeVisible();
			await expect(sheet).toBeVisible();
			await page.getByTestId('confirm-dialog-cancel').click();
			await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeHidden();
			await expect(sheet).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(page.getByRole('heading', { name: 'Discard filter changes?' })).toBeVisible();
			await expect(sheet).toBeVisible();
			await page.getByTestId('plans-filters-discard-confirm').click();
			await expect(sheet).toBeHidden();
			await page.getByTestId('plans-filters-open').click();
			await expect(sheet).toBeVisible();
		});

		test('overlay and Escape close a clean Filters sheet', async ({ page }) => {
			await goToNav(page, 'plans');
			await page.getByTestId('plans-filters-open').click();
			const sheet = page.getByTestId('plans-filters-sheet');
			await expect(sheet).toBeVisible();
			await page.locator('[data-slot="sheet-overlay"]').click({ position: { x: 8, y: 8 } });
			await expect(sheet).toBeHidden();

			await page.getByTestId('plans-filters-open').click();
			await expect(sheet).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(sheet).toBeHidden();
		});
	});

	test('232 dialog is shorter than the viewport with sticky save; 233 Due min is today', async ({
		page
	}) => {
		await goToNav(page, 'plans');
		await page.getByTestId('plans-add').click();
		const form = planForm(page);
		await expect(form).toBeVisible();
		const today = ymdOffset(0);
		await expect(form.getByTestId('plan-due').locator('input[type="date"]')).toHaveAttribute(
			'min',
			today
		);

		const dialog = page.getByTestId('plan-dialog');
		const box = await dialog.boundingBox();
		const vp = page.viewportSize();
		expect(box && vp).toBeTruthy();
		if (box && vp) {
			expect(box.height).toBeLessThan(vp.height - 16);
			expect(box.y).toBeGreaterThanOrEqual(8);
		}
		const heading = dialog.getByRole('heading', { name: 'Add plan' });
		await expect(heading).toBeVisible();
		await expect(dialog.getByTestId('plan-save')).toBeVisible();
		const headerY = (await heading.boundingBox())?.y;
		await dialog.locator('.overflow-y-auto').evaluate((el) => {
			el.scrollTop = 80;
		});
		const afterY = (await heading.boundingBox())?.y;
		expect(Math.abs((afterY ?? 0) - (headerY ?? 0))).toBeLessThan(4);
		await expect(dialog.getByTestId('plan-save')).toBeVisible();
		await dialog.getByTestId('plan-close').click();
	});
});
