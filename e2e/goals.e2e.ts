import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

/** Spec 072 retired global goals; pocket goals replace them. */
test.describe('072 pocket goals (replaces 060 More/Home goals)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('no Home strip or More Goals section', async ({ page }) => {
		await expect(page.getByTestId('home-goal-strip')).toHaveCount(0);
		await goToNav(page, 'more');
		await expect(page.getByTestId('more-section-goals')).toHaveCount(0);
	});

	test('pocket goal progress reflects balance', async ({ page }) => {
		await ensureCategory(page, 'Salary', 'income');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Income', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('25000');
		await selectTxCategory(page, 'Salary', dialog);
		await dialog.getByRole('button', { name: 'Save' }).click();

		await goToNav(page, 'pockets');
		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await mainRow.getByTestId('pocket-edit').click();
		await page.getByTestId('pocket-goal-target-input').fill('100000');
		await page.getByTestId('pocket-save').click();
		await expect(mainRow).toContainText(/25%/);
	});
});
