import { expect, test } from '@playwright/test';
import { confirmVoid, ensureCategory, goToNav, openAdd, selectTxCategory } from './nav';

test.describe('012 polish / 014 void / 030', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await ensureCategory(page, 'Food', 'expense');
	});

	test('empty home shows designed empty without CTA', async ({ page }) => {
		await expect(page.getByTestId('recent-empty')).toBeVisible();
		await expect(page.getByTestId('recent-empty').getByRole('button')).toHaveCount(0);
		await expect(page.getByTestId('recent-add')).toBeVisible();
	});

	test('edits and voids a transaction from activity', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();

		await goToNav(page, 'transactions');
		await expect(page.getByTestId('balance-compact')).toHaveCount(0);
		await page
			.getByTestId('activity-list')
			.locator('[data-testid^="activity-row-"]')
			.first()
			.click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();
		const edit = page.getByTestId('tx-dialog');
		await edit.getByRole('textbox', { name: 'Amount' }).fill('10000');
		await edit.getByTestId('tx-save').click();

		await goToNav(page, 'home');
		await expect(page.getByTestId('account-balance')).toContainText('10');

		await goToNav(page, 'transactions');
		await expect(page.getByTestId('activity-list')).toContainText('10');
		await page
			.getByTestId('activity-list')
			.locator('[data-testid^="activity-row-"]')
			.first()
			.click();
		await page.getByTestId('tx-void').click();
		await confirmVoid(page);
		await expect(page.getByTestId('activity-list')).toHaveCount(0);
		await expect(page.getByTestId('activity-empty-filtered')).toBeVisible();

		await goToNav(page, 'home');
		await expect(page.getByTestId('account-balance')).toContainText('0');
	});

	test('recent row opens edit', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Edit transaction' })).toBeVisible();

		const typeTab = page.getByTestId('tx-type-expense');
		await expect(typeTab).toBeVisible();
		await expect(typeTab).toBeDisabled();
		await expect(typeTab).toHaveAttribute('data-state', 'active');
		await expect(page.getByTestId('tx-type-income')).toHaveCount(0);
		await expect(page.getByTestId('tx-mode-transfer')).toHaveCount(0);
		const { opacity, pointerEvents } = await typeTab.evaluate((el) => {
			const style = getComputedStyle(el);
			return { opacity: style.opacity, pointerEvents: style.pointerEvents };
		});
		expect(Number(opacity)).toBe(1);
		expect(pointerEvents).toBe('none');
	});

	test('222 with note: note primary, category muted, date present', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('1');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByRole('textbox', { name: 'Note' }).fill('nites');
		await sheet.getByTestId('tx-save').click();

		const row = page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first();
		const note = row.getByTestId(/-note$/);
		const category = row.getByTestId(/-category$/);
		const date = row.getByTestId(/-date$/);
		await expect(note).toHaveText('nites');
		await expect(note).toHaveClass(/font-medium/);
		await expect(category).toContainText('Food');
		await expect(date).toBeVisible();
		const noteBox = await note.boundingBox();
		const categoryBox = await category.boundingBox();
		const dateBox = await date.boundingBox();
		expect(noteBox?.y).toBeLessThan(categoryBox?.y ?? Infinity);
		expect(categoryBox?.y).toBeLessThan(dateBox?.y ?? Infinity);
	});

	test('222 empty note: category primary, no note testid, date present', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();

		const row = page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first();
		await expect(row.getByTestId(/-note$/)).toHaveCount(0);
		await expect(row).toContainText('Food');
		await expect(row.getByTestId(/-date$/)).toBeVisible();
	});

	test('voided transaction opens read-only', async ({ page }) => {
		await openAdd(page);
		const sheet = page.getByRole('dialog');
		await sheet.getByTestId('tx-type-expense').click();
		await sheet.getByLabel(/amount/i).fill('15000');
		await selectTxCategory(page, 'Food', sheet);
		await sheet.getByTestId('tx-save').click();

		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await page.getByTestId('tx-void').click();
		await confirmVoid(page);
		await page.getByTestId('recent-list').locator('[data-testid^="recent-row-"]').first().click();
		await expect(page.getByRole('heading', { name: 'Voided transaction' })).toBeVisible();
		await expect(page.getByTestId('tx-save')).toHaveCount(0);
		await expect(page.getByTestId('tx-void')).toHaveCount(0);
	});
});
