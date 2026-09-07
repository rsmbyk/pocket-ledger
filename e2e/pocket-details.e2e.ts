import { expect, test } from '@playwright/test';
import { addPocketGoal, ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

async function createVacation(page: import('@playwright/test').Page) {
	await goToNav(page, 'pockets');
	await page.getByTestId('pocket-add').click();
	await page.getByTestId('pocket-name-input').fill('Vacation');
	await page.getByTestId('pocket-save').click();
	await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
}

async function openVacationDetails(page: import('@playwright/test').Page) {
	await goToNav(page, 'pockets');
	const vacation = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Vacation' });
	await vacation.click();
	await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
}

test.describe('148 pocket details', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('card opens details; details edit; back and nav return to list', async ({ page }) => {
		await createVacation(page);
		const vacation = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Vacation' });
		await vacation.click();
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
		await expect(page.getByTestId('pocket-details-identity')).toHaveCount(0);
		await expect(page).toHaveURL(/\/pockets\/[^/]+\/?$/);
		await expect(page.getByTestId('page-title')).toContainText('Vacation');
		await expect(page.getByTestId('nav-pockets')).toHaveAttribute('aria-current', 'page');

		await page.getByTestId('pocket-details-edit').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeVisible();
		await expect(page).toHaveURL(/\/pockets\/[^/]+\/?$/);
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		await page.getByTestId('pocket-details-back').click();
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page).toHaveURL(/\/pockets\/?$/);

		await vacation.click();
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
		await goToNav(page, 'pockets');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page).toHaveURL(/\/pockets\/?$/);
	});

	test('unknown id bounces to the list; extra segments stay on details (204)', async ({ page }) => {
		await page.goto('/pockets/not-a-real-id');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page).toHaveURL(/\/pockets\/?$/);
		await expect(page.getByTestId('home-panel')).toHaveCount(0);

		await createVacation(page);
		const vacation = page.locator('[data-testid^="pocket-row-"]').filter({ hasText: 'Vacation' });
		await vacation.click();
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
		const detailsPath = new URL(page.url()).pathname.replace(/\/+$/, '');
		await page.goto(`${detailsPath}/extra`);
		await expect(page.getByTestId('pocket-details-panel')).toBeVisible();
		await expect(page).toHaveURL(new RegExp(`${detailsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));

		await page.goto('/pockets/any-id/extra');
		await expect(page.getByTestId('pockets-panel')).toBeVisible();
		await expect(page).toHaveURL(/\/pockets\/?$/);
		await expect(page.getByTestId('home-panel')).toHaveCount(0);
	});

	test('identity, balance, hidden opening/goal, toolbar edit', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.getByTestId('pocket-add').click();
		await page.getByTestId('pocket-name-input').fill('Vacation');
		await page.getByTestId('pocket-description-input').fill('Trip fund');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		await openVacationDetails(page);
		await expect(page.getByTestId('pocket-details-identity')).toContainText('Descriptions');
		await expect(page.getByTestId('pocket-details-description')).toHaveText('Trip fund');
		await expect(page.getByTestId('pocket-details-balance')).toBeVisible();
		await expect(page.getByTestId('pocket-details-opening')).toHaveCount(0);
		await expect(page.getByTestId('pocket-details-goals-card')).toBeVisible();
		await expect(page.getByTestId('pocket-details-goals-empty')).toBeVisible();
		await expect(page.getByTestId('month-summary')).toBeVisible();
		await expect(page.getByTestId('pocket-details-see-more')).toHaveCount(0);

		await page.getByTestId('pocket-details-edit').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeVisible();
		await page.getByTestId('pocket-opening-enabled').check();
		await page.getByTestId('pocket-opening-input').fill('50000');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();
		await expect(page.getByTestId('pocket-goal-enabled')).toHaveCount(0);
		await addPocketGoal(page, { target: '200000' });
		await expect(page.getByTestId('pocket-details-opening')).toBeVisible();
		await expect(page.getByTestId('pocket-details-goals-list')).toBeVisible();
	});

	test('month summary is this pocket only; latest See more and Add prefill', async ({
		page
	}) => {
		await ensureCategory(page, 'Salary', 'income');
		await ensureCategory(page, 'Food', 'expense');
		await createVacation(page);

		await goToNav(page, 'home');
		await openAdd(page);
		const incomeDialog = page.getByRole('dialog');
		await incomeDialog.getByTestId('tx-type-income').click();
		await incomeDialog.getByLabel(/amount/i).fill('100000');
		await selectTxCategory(page, 'Salary', incomeDialog);
		await incomeDialog.getByRole('button', { name: 'Save' }).click();

		await openAdd(page);
		const expenseDialog = page.getByRole('dialog');
		await expenseDialog.getByTestId('tx-type-expense').click();
		await expenseDialog.getByTestId('tx-pocket').click();
		await page.getByRole('menuitem', { name: 'Vacation', exact: true }).dispatchEvent('click');
		await expenseDialog.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', expenseDialog);
		await expenseDialog.getByRole('button', { name: 'Save' }).click();

		await openVacationDetails(page);
		await expect(page.getByTestId('month-income')).toContainText('0');
		await expect(page.getByTestId('month-expense')).toContainText('15');
		await expect(page.getByTestId('pocket-details-recent-list')).toBeVisible();

		await page.getByTestId('pocket-details-add').click();
		const addDialog = page.getByRole('dialog');
		await expect(addDialog).toBeVisible();
		await expect(addDialog.getByTestId('tx-pocket')).toContainText('Vacation');
		await addDialog.getByTestId('tx-close').click();

		await page.getByTestId('pocket-details-see-more').click();
		await expect(page.getByTestId('activity-panel')).toBeVisible();
		await expect(page.getByTestId('activity-filter-pocket')).toContainText('Vacation');
	});

	test('narrow stack puts opening above plans (235)', async ({ page }) => {
		await page.setViewportSize({ width: 800, height: 900 });
		await createVacation(page);
		await openVacationDetails(page);
		await page.getByTestId('pocket-details-edit').click();
		await page.getByTestId('pocket-opening-enabled').check();
		await page.getByTestId('pocket-opening-input').fill('50000');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		await expect(page.getByTestId('pocket-details-col-identity')).toHaveCount(0);
		const opening = await page.getByTestId('pocket-details-opening').boundingBox();
		const plans = await page.getByTestId('pocket-details-plans-card').boundingBox();
		const goals = await page.getByTestId('pocket-details-goals-card').boundingBox();
		const month = await page.getByTestId('month-summary').boundingBox();
		const recent = await page.getByTestId('pocket-details-recent-card').boundingBox();
		expect(opening && plans && goals && month && recent).toBeTruthy();
		expect(opening!.y).toBeLessThan(plans!.y);
		expect(plans!.y).toBeLessThan(goals!.y);
		expect(goals!.y).toBeLessThan(month!.y);
		expect(month!.y).toBeLessThan(recent!.y);
	});

	test('xl uses three equal columns (235)', async ({ page }) => {
		await page.setViewportSize({ width: 1400, height: 900 });
		await createVacation(page);
		await openVacationDetails(page);
		await page.getByTestId('pocket-details-edit').click();
		await page.getByTestId('pocket-opening-enabled').check();
		await page.getByTestId('pocket-opening-input').fill('50000');
		await page.getByTestId('pocket-save').click();
		await expect(page.getByTestId('pocket-form-dialog')).toBeHidden();

		const identity = page.getByTestId('pocket-details-col-identity');
		const activity = page.getByTestId('pocket-details-col-activity');
		const lists = page.getByTestId('pocket-details-col-lists');
		await expect(identity).toBeVisible();
		await expect(activity).toBeVisible();
		await expect(lists).toBeVisible();

		const idBox = await identity.boundingBox();
		const actBox = await activity.boundingBox();
		const listBox = await lists.boundingBox();
		expect(idBox && actBox && listBox).toBeTruthy();
		expect(idBox!.x).toBeLessThan(actBox!.x);
		expect(actBox!.x).toBeLessThan(listBox!.x);
		expect(Math.abs(idBox!.width - actBox!.width)).toBeLessThan(8);
		expect(Math.abs(actBox!.width - listBox!.width)).toBeLessThan(8);

		await expect(identity.getByTestId('pocket-details-balance-hero')).toBeVisible();
		await expect(identity.getByTestId('pocket-details-opening')).toBeVisible();
		await expect(activity.getByTestId('month-summary')).toBeVisible();
		await expect(activity.getByTestId('pocket-details-recent-card')).toBeVisible();
		await expect(lists.getByTestId('pocket-details-plans-card')).toBeVisible();
		await expect(lists.getByTestId('pocket-details-goals-card')).toBeVisible();
	});
});
