/** True when a native date/month picker should not dismiss a dialog/sheet. */
export function shouldIgnoreDismissForNativePicker(e: Event): boolean {
	const active = document.activeElement;
	if (active instanceof HTMLInputElement && (active.type === 'date' || active.type === 'month')) {
		return true;
	}
	const t = e.target;
	if (t instanceof HTMLInputElement && (t.type === 'date' || t.type === 'month')) {
		return true;
	}
	return false;
}

/** Portaled popovers (filter Type/Pocket/Category) sit outside the Filters sheet. */
export function shouldIgnoreDismissForFloatingMenu(e: Event): boolean {
	const t = e.target;
	if (!(t instanceof Element)) return false;
	return Boolean(
		t.closest('[data-testid="filter-check-menu"]') || t.closest('[data-slot="popover-content"]')
	);
}
