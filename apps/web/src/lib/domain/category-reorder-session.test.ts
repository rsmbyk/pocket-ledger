import { describe, expect, it } from 'vitest';
import type { OverlayGroup } from './category-overlay';
import {
	cloneKindGroupOrder,
	groupsInOrder,
	isReorderDirty,
	resetKindInOrder,
	setKindOrder,
	snapshotGroupOrders
} from './category-reorder-session';

function group(
	id: string,
	kind: OverlayGroup['kind'],
	source: OverlayGroup['source'],
	createdAt = '2026-01-01T00:00:00.000Z'
): OverlayGroup {
	return { id, name: id, kind, createdAt, source };
}

const work = group('stock-group:work', 'income', 'stock');
const business = group('stock-group:business-creating', 'income', 'stock');
const home = group('stock-group:home', 'expense', 'stock');
const utilities = group('stock-group:utilities', 'expense', 'stock');
const side = group('custom-side', 'expense', 'custom', '2026-08-02T00:00:00.000Z');

describe('category-reorder-session', () => {
	it('snapshots income and expense ids in the given list order', () => {
		const groups = [utilities, work, home, business, side];
		expect(snapshotGroupOrders(groups)).toEqual({
			income: [work.id, business.id],
			expense: [utilities.id, home.id, side.id]
		});
	});

	it('is dirty when either kind differs', () => {
		const snapshot = snapshotGroupOrders([work, business, home, utilities]);
		const same = cloneKindGroupOrder(snapshot);
		expect(isReorderDirty(same, snapshot)).toBe(false);
		const expenseMoved = setKindOrder(snapshot, 'expense', [utilities.id, home.id]);
		expect(isReorderDirty(expenseMoved, snapshot)).toBe(true);
		const incomeMoved = setKindOrder(snapshot, 'income', [business.id, work.id]);
		expect(isReorderDirty(incomeMoved, snapshot)).toBe(true);
	});

	it('reset restores factory stock then customs for one kind only', () => {
		const groups = [utilities, home, side, business, work];
		const snapshot = snapshotGroupOrders(groups);
		const draft = setKindOrder(snapshot, 'expense', [side.id, utilities.id, home.id]);
		const reset = resetKindInOrder(draft, groups, 'expense');
		expect(reset.expense[0]).toBe(home.id);
		expect(reset.expense[1]).toBe(utilities.id);
		expect(reset.expense.at(-1)).toBe(side.id);
		expect(reset.income).toEqual(snapshot.income);
	});

	it('maps ids back to groups and drops unknown ids', () => {
		const groups = [home, utilities, work];
		expect(groupsInOrder(groups, [utilities.id, 'missing', home.id]).map((g) => g.id)).toEqual([
			utilities.id,
			home.id
		]);
	});
});
