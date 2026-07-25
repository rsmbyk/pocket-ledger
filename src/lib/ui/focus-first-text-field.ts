/** Input types that are not typing fields (skip for modal autofocus). */
const SKIP_INPUT_TYPES = new Set([
	'button',
	'submit',
	'reset',
	'checkbox',
	'radio',
	'file',
	'hidden',
	'image',
	'date',
	'datetime-local',
	'month',
	'week',
	'time',
	'color',
	'range'
]);

/**
 * Whether an element is an enabled, visible text-entry control
 * (typing input, textarea, or native select).
 */
export function isTextEntryField(el: Element): el is HTMLElement {
	if (!(el instanceof HTMLElement)) return false;

	if (el instanceof HTMLTextAreaElement) {
		if (el.disabled || el.readOnly) return false;
	} else if (el instanceof HTMLSelectElement) {
		if (el.disabled) return false;
	} else if (el instanceof HTMLInputElement) {
		const type = (el.getAttribute('type') ?? el.type ?? 'text').toLowerCase();
		if (SKIP_INPUT_TYPES.has(type)) return false;
		if (el.disabled || el.readOnly) return false;
	} else {
		return false;
	}

	if (el.hidden) return false;
	if (el.getAttribute('aria-hidden') === 'true') return false;
	if (el.closest('[hidden], [aria-hidden="true"]')) return false;

	// Do not check opacity — Dialog/Sheet enter animations start at opacity 0,
	// and onOpenAutoFocus runs during that window.
	if (typeof el.checkVisibility === 'function') {
		try {
			if (!el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true })) {
				return false;
			}
		} catch {
			// Some environments throw when the node is detached; treat as not visible.
			return false;
		}
	}

	return true;
}

/** First enabled visible text-entry control under `root`, or null. */
export function findFirstTextField(root: ParentNode): HTMLElement | null {
	const candidates = root.querySelectorAll('input, textarea, select');
	for (const el of candidates) {
		if (isTextEntryField(el)) return el;
	}
	return null;
}

/**
 * Focus the first text-entry field under `root`.
 * @returns true if a field was focused
 */
export function focusFirstTextField(root: ParentNode): boolean {
	const el = findFirstTextField(root);
	if (!el) return false;
	el.focus();
	return true;
}
