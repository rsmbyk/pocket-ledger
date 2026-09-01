import { expect, test } from '@playwright/test';

test.describe('133 visual system', () => {
	test('Mist surfaces, Figtree, and 7px radius', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('page-title')).toHaveText('Home');
		const painted = await page.evaluate(() => {
			const body = getComputedStyle(document.body);
			const root = getComputedStyle(document.documentElement);
			return {
				bg: body.backgroundColor,
				font: body.fontFamily,
				radius: root.getPropertyValue('--radius').trim()
			};
		});
		expect(painted.bg).toBe('rgb(238, 241, 244)');
		expect(painted.font.toLowerCase()).toContain('figtree');
		expect(painted.radius.replace(/^0/, '')).toBe('.4375rem');
	});

	test('buttons keep desktop height below md; overlay scrollbar has no gutter', async ({
		page
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/categories');
		const add = page.getByTestId('category-add-group');
		await expect(add).toBeVisible();
		expect(await add.evaluate((el) => Math.round(el.getBoundingClientRect().height))).toBe(36);

		const theme = page.getByTestId('theme-cycle');
		expect(await theme.evaluate((el) => Math.round(el.getBoundingClientRect().height))).toBe(32);

		const grid = page.getByTestId('categories-desktop-grid');
		await expect(grid).toBeVisible();
		expect(await grid.evaluate((el) => getComputedStyle(el).scrollbarWidth)).toBe('none');
		await grid.evaluate((el) => {
			el.scrollTop = 120;
		});
		await expect(page.locator('.pl-osb--y')).toHaveClass(/is-on/);
	});
});
