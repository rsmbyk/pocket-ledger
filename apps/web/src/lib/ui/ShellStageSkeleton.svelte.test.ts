import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import ShellStageSkeleton from './ShellStageSkeleton.svelte';

test('245 home skeleton is a loading status without ledger copy or a Plans card', async () => {
	const screen = await render(ShellStageSkeleton, { route: 'home' });

	const stage = screen.getByTestId('shell-stage-skeleton').element();
	expect(stage.getAttribute('role')).toBe('status');
	expect(stage.getAttribute('aria-label')).toBe('Loading');
	expect(stage.getAttribute('aria-busy')).toBe('true');
	expect(screen.container.querySelector('[data-testid="shell-skeleton-home"]')).not.toBeNull();

	expect(screen.container.textContent).not.toMatch(/Starting up|Preparing your local ledger/i);
	expect(screen.container.querySelector('[data-testid="home-plans-card"]')).toBeNull();
	expect(screen.container.querySelector('[data-testid="home-panel"]')).toBeNull();
	expect(screen.container.querySelectorAll('[data-testid="shell-skeleton-row"]').length).toBe(5);
});

test('245 transactions skeleton uses the list variant', async () => {
	const screen = await render(ShellStageSkeleton, { route: 'transactions' });
	expect(screen.container.querySelector('[data-testid="shell-skeleton-transactions"]')).not.toBeNull();
	expect(screen.container.querySelector('[data-testid="activity-panel"]')).toBeNull();
});

test('245 plans skeleton uses the list variant', async () => {
	const screen = await render(ShellStageSkeleton, { route: 'plans' });
	expect(screen.container.querySelector('[data-testid="shell-skeleton-plans"]')).not.toBeNull();
});

test('245 pockets list skeleton has card pulses', async () => {
	const screen = await render(ShellStageSkeleton, { route: 'pockets' });
	expect(screen.container.querySelector('[data-testid="shell-skeleton-pockets"]')).not.toBeNull();
});

test('245 pocket details skeleton wins over the pockets list', async () => {
	const screen = await render(ShellStageSkeleton, { route: 'pockets', pocketDetails: true });
	expect(screen.container.querySelector('[data-testid="shell-skeleton-pocket-details"]')).not.toBeNull();
	expect(screen.container.querySelector('[data-testid="shell-skeleton-pockets"]')).toBeNull();
});

test('245 categories and settings have their own skeletons', async () => {
	const categories = await render(ShellStageSkeleton, { route: 'categories' });
	expect(categories.container.querySelector('[data-testid="shell-skeleton-categories"]')).not.toBeNull();
	categories.unmount();

	const settings = await render(ShellStageSkeleton, { route: 'settings' });
	expect(settings.container.querySelector('[data-testid="shell-skeleton-settings"]')).not.toBeNull();
});
