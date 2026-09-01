import { describe, expect, test } from 'vitest';
import { buttonVariants } from '$lib/components/ui/button/button.svelte';

describe('133 button heights are desktop-sized at every viewport', () => {
	test('labeled default, sm, and lg are h-9', () => {
		for (const size of ['default', 'sm', 'lg'] as const) {
			const cls = buttonVariants({ size });
			expect(cls).toContain('h-9');
			expect(cls).not.toMatch(/(?:^|\s)h-10(?:\s|$)/);
			expect(cls).not.toMatch(/(?:^|\s)h-11(?:\s|$)/);
			expect(cls).not.toMatch(/md:h-/);
		}
	});

	test('icon sizes use the former md+ square', () => {
		expect(buttonVariants({ size: 'icon' })).toContain('size-9');
		expect(buttonVariants({ size: 'icon' })).not.toMatch(/md:size-/);
		expect(buttonVariants({ size: 'icon-sm' })).toContain('size-8');
		expect(buttonVariants({ size: 'icon-sm' })).not.toMatch(/md:size-/);
		expect(buttonVariants({ size: 'icon-lg' })).toContain('size-10');
		expect(buttonVariants({ size: 'icon-lg' })).not.toMatch(/md:size-/);
	});
});
