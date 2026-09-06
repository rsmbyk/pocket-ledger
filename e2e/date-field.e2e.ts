import { expect, test, type Locator, type Page } from '@playwright/test';
import { openAdd } from './nav';

async function spyShowPicker(native: Locator): Promise<void> {
	await native.evaluate((el) => {
		const input = el as HTMLInputElement;
		(window as unknown as { __plShowPicker?: number }).__plShowPicker = 0;
		const orig = input.showPicker.bind(input);
		input.showPicker = () => {
			const w = window as unknown as { __plShowPicker?: number };
			w.__plShowPicker = (w.__plShowPicker ?? 0) + 1;
			try {
				orig();
			} catch {
				// NotAllowedError in some automation environments
			}
		};
	});
}

async function showPickerCount(page: Page): Promise<number> {
	return page.evaluate(() => (window as unknown as { __plShowPicker?: number }).__plShowPicker ?? 0);
}

test.describe('100 / 220 DateField mobile picker', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await expect(page.getByTestId('recent-add')).toBeVisible();
	});

	test('tx date field accepts a chosen date on mobile viewport', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		await expect(field).toBeVisible();
		await expect(field).toContainText(/\d{2} \w{3} \d{4}/);

		const native = field.locator('input[type="date"]');
		await expect(native).toBeEnabled();
		await native.fill('2026-01-15');
		await expect(field).toContainText('15 Jan 2026');
	});

	test('date chrome hit target is the native input', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		const native = field.locator('input[type="date"]');

		await expect(native).toHaveClass(/opacity-0/);
		await expect(native).not.toHaveClass(/sr-only/);

		await field.click();
		await native.fill('2026-03-04');
		await expect(field).toContainText('04 Mar 2026');
	});

	test('clicking the date chrome calls showPicker', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		const native = field.locator('input[type="date"]');

		await spyShowPicker(native);
		await native.evaluate((el) => {
			(el as HTMLInputElement).click();
		});
		expect(await showPickerCount(page)).toBeGreaterThan(0);
	});

	test('overlay fills the chrome, not only the date text', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		const native = field.locator('input[type="date"]');

		const fieldBox = await field.boundingBox();
		const nativeBox = await native.boundingBox();
		expect(fieldBox).toBeTruthy();
		expect(nativeBox).toBeTruthy();
		expect(nativeBox!.width).toBeGreaterThan(fieldBox!.width * 0.85);
		expect(nativeBox!.height).toBeGreaterThan(fieldBox!.height * 0.85);
	});

	test('clicking the icon side or far chrome calls showPicker', async ({ page }) => {
		await openAdd(page);
		const field = page.getByTestId('tx-occurred-on');
		const native = field.locator('input[type="date"]');
		const box = await field.boundingBox();
		expect(box).toBeTruthy();

		await spyShowPicker(native);
		await field.click({ position: { x: 12, y: box!.height / 2 } });
		expect(await showPickerCount(page)).toBeGreaterThan(0);

		await field.click({ position: { x: box!.width - 16, y: box!.height / 2 } });
		expect(await showPickerCount(page)).toBeGreaterThan(1);
	});
});
