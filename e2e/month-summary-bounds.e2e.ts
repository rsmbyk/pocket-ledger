import { expect, test } from '@playwright/test';
import { goToNav, openPocketEditFromList } from './nav';

async function setMainOpeningAsOf(page: import('@playwright/test').Page, asOf: string) {
	await goToNav(page, 'pockets');
	const mainRow = page.locator('[data-testid^="pocket-row-"]').first();
	await openPocketEditFromList(page, mainRow);
	const form = page.getByTestId('pocket-form-dialog');
	await expect(form).toBeVisible();
	await page.getByTestId('pocket-opening-enabled').check();
	await page.getByTestId('pocket-asof-input').locator('input[type="date"]').fill(asOf);
	await page.getByTestId('pocket-save').click();
	await expect(form).toBeHidden();
	await goToNav(page, 'home');
	await expect(page.getByTestId('month-summary')).toBeVisible();
}

test.describe('109 month summary bounds', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await expect(page.getByTestId('month-summary')).toBeVisible();
	});

	test('disables next month on the current month', async ({ page }) => {
		const next = page.getByRole('button', { name: 'Next month' });
		await expect(next).toBeDisabled();
		const label = await page.getByTestId('month-label').innerText();
		await next.click({ force: true });
		await expect(page.getByTestId('month-label')).toHaveText(label);
	});

	test('disables previous month at earliest opening as-of', async ({ page }) => {
		await setMainOpeningAsOf(page, '2026-03-01');

		const prev = page.getByRole('button', { name: 'Previous month' });
		const label = page.getByTestId('month-label');

		for (let i = 0; i < 24; i++) {
			const text = await label.innerText();
			if (/March/i.test(text) && /2026/.test(text)) break;
			await expect(prev).toBeEnabled();
			await prev.click();
			await expect(label).not.toHaveText(text);
		}

		await expect(label).toContainText(/March/i);
		await expect(label).toContainText('2026');
		await expect(prev).toBeDisabled();
	});
});
