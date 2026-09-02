import type { CategoryKind } from './default-category-catalog';
import { factoryGroupIds, type OverlayGroup } from './category-overlay';

/** Group ids in display order for both kinds (Spec 125 reorder session). */
export type KindGroupOrder = {
	income: string[];
	expense: string[];
};

/** Current resolved order, split by kind, preserving relative order in `groups`. */
export function snapshotGroupOrders(groups: OverlayGroup[]): KindGroupOrder {
	return {
		income: groups.filter((g) => g.kind === 'income').map((g) => g.id),
		expense: groups.filter((g) => g.kind === 'expense').map((g) => g.id)
	};
}

export function cloneKindGroupOrder(order: KindGroupOrder): KindGroupOrder {
	return { income: [...order.income], expense: [...order.expense] };
}

export function isReorderDirty(draft: KindGroupOrder, snapshot: KindGroupOrder): boolean {
	return (
		draft.income.join('\0') !== snapshot.income.join('\0') ||
		draft.expense.join('\0') !== snapshot.expense.join('\0')
	);
}

export function setKindOrder(
	draft: KindGroupOrder,
	kind: CategoryKind,
	ids: string[]
): KindGroupOrder {
	const next = cloneKindGroupOrder(draft);
	next[kind] = [...ids];
	return next;
}

/** Factory stock order, then custom groups of that kind (Spec 123 Reset). */
export function resetKindInOrder(
	draft: KindGroupOrder,
	groups: OverlayGroup[],
	kind: CategoryKind
): KindGroupOrder {
	const customs = groups.filter((g) => g.kind === kind && g.source === 'custom');
	return setKindOrder(draft, kind, factoryGroupIds(kind, customs));
}

/** Factory order for income and expense (Spec 146). */
export function resetBothKindsInOrder(
	draft: KindGroupOrder,
	groups: OverlayGroup[]
): KindGroupOrder {
	return resetKindInOrder(resetKindInOrder(draft, groups, 'income'), groups, 'expense');
}

export function groupsInOrder(groups: OverlayGroup[], ids: string[]): OverlayGroup[] {
	const byId = new Map(groups.map((g) => [g.id, g]));
	return ids.flatMap((id) => {
		const group = byId.get(id);
		return group ? [group] : [];
	});
}
