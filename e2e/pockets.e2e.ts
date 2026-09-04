import { expect, test, type Page } from '@playwright/test';
import { addPocketGoal, ensureCategory, goToNav, openAdd, openPocketEditFromList, selectTxCategory } from './nav';

/** Name + description + goal so the list card is tall (149/151). Goal is details-only (152). */
async function createTallVacationPocket(page: Page) {
	await goToNav(page, 'pockets');
	await page.getByTestId('pocket-add').click();
	await page.getByTestId('pocket-name-input').fill('Vacation');
	await page.getByTestId('pocket-description-input').fill('Trip fund');
	await page.getByTestId('pocket-save').click();
	await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

	const vacation = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Vacation' });
	await vacation.click();
	await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
	await addPocketGoal(page, { target: '8000000' });
	await page.getByTestId('pocket-details-back').click();
	await expect(page.getByTestId('pockets-panel')).toBeVisible();
	return vacation;
}

test.describe('070–077 pockets pack', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('nav includes Pockets between Activity and Categories', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page).toHaveURL(/\/pockets\/?$/);
		await goToNav(page, 'categories');
		await expect(page.getByTestId('categories-panel')).toBeVisible();
	});

	test('Main shows icon; create pocket; rename Main; no Main delete', async ({ page }) => {
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page.getByTestId('pocket-main-icon')).toBeVisible();

		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await expect(page.getByTestId('pocket-edit')).toHaveCount(0);
		await expect(page.getByTestId('pocket-delete')).toHaveCount(0);
		await expect(page.getByTestId('pocket-clear-goal')).toHaveCount(0);
		await expect(page.getByTestId('pockets-panel').getByRole('alert')).toHaveCount(0);
		await expect(page.getByTestId('pocket-delete-confirm')).toHaveCount(0);

		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-save')).toBeDisabled();
		const description = page.getByTestId('pocket-description-input');
		await expect(description).toBeVisible();
		await expect(description).toHaveJSProperty('tagName', 'INPUT');
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await expect(page.getByTestId('pocket-save')).toHaveText('Save');
		await expect(page.getByTestId('pocket-save')).toBeEnabled();
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
		await expect(page.getByTestId('pockets-panel').getByText('Vacation')).toBeVisible();

		await openPocketEditFromList(page, mainRow);
		await expect(page.getByTestId('pocket-save')).toBeDisabled();
		await page.getByTestId('pocket-name-input').fill('Household');
		await expect(page.getByTestId('pocket-save')).toBeEnabled();
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
		await page.getByTestId('pocket-details-back').click();
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(mainRow.getByText('Household')).toBeVisible();
		await expect(page.getByTestId('pocket-main-icon')).toBeVisible();
	});

	test('Transfer tab with two pockets creates transfer', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();

		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByTestId('tx-mode-tabs')).toBeVisible();
		await expect(dialog.getByTestId('tx-mode-normal')).toHaveCount(0);
		await expect(dialog.getByTestId('tx-type-income')).toBeVisible();
		await expect(dialog.getByTestId('tx-mode-transfer')).toBeVisible();
		await expect(dialog.getByTestId('tx-type-expense')).toBeVisible();
		await dialog.getByTestId('tx-mode-transfer').click();
		await expect(dialog.getByTestId('tx-transfer-source')).toBeVisible();
		await expect(dialog.getByTestId('tx-transfer-dest')).toBeVisible();
		await dialog.getByTestId('tx-transfer-dest').click();
		const destMain = page.getByRole('menuitem', { name: 'Main', exact: true });
		await expect(destMain).toBeVisible();
		await destMain.dispatchEvent('click');
		await expect(dialog.getByTestId('tx-transfer-same-pocket-warn')).toBeVisible();
		await dialog.getByTestId('tx-transfer-dest').click();
		const destVacation = page.getByRole('menuitem', { name: 'Vacation', exact: true });
		await expect(destVacation).toBeVisible();
		await destVacation.dispatchEvent('click');
		await expect(dialog.getByTestId('tx-transfer-same-pocket-warn')).toHaveCount(0);
		await dialog.getByLabel(/amount/i).fill('10000');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });
		await expect(page.getByTestId('recent-list')).toContainText('Transfer');
		await expect(page.locator('[data-testid$="-transfer-icon"]').first()).toBeVisible();
	});

	test('single pocket Add is read-only (187)', async ({ page }) => {
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByTestId('tx-pocket')).toBeVisible();
		await dialog.getByTestId('tx-pocket').click();
		await expect(page.locator('[data-testid^="tx-pocket-option-"]')).toHaveCount(0);
		await dialog.getByTestId('tx-close').click();
	});

	test('Normal add shows pocket picker; inline amount error', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();

		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByTestId('tx-pocket')).toBeVisible();
		await dialog.getByTestId('tx-amount').fill('0');
		await dialog.getByTestId('tx-save').click();
		await expect(dialog.getByTestId('tx-field-error-amount')).toBeVisible();
		await expect(dialog).toBeVisible();
	});

	test('Dirty dismiss keeps sheet and shows discard', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByTestId('tx-dialog');
		await expect(sheet).toBeVisible();
		await expect(sheet.getByTestId('tx-mode-transfer')).toHaveCount(0);
		await expect(sheet.getByTestId('tx-type-income')).toBeVisible();
		await expect(sheet.getByTestId('tx-type-expense')).toBeVisible();
		const closeBox = await sheet.getByTestId('tx-close').boundingBox();
		const saveBox = await sheet.getByTestId('tx-save').boundingBox();
		expect(closeBox && saveBox).toBeTruthy();
		expect(Math.abs(closeBox!.y - saveBox!.y)).toBeLessThan(8);
		expect(closeBox!.x).toBeLessThan(saveBox!.x);
		await sheet.getByTestId('tx-amount').fill('1500');
		await sheet.getByTestId('tx-close').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(sheet).toBeVisible();
		await page.getByTestId('confirm-dialog-cancel').click();
		await expect(page.getByTestId('tx-discard-confirm')).toBeHidden();
		await expect(sheet).toBeVisible();
		await expect(sheet.getByTestId('tx-amount')).toHaveValue(/1,?500/);

		await sheet.getByTestId('tx-amount').fill('2500');
		await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 8, y: 8 } });
		await expect(page.getByTestId('tx-discard-confirm')).toBeVisible();
		await expect(sheet).toBeVisible();
	});

	test('Recent shows pocket under amount', async ({ page }) => {
		await ensureCategory(page, 'Food', 'expense');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByTestId('tx-type-expense').click();
		await dialog.getByLabel(/amount/i).fill('1200');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(
			page
				.locator('[data-testid^="recent-row-"][data-testid$="-pocket"]')
				.or(page.locator('[data-testid^="recent-row-"] >> [data-testid$="-pocket"]'))
				.first()
		).toBeVisible({ timeout: 10_000 });
	});

	test('Activity pocket filter Apply', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		await page.goto('/transactions');
		await expect(
			page.getByTestId('activity-list').or(page.getByTestId('activity-empty'))
		).toBeVisible();
		await page.getByTestId('activity-filters-open').click();
		await page.getByTestId('activity-filter-pocket').click();
		const vacationOption = page.locator('[data-testid^="activity-filter-pocket-option-"]').nth(1);
		await vacationOption.click();
		await page.getByTestId('activity-filters-apply').click();
		await expect(page.getByTestId('activity-filters-badge')).toBeVisible();
	});

	test('105 opening and goal amount fields match Amount chrome', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		const form = page.getByTestId('pocket-form-dialog');
		await expect(form).toBeVisible();
		await page.getByTestId('pocket-name-input').fill('Savings');
		await page.getByTestId('pocket-opening-enabled').check();
		const opening = form.getByTestId('pocket-opening-input');
		await expect(form.getByText('IDR', { exact: true }).first()).toBeVisible();
		await opening.fill('15000');
		await expect(opening).toHaveValue('15,000');
		await opening.fill('0');
		await expect(opening).toHaveValue('0');
		await page.getByTestId('pocket-save').click();
		await expect(form).toBeHidden();

		const savingsRow = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Savings' });
		await savingsRow.click();
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
		await page.getByTestId('pocket-details-add-goal').click();
		const goalForm = page.getByTestId('pocket-goal-form-dialog');
		await expect(goalForm).toBeVisible();
		const goal = goalForm.getByTestId('pocket-goal-target-input');
		await expect(goalForm.getByText('IDR', { exact: true })).toBeVisible();
		await goal.fill('100000');
		await expect(goal).toHaveValue('100,000');
		await page.getByTestId('pocket-goal-save').click();
		await expect(goalForm).toBeHidden();
	});

	test('149 description under name; hover highlight; Main mutes while dragging', async ({
		page
	}) => {
		const vacation = await createTallVacationPocket(page);
		const nameBox = await vacation.getByText('Vacation', { exact: true }).boundingBox();
		const desc = vacation.getByTestId('pocket-description');
		const descBox = await desc.boundingBox();
		const goalBox = await vacation.getByText(/8,?000,?000/).boundingBox();
		expect(nameBox && descBox && goalBox).toBeTruthy();
		expect(Math.abs(nameBox!.x - descBox!.x)).toBeLessThan(24);
		expect(descBox!.y).toBeGreaterThan(nameBox!.y);
		expect(goalBox!.y).toBeGreaterThan(descBox!.y);
		await expect(desc).not.toHaveClass(/border-t/);

		await page.getByTestId('pocket-add').hover();
		const restBg = await vacation.evaluate((el) => getComputedStyle(el).backgroundColor);
		await vacation.hover();
		const hoverBg = await vacation.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(hoverBg).not.toBe(restBg);

		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		const handle = vacation.locator('.dnd-handle');
		const handleBox = await handle.boundingBox();
		expect(handleBox).toBeTruthy();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2 + 48,
			{ steps: 16 }
		);
		await expect(mainRow).toHaveAttribute('data-dnd-locked', 'true');
		expect(Number(await mainRow.evaluate((el) => getComputedStyle(el).opacity))).toBeCloseTo(
			0.6,
			1
		);
		await page.mouse.up();
		await expect(page.locator('[data-is-dnd-shadow-item-internal]')).toHaveCount(0);
		await expect(mainRow).not.toHaveAttribute('data-dnd-locked', 'true');
		expect(Number(await mainRow.evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
	});

	test('151 grip column: centered icon; drag from strip; name opens details', async ({
		page
	}) => {
		const vacation = await createTallVacationPocket(page);
		const handle = vacation.locator('.dnd-handle');
		const icon = handle.locator('svg');
		const handleBox = await handle.boundingBox();
		const iconBox = await icon.boundingBox();
		expect(handleBox && iconBox).toBeTruthy();
		expect(handleBox!.height).toBeGreaterThan(iconBox!.height + 16);
		const iconMidY = iconBox!.y + iconBox!.height / 2;
		const handleMidY = handleBox!.y + handleBox!.height / 2;
		expect(Math.abs(iconMidY - handleMidY)).toBeLessThan(8);

		const dragX = handleBox!.x + handleBox!.width / 2;
		const dragY = iconBox!.y + iconBox!.height + 8;
		expect(dragY).toBeLessThan(handleBox!.y + handleBox!.height - 2);

		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await page.mouse.move(dragX, dragY);
		await page.mouse.down();
		await page.mouse.move(dragX, dragY + 48, { steps: 16 });
		await expect(mainRow).toHaveAttribute('data-dnd-locked', 'true');
		await page.mouse.up();
		await expect(page.locator('[data-is-dnd-shadow-item-internal]')).toHaveCount(0);
		await expect(mainRow).not.toHaveAttribute('data-dnd-locked', 'true');

		const nameBox = await vacation.getByText('Vacation', { exact: true }).boundingBox();
		expect(nameBox).toBeTruthy();
		await page.mouse.click(nameBox!.x + nameBox!.width / 2, nameBox!.y + nameBox!.height / 2);
		await expect(page).toHaveURL(/\/pockets\/[^/]+\/?$/);
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
	});

	test('153 delete lives on non-Main edit; empty pocket leaves details', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await expect(page.getByTestId('pocket-delete')).toHaveCount(0);
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await openPocketEditFromList(page, mainRow);
		await expect(page.getByTestId('pocket-delete')).toHaveCount(0);
		await page.keyboard.press('Escape');
		await page.getByTestId('pocket-details-back').click();

		const vacation = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Vacation' });
		await vacation.click();
		await expect(page).toHaveURL(/\/pockets\/[^/]+\/?$/);
		await page.getByTestId('pocket-details-edit').click();
		await expect(page.getByTestId('pocket-delete')).toBeVisible();
		await page.getByTestId('pocket-delete').click();
		await page.getByTestId('pocket-delete-confirm').click();
		await expect(page).toHaveURL(/\/pockets\/?$/);
		await expect(page.getByTestId('pockets-panel').getByText('Vacation')).toHaveCount(0);
	});

	test('153 delete popover lists the active-goal blocker', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		const vacation = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Vacation' });
		await vacation.click();
		await addPocketGoal(page, { target: '50000' });
		await page.getByTestId('pocket-details-edit').click();
		await page.getByTestId('pocket-delete').click();
		await expect(page.getByTestId('pocket-delete-blocked')).toBeVisible();
		await expect(page.getByTestId('pocket-delete-blocked')).toContainText(
			'Drop all active goals first.'
		);
		await expect(page.getByTestId('pocket-delete-blocked')).not.toContainText('transactions');
		await expect(page.getByTestId('pocket-delete-confirm')).toHaveCount(0);
	});
});
