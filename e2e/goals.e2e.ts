import { expect, test, type Locator } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

async function setGoalDeadline(section: Locator, isoDate: string) {
	await section.locator('input[type="date"]').fill(isoDate);
}

test.describe('060 goals have X by Y', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
	});

	test('Home strip absent without goals; present after create; nearest first', async ({ page }) => {
		await expect(page.getByTestId('home-goal-strip')).toHaveCount(0);

		await goToNav(page, 'more');
		const more = page.getByTestId('more-section-goals');
		await more.getByPlaceholder('Name').fill('Later');
		await more.getByPlaceholder('Target amount').fill('500000');
		await setGoalDeadline(more, '2026-12-31');
		await more.getByRole('button', { name: 'Add goal' }).click();
		await expect(page.getByTestId('goals-list')).toContainText('Later');

		await more.getByPlaceholder('Name').fill('Sooner');
		await more.getByPlaceholder('Target amount').fill('100000');
		await setGoalDeadline(more, '2026-08-01');
		await more.getByRole('button', { name: 'Add goal' }).click();

		const list = page.getByTestId('goals-list');
		const rows = list.locator('[data-testid^="goal-row-"]');
		await expect(rows).toHaveCount(2);
		await expect(rows.first()).toContainText('Sooner');

		await goToNav(page, 'home');
		const strip = page.getByTestId('home-goal-strip');
		await expect(strip).toBeVisible();
		await expect(strip).toContainText('Sooner');
		await strip.click();
		await expect(page.getByTestId('more-section-goals')).toBeVisible();
	});

	test('progress reflects Main balance', async ({ page }) => {
		await ensureCategory(page, 'Salary', 'income');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Income', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('25000');
		await selectTxCategory(page, 'Salary', dialog);
		await dialog.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'more');
		const more = page.getByTestId('more-section-goals');
		await more.getByPlaceholder('Name').fill('Emergency');
		await more.getByPlaceholder('Target amount').fill('100000');
		await setGoalDeadline(more, '2026-12-31');
		await more.getByRole('button', { name: 'Add goal' }).click();
		await expect(page.getByTestId('goals-list')).toContainText(/25%/);
	});

	test('deleting last goal removes Home strip', async ({ page }) => {
		await goToNav(page, 'more');
		const more = page.getByTestId('more-section-goals');
		await more.getByPlaceholder('Name').fill('Solo');
		await more.getByPlaceholder('Target amount').fill('50000');
		await setGoalDeadline(more, '2026-09-01');
		await more.getByRole('button', { name: 'Add goal' }).click();
		await goToNav(page, 'home');
		await expect(page.getByTestId('home-goal-strip')).toBeVisible();

		await goToNav(page, 'more');
		await page.getByTestId('goals-list').getByRole('button', { name: 'Delete' }).click();
		await page.getByTestId('goal-delete-confirm').click();
		await expect(page.getByTestId('goals-list')).toContainText(/no goals/i);
		await goToNav(page, 'home');
		await expect(page.getByTestId('home-goal-strip')).toHaveCount(0);
	});
});
