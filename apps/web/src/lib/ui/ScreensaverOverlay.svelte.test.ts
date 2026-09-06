import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import '../../app.css';
import ScreensaverOverlay from './ScreensaverOverlay.svelte';

function css(el: Element, prop: string): string {
	return getComputedStyle(el).getPropertyValue(prop).trim();
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
	expect(node.classList.contains('screensaver-overlay')).toBe(true);
	expect(css(node, 'appearance') === 'none' || css(node, '-webkit-appearance') === 'none').toBe(
		true
	);
	expect(css(node, 'color-scheme')).toBe('light');
	expect(css(node, 'background-color')).toBe('rgb(0, 0, 0)');

	const icon = node.querySelector('[aria-hidden="true"]');
	const label = [...node.querySelectorAll('span')].find((el) => el !== icon);
	expect(icon).not.toBeNull();
	expect(label).toBeTruthy();
	expect(isTransparent(css(icon!, 'background-color'))).toBe(true);
	expect(isTransparent(css(label!, 'background-color'))).toBe(true);
});
