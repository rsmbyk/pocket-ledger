import { cleanup, render } from 'vitest-browser-svelte';
import { afterEach, expect, test } from 'vitest';
import UnlockScreen from './UnlockScreen.svelte';

afterEach(() => cleanup());

function inputOf(screen: Awaited<ReturnType<typeof render>>) {
	return screen.getByTestId('unlock-passphrase').element() as HTMLInputElement;
}

test('254 focuses the passphrase field on mount', async () => {
	const screen = await render(UnlockScreen, { onUnlock: () => {} });
	const input = inputOf(screen);
	expect(document.activeElement).toBe(input);
});

test('254 submit uses the input DOM value even when no input event fired', async () => {
	const seen: string[] = [];
	const screen = await render(UnlockScreen, {
		onUnlock: (passphrase: string) => {
			seen.push(passphrase);
		}
	});
	const input = inputOf(screen);
	// Password-manager autofill without an `input` event: DOM value set,
	// component state never told.
	input.value = 'autofilled-secret';
	input.form?.requestSubmit();
	await expect.poll(() => seen).toEqual(['autofilled-secret']);
});

test('254 empty passphrase never calls onUnlock', async () => {
	let calls = 0;
	const screen = await render(UnlockScreen, {
		onUnlock: () => {
			calls += 1;
		}
	});
	inputOf(screen).form?.requestSubmit();
	await new Promise((resolve) => setTimeout(resolve, 10));
	expect(calls).toBe(0);
});

test('254 button is enabled while idle and disables while checking', async () => {
	let release!: () => void;
	const gate = new Promise<void>((resolve) => (release = resolve));
	const screen = await render(UnlockScreen, { onUnlock: () => gate });
	const button = screen.getByTestId('unlock-submit').element() as HTMLButtonElement;

	// Idle with an empty field must stay submittable (Enter relies on it).
	expect(button.disabled).toBe(false);

	const input = inputOf(screen);
	input.value = 'secret-pass';
	input.form?.requestSubmit();
	await expect.poll(() => button.disabled).toBe(true);

	release();
	await expect.poll(() => button.disabled).toBe(false);
});
