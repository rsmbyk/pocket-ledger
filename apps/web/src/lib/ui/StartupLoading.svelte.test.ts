import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import StartupLoading from './StartupLoading.svelte';

test('221 startup splash is a loading icon without copy', async () => {
	const screen = await render(StartupLoading);

	const splash = screen.getByTestId('startup-loading');
	await expect.element(splash).toBeVisible();
	await expect.element(splash).toHaveAttribute('role', 'status');
	await expect.element(splash).toHaveAttribute('aria-label', 'Loading');
	await expect.element(splash).toHaveTextContent('');

	expect(screen.container.querySelector('svg')).not.toBeNull();
	expect(screen.container.textContent).not.toMatch(/Starting up|Preparing your local ledger/i);
});
