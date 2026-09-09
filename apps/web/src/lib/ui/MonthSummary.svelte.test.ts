import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import MonthSummaryCard from './MonthSummary.svelte';
import type { MonthSummary } from '$lib/domain/month-summary';

const summary: MonthSummary = {
	monthKey: '2026-09',
	incomeMinor: 100,
	expenseMinor: 40,
	netMinor: 60,
	incomeByCategory: [],
	expenseByCategory: [],
	openingMinor: 0,
	endingMinor: 60,
	transferInMinor: 0,
	transferOutMinor: 0,
	transferNetMinor: 0
};

test('245 loading month card keeps chrome and pulses the body', async () => {
	const screen = await render(MonthSummaryCard, {
		summary,
		currencyLabel: 'IDR',
		canPrev: true,
		canNext: true,
		loading: true,
		onPrevMonth: () => {},
		onNextMonth: () => {}
	});

	expect(screen.container.querySelector('[data-testid="month-summary"]')).not.toBeNull();
	expect(screen.getByTestId('month-label').element().textContent).toMatch(/September 2026/);
	expect(screen.container.querySelector('[data-testid="month-summary-skeleton"]')).not.toBeNull();
	expect(screen.container.querySelector('[data-testid="month-income"]')).toBeNull();

	const prev = screen.getByRole('button', { name: 'Previous month' }).element();
	const next = screen.getByRole('button', { name: 'Next month' }).element();
	expect(prev.hasAttribute('disabled')).toBe(true);
	expect(next.hasAttribute('disabled')).toBe(true);
});
