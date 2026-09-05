import { expect, test } from '@playwright/test';
import { confirmHexKit, goToNav } from './nav';

test.describe('119 cloud onboarding', () => {
	test('signed-out users are not forced through Google', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('home-panel')).toBeVisible();
		await goToNav(page, 'more');
		await expect(page.getByTestId('google-sign-in')).toBeVisible();
		await goToNav(page, 'home');
		await expect(page.getByTestId('home-panel')).toBeVisible();
	});

	test('privacy explains encryption without a nested skip card', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await expect(page.getByTestId('device-skip-warning')).toHaveCount(0);
		await expect(page.getByTestId('settings-section-privacy')).toContainText(
			/anyone with this browser/i
		);
	});

	test('new account cannot skip the hex kit', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding');
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await expect(page.getByTestId('hex-kit-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding/kit');
		await expect(page.getByTestId('hex-kit-confirm')).toBeDisabled();
		await expect(page.getByTestId('hex-kit-stored')).toBeDisabled();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await expect(page.getByTestId('export-backup')).toHaveCount(0);
	});

	test('183 account passphrase Continue stays disabled until the pair is valid', async ({
		page
	}) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding');
		await expect(page.getByTestId('account-pass-submit')).toBeDisabled();
		await expect(page.getByTestId('account-pass-requirements')).toHaveCount(0);
		await page.getByTestId('account-pass').fill('short');
		await expect(page.getByTestId('account-pass-submit')).toBeDisabled();
		await expect(page.getByTestId('account-pass-requirements')).toBeVisible();
		await page.getByTestId('account-pass').fill('account-pass');
		await expect(page.getByTestId('account-pass-submit')).toBeDisabled();
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await expect(page.getByTestId('account-pass-submit')).toBeEnabled();
	});

	test('debug reset stay signed in returns to passphrase without GIS', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await page.getByTestId('debug-reset-cloud-stay').click();
		await page.getByTestId('debug-reset-cloud-stay-confirm').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await expect(page.getByTestId('google-sign-in')).toHaveCount(0);
	});

	test('debug reset and sign out shows Sign in again', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await page.getByTestId('debug-reset-cloud-sign-out').click();
		await Promise.all([
			page.waitForURL((url) => new URL(url).pathname === '/'),
			page.getByTestId('debug-reset-cloud-sign-out-confirm').click()
		]);
		await page.goto('/settings');
		await expect(page.getByTestId('google-sign-in')).toBeVisible();
	});

	test('185 recovery kit after three wrong unlocks', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await expect(page.getByTestId('hex-kit-screen')).toBeVisible();
		const kit = (await page.getByTestId('hex-kit-value').innerText()).trim();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await expect(page.getByTestId('hex-unlock-form')).toHaveCount(0);
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await expect(page.getByTestId('hex-unlock-form')).toHaveCount(0);
		await page.getByTestId('unlock-passphrase').fill('wrong-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('unlock-field-error-passphrase')).toBeVisible();
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('unlock-field-error-passphrase')).toBeVisible();
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('lockout-wait')).toBeVisible();
		await expect(page.getByTestId('unlock-passphrase')).toHaveCount(0);
		await page.getByTestId('account-recovery-open').click();
		await expect(page.getByTestId('account-recovery-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/recovery');
		await expect(page.getByTestId('recovery-back')).toBeVisible();
		await expect(page.getByTestId('account-recovery-screen')).toContainText(
			'Paste the kit you saved when you created this account.'
		);
		await expect(page.getByTestId('account-recovery-screen')).not.toContainText('already reset');
		await page.getByTestId('recovery-hex').fill(kit);
		await page.getByTestId('recovery-submit').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/reset');
		await page.reload();
		await expect(page.getByTestId('account-recovery-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/recovery');
		await expect(page.getByTestId('recovery-back')).toHaveCount(0);
		await expect(page.getByTestId('account-recovery-screen')).toContainText(
			'Your old passphrase is already reset. Paste the recovery kit to set a new passphrase.'
		);
		await expect(page.getByTestId('account-passphrase-screen')).toHaveCount(0);
		await expect(page.getByTestId('app-shell')).toHaveCount(0);
		await page.getByTestId('recovery-hex').fill(kit);
		await page.getByTestId('recovery-submit').click();
		await expect(page.getByTestId('account-passphrase-screen')).toBeVisible();
		await page.getByTestId('account-pass').fill('new-account-pass');
		await page.getByTestId('account-pass-confirm').fill('new-account-pass');
		await page.getByTestId('account-pass-submit').click();
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await expect(page.getByTestId('hex-kit-screen')).toHaveCount(0);
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await page.getByTestId('unlock-passphrase').fill('new-account-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('app-shell')).toBeVisible();
	});

	test('190 Back from recovery returns to Unlock', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await page.getByTestId('header-lock').click();
		await page.getByTestId('unlock-passphrase').fill('wrong-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('unlock-field-error-passphrase')).toBeVisible();
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('unlock-field-error-passphrase')).toBeVisible();
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('lockout-wait')).toBeVisible();
		await page.getByTestId('account-recovery-open').click();
		await expect(page.getByTestId('account-recovery-screen')).toBeVisible();
		await expect(page.getByTestId('account-recovery-screen')).not.toContainText('already reset');
		await page.getByTestId('recovery-back').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await expect(page.getByTestId('account-recovery-open')).toBeVisible();
		await expect(page.getByTestId('lockout-wait')).toBeVisible();
	});

	test('186 sidebar shows fake Google name and initials', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		let account = page.getByTestId('sidebar-account');
		if (!(await account.isVisible().catch(() => false))) {
			await page.getByTestId('open-menu').click();
			account = page.getByTestId('sidebar-account');
		}
		await expect(account).toBeVisible();
		await expect(account).toContainText('e2e@example.com');
		await expect(account).toContainText('e2e');
		await expect(account).toContainText('E2');
	});

	test('188 signed-in Privacy changes the account passphrase', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await expect(page.getByText('Old passphrase', { exact: true })).toBeVisible();
		await expect(page.getByText('New passphrase', { exact: true })).toBeVisible();
		await page.getByTestId('change-account-current').fill('wrong-pass');
		await page.getByTestId('change-account-pass').fill('new-account-pass');
		await page.getByTestId('change-account-pass-confirm').fill('new-account-pass');
		await page.getByTestId('change-account-submit').click();
		await expect(page.getByTestId('change-account-error')).toHaveText(/incorrect passphrase/i);
		await page.getByTestId('change-account-current').fill('account-pass');
		await page.getByTestId('change-account-pass').fill('account-pass');
		await page.getByTestId('change-account-pass-confirm').fill('account-pass');
		await expect(page.getByTestId('change-account-requirements')).toContainText(
			/must be different/i
		);
		await expect(page.getByTestId('change-account-submit')).toBeDisabled();
		await page.getByTestId('change-account-pass').fill('new-account-pass');
		await page.getByTestId('change-account-pass-confirm').fill('new-account-pass');
		await page.getByTestId('change-account-submit').click();
		await expect(page.getByTestId('change-account-error')).toHaveCount(0);
		await expect(page.getByTestId('change-account-current')).toHaveValue('');
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await page.getByTestId('unlock-passphrase').fill('new-account-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: 15_000 });
	});

	test('191 lock from Settings opens Unlock at home', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await goToNav(page, 'more');
		await expect(page.getByTestId('settings-panel')).toBeVisible();
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await expect.poll(() => new URL(page.url()).pathname).toBe('/unlock');
		await expect(page.getByTestId('account-unlock-screen')).toContainText(
			'Enter your account passphrase.'
		);
		await expect(page.getByTestId('account-unlock-screen')).not.toContainText(
			'optional device lock'
		);
		await page.getByTestId('unlock-passphrase').fill('account-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('home-panel')).toBeVisible();
		expect(new URL(page.url()).pathname).toBe('/');
		await expect(page.getByTestId('settings-panel')).toHaveCount(0);
	});

	test('211 live session wrong passphrase stays Incorrect passphrase', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await page.getByTestId('unlock-passphrase').fill('wrong-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('unlock-field-error-passphrase')).toHaveText(
			'Incorrect passphrase'
		);
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
	});

	test('211 cookie gone on account Unlock drops to device lock', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await page.evaluate(async () => {
			await fetch('http://127.0.0.1:8787/v1/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});
		});
		await page.getByTestId('unlock-passphrase').fill('account-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('account-unlock-screen')).toHaveCount(0);
		await expect(page.locator('body')).not.toContainText('unauthorized');
		await expect(page.getByTestId('unlock-screen')).toBeVisible();
		await expect(page.getByTestId('unlock-screen')).toContainText('Unlock this device');
		await page.getByTestId('unlock-passphrase').fill('account-pass');
		await page.getByTestId('unlock-submit').click();
		await expect(page.getByTestId('app-shell')).toBeVisible();
	});

	test('211 visible tab drops stale account Unlock', async ({ page }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		await page.getByTestId('header-lock').click();
		await expect(page.getByTestId('account-unlock-screen')).toBeVisible();
		await page.evaluate(async () => {
			await fetch('http://127.0.0.1:8787/v1/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await expect(page.getByTestId('account-unlock-screen')).toHaveCount(0);
		await expect(page.locator('body')).not.toContainText('unauthorized');
		await expect(page.getByTestId('unlock-screen')).toBeVisible();
	});

	test('211 sibling tab leaves account Unlock after sign-out', async ({ page, context }) => {
		await page.goto('/');
		await goToNav(page, 'more');
		await page.getByTestId('google-sign-in').click();
		await page.getByTestId('account-pass').fill('account-pass');
		await page.getByTestId('account-pass-confirm').fill('account-pass');
		await page.getByTestId('account-pass-submit').click();
		await confirmHexKit(page);
		await expect(page.getByTestId('app-shell')).toBeVisible();
		const other = await context.newPage();
		await other.goto('/');
		await expect(other.getByTestId('account-unlock-screen')).toBeVisible();
		await goToNav(page, 'more');
		await page.getByTestId('cloud-sign-out').click();
		await Promise.all([
			page.waitForURL((url) => new URL(url).pathname === '/'),
			page.getByTestId('cloud-sign-out-confirm').click()
		]);
		await expect(other.getByTestId('account-unlock-screen')).toHaveCount(0);
		await expect(other.locator('body')).not.toContainText('unauthorized');
		await expect(other.getByTestId('home-panel')).toBeVisible();
		await other.close();
	});
});
