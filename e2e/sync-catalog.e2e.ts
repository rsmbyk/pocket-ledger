import { expect, test, type Page } from '@playwright/test';
import { confirmHexKit, goToNav, openAdd, openAddCategory, selectCategoriesKind, selectTxCategory } from './nav';

const E2E_FAKE_TOKEN_KEY = 'pl-e2e-fake-token';
const PASS = 'account-pass';

async function signInWithSharedToken(page: Page, token: string): Promise<void> {
	await page.goto('/');
	await expect(page.getByTestId('home-panel')).toBeVisible();
	await page.evaluate(
		({ key, t }) => sessionStorage.setItem(key, t),
		{ key: E2E_FAKE_TOKEN_KEY, t: token }
	);
	await goToNav(page, 'more');
	await page.getByTestId('google-sign-in').click();
}

test.describe('241 catalog sync', () => {
	test('second browser sees pockets, custom categories, and theme', async ({ browser }) => {
		const token = `fake.sync241${crypto.randomUUID().replaceAll('-', '')}.e2e@example.com`;

		const contextA = await browser.newContext();
		const pageA = await contextA.newPage();
		await signInWithSharedToken(pageA, token);
		await expect(pageA.getByTestId('account-passphrase-screen')).toBeVisible();
		await pageA.getByTestId('account-pass').fill(PASS);
		await pageA.getByTestId('account-pass-confirm').fill(PASS);
		await pageA.getByTestId('account-pass-submit').click();
		await confirmHexKit(pageA);
		await expect(pageA.getByTestId('app-shell')).toBeVisible();

		await pageA.getByTestId('theme-cycle').click();
		await expect(pageA.getByTestId('theme-cycle')).toHaveAttribute('aria-label', 'Theme: Dark');

		await goToNav(pageA, 'pockets');
		await pageA.getByTestId('pocket-add').click();
		await pageA.getByTestId('pocket-name-input').fill('A');
		await pageA.getByTestId('pocket-save').click();
		await expect(pageA.getByTestId('pocket-form-dialog')).toBeHidden();
		await expect(pageA.getByTestId('pockets-panel').getByText('A', { exact: true })).toBeVisible();

		await goToNav(pageA, 'categories');
		await expect(pageA.getByTestId('categories-panel')).toBeVisible();
		await openAddCategory(pageA, 'expense');
		await pageA.getByTestId('category-name-input').fill('Warung');
		await pageA.getByTestId('category-add').click();
		await expect(pageA.getByTestId('category-add-dialog')).toBeHidden();
		await expect(pageA.getByTestId('categories-panel').getByText('Warung', { exact: true })).toBeVisible();

		await goToNav(pageA, 'home');
		await openAdd(pageA);
		const dialog = pageA.getByTestId('tx-dialog');
		await dialog.getByTestId('tx-pocket').click();
		await pageA.getByRole('menuitem', { name: 'A', exact: true }).dispatchEvent('click');
		await dialog.getByRole('textbox', { name: 'Amount' }).fill('1000');
		await selectTxCategory(pageA, 'Warung', dialog);
		await dialog.getByTestId('tx-save').click();
		await expect(dialog).toBeHidden();
		await expect(pageA.getByTestId('recent-list')).toContainText('A');
		await expect(pageA.getByTestId('recent-list')).not.toContainText('Unknown');
		await expect(pageA.getByTestId('recent-list')).toContainText('Warung');

		const contextB = await browser.newContext();
		const pageB = await contextB.newPage();
		await signInWithSharedToken(pageB, token);
		await expect(pageB.getByTestId('account-unlock-screen')).toBeVisible();
		await pageB.getByTestId('unlock-passphrase').fill(PASS);
		await pageB.getByTestId('unlock-submit').click();
		await expect(pageB.getByTestId('app-shell')).toBeVisible();

		await expect(pageB.locator('html')).toHaveClass(/dark/);
		await expect(pageB.getByTestId('theme-cycle')).toHaveAttribute('aria-label', 'Theme: Dark');

		await goToNav(pageB, 'pockets');
		await expect(pageB.getByTestId('pockets-panel').getByText('A', { exact: true })).toBeVisible();
		await expect(pageB.getByTestId('pockets-panel').getByText('Main', { exact: true })).toBeVisible();

		await goToNav(pageB, 'home');
		await expect(pageB.getByTestId('recent-list')).toContainText('A');
		await expect(pageB.getByTestId('recent-list')).not.toContainText('Unknown');
		await expect(pageB.getByTestId('recent-list')).toContainText('Warung');

		await goToNav(pageB, 'categories');
		await expect(pageB.getByTestId('categories-panel')).toBeVisible();
		await selectCategoriesKind(pageB, 'expense');
		await expect(pageB.getByTestId('categories-panel').getByText('Warung', { exact: true })).toBeVisible();
		await expect(pageB.getByTestId('categories-panel').getByText('Groceries', { exact: true })).toBeVisible();

		await contextA.close();
		await contextB.close();
	});
});
