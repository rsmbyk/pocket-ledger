import { expect, test } from '@playwright/test';
import { ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('110 month opening from pocket openings', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Main' })).toBeVisible();
		await expect(page.getByTestId('month-summary')).toBeVisible();
	});

	test('June opening reverses mid-gap expense before pocket as-of', async ({ page }) => {
		await goToNav(page, 'pockets');
		const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
		await mainRow.getByTestId('pocket-edit').click();
		const form = page.getByTestId('pocket-form-dialog');
		await expect(form).toBeVisible();
		await page.getByTestId('pocket-opening-enabled').check();
		await form.getByTestId('pocket-opening-input').fill('100000');
		await page.getByTestId('pocket-asof-input').locator('input[type="date"]').fill('2026-06-15');
		await page.getByTestId('pocket-save').click();
		await expect(form).toBeHidden();

		await ensureCategory(page, 'Food', 'expense');
		await goToNav(page, 'home');
		await openAdd(page);
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Expense', exact: true }).click();
		await dialog.getByLabel(/amount/i).fill('25000');
		await selectTxCategory(page, 'Food', dialog);
		await dialog.getByTestId('tx-occurred-on').locator('input[type="date"]').fill('2026-06-05');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect(dialog).toBeHidden({ timeout: 10_000 });

		const prev = page.getByRole('button', { name: 'Previous month' });
		const label = page.getByTestId('month-label');
		for (let i = 0; i < 12; i++) {
			const text = await label.innerText();
			if (/June/i.test(text) && /2026/.test(text)) break;
			await expect(prev).toBeEnabled();
			await prev.click();
			await expect(label).not.toHaveText(text);
		}
		await expect(label).toContainText(/June/i);
		await expect(label).toContainText('2026');

		await expect(page.getByTestId('month-opening')).toContainText('125');
		await expect(page.getByTestId('month-expense')).toContainText('25');
		await expect(page.getByTestId('month-ending')).toContainText('100');
	});
});
