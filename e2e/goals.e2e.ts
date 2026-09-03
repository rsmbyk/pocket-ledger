import { expect, test } from '@playwright/test';
import { addPocketGoal, ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

/** Spec 152: multiple goals per pocket (replaces 072 account fields). */
test.describe('152 pocket goals', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('no Home strip or More Goals section', async ({ page }) => {
		await expect(page.getByTestId('home-goal-strip')).toHaveCount(0);
		await goToNav(page, 'more');
		await expect(page.getByTestId('more-section-goals')).toHaveCount(0);
	});

	test('details card is always on; progress reflects balance', async ({ page }) => {
		await goToNav(page, 'pockets');
		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await mainRow.click();
		await expect(page.getByTestId('pocket-details-goals-card')).toBeVisible();
		await expect(page.getByTestId('pocket-details-goals-empty')).toBeVisible();
		await expect(page.getByTestId('pocket-details-see-past-goals')).toHaveCount(0);

		await page.getByTestId('pocket-details-back').click();
		await ensureCategory(page, 'Salary', 'income');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Income', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('25000');
		await selectTxCategory(page, 'Salary', dialog);
		await dialog.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'pockets');
		await mainRow.click();
		await addPocketGoal(page, { target: '100000' });
		await expect(page.getByTestId('pocket-details-goals-list')).toContainText(/25%/);
		await page.getByTestId('pocket-details-back').click();
		await expect(mainRow).toContainText(/25%/);
	});

	test('drop dated goal into past', async ({ page }) => {
		await goToNav(page, 'pockets');
		await page.locator('[data-testid^="pocket-row-"]').first().click();
		await addPocketGoal(page, { target: '50000', dated: true });
		await page.getByTestId('pocket-details-goals-list').locator('button').first().click();
		await expect(page.getByTestId('pocket-goal-form-dialog')).toBeVisible();
		await page.getByTestId('pocket-goal-drop').click();
		await page.getByTestId('pocket-goal-drop-confirm').click();
		await expect(page.getByTestId('pocket-details-goals-empty')).toBeVisible();
		await expect(page.getByTestId('pocket-details-see-past-goals')).toBeVisible();
		await page.getByTestId('pocket-details-see-past-goals').click();
		await expect(page.getByTestId('pocket-past-goals-dialog')).toContainText('Dropped');
	});
});
