/** A named group with a stable id (stock or custom). */
export type CatalogFilterGroup = {
	id: string;
	name: string;
};

/** A named category that belongs to a group. */
export type CatalogFilterCategory = {
	id: string;
	name: string;
	groupId: string;
};

export type FilteredCatalogGroup<G extends CatalogFilterGroup, C extends CatalogFilterCategory> = {
	group: G;
	categories: C[];
};

function matchesLabel(label: string, query: string): boolean {
	return label.toLowerCase().includes(query);
}

/**
 * Filter groups/categories of one kind by a live search query.
 * Blank query → all groups. Group-name match → every category in that group.
 */
export function filterCatalogGroups<G extends CatalogFilterGroup, C extends CatalogFilterCategory>(
	groups: G[],
	categories: C[],
	query: string
): FilteredCatalogGroup<G, C>[] {
	const needle = query.trim().toLowerCase();
	const result: FilteredCatalogGroup<G, C>[] = [];
	for (const group of groups) {
		const inGroup = categories.filter((c) => c.groupId === group.id);
		if (!needle) {
			result.push({ group, categories: inGroup });
			continue;
		}
		if (matchesLabel(group.name, needle)) {
			result.push({ group, categories: inGroup });
			continue;
		}
		const matched = inGroup.filter((c) => matchesLabel(c.name, needle));
		if (matched.length > 0) {
			result.push({ group, categories: matched });
		}
	}
	return result;
}
