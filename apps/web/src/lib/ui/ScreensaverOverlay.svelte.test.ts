import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import ScreensaverOverlay from './ScreensaverOverlay.svelte';

function cssColor(el: Element, prop: 'background-color' | 'appearance' | 'color-scheme'): string {
	return getComputedStyle(el).getPropertyValue(prop);
}

function isTransparent(color: string): boolean {
	return color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

test('screensaver prompt and icon sit on a transparent content box', async () => {
	const screen = await render(ScreensaverOverlay, {
		signedIn: false,
		lockEnabled: false,
		onContinue: () => {}
	});

	const overlay = screen.getByTestId('screensaver');
	await expect.element(overlay).toBeVisible();
	await expect.element(overlay).toHaveTextContent('Click to continue');

	const node = overlay.element();
	expect(node.tagName).toBe('BUTTON');
	expect(cssColor(node, 'appearance')).toBe('none');
	expect(cssColor(node, 'color-scheme')).toBe('light');

	const icon = node.querySelector('[aria-hidden="true"]');
	const label = [...node.querySelectorAll('span')].find((el) => el !== icon);
	expect(icon).not.toBeNull();
	expect(label).toBeTruthy();
	expect(isTransparent(cssColor(icon!, 'background-color'))).toBe(true);
	expect(isTransparent(cssColor(label!, 'background-color'))).toBe(true);
});
