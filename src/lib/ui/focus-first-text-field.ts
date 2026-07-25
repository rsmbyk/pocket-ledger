/** Input types that are not typing fields (never autofocus these). */
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

/** Non-text form controls that must not receive open autofocus. */
const NON_TEXT_FORM_TYPES = new Set([
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

function isVisible(el: HTMLElement): boolean {
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
			return false;
		}
	}

	return true;
}

/**
 * Whether an element is an enabled, visible text control
 * (typing `input` or `textarea` — not select, checkbox, date, etc.).
 */
export function isTextEntryField(el: Element): el is HTMLElement {
	if (!(el instanceof HTMLElement)) return false;

	if (el instanceof HTMLTextAreaElement) {
		if (el.disabled || el.readOnly) return false;
	} else if (el instanceof HTMLInputElement) {
		const type = (el.getAttribute('type') ?? el.type ?? 'text').toLowerCase();
		if (SKIP_INPUT_TYPES.has(type)) return false;
		if (el.disabled || el.readOnly) return false;
	} else {
		return false;
	}

	return isVisible(el);
}

/** Native select / checkbox / radio / date / etc. — never open-autofocus these. */
export function isNonTextFormControl(el: Element): boolean {
	if (el instanceof HTMLSelectElement) return true;
	if (!(el instanceof HTMLInputElement)) return false;
	const type = (el.getAttribute('type') ?? el.type ?? 'text').toLowerCase();
	return NON_TEXT_FORM_TYPES.has(type);
}

/** First enabled visible text control under `root`, or null. */
export function findFirstTextField(root: ParentNode): HTMLElement | null {
	const candidates = root.querySelectorAll('input, textarea');
	for (const el of candidates) {
		if (isTextEntryField(el)) return el;
	}
	return null;
}

/**
 * Focus the first text field under `root`.
 * @returns true if a field was focused
 */
export function focusFirstTextField(root: ParentNode): boolean {
	const el = findFirstTextField(root);
	if (!el) return false;
	el.focus();
	return true;
}

/**
 * Handle Dialog/Sheet open autofocus: prefer a text field; otherwise leave
 * bits-ui default unless that would land on a non-text form control (select,
 * checkbox, date, …) — then focus the panel root instead.
 * @returns true if default autofocus was overridden (`preventDefault` needed)
 */
export function applyModalOpenFocus(root: HTMLElement): boolean {
	if (focusFirstTextField(root)) return true;

	const candidate = firstFocusable(root);
	if (candidate && isNonTextFormControl(candidate)) {
		if (typeof root.tabIndex !== 'number' || root.tabIndex < 0) {
			root.tabIndex = -1;
		}
		root.focus();
		return true;
	}

	return false;
}

function firstFocusable(root: HTMLElement): HTMLElement | null {
	const nodes = root.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);
	for (const node of nodes) {
		if (!(node instanceof HTMLElement)) continue;
		if (node === root) continue;
		if (!isVisible(node)) continue;
		if (node instanceof HTMLButtonElement && node.disabled) continue;
		if (node instanceof HTMLInputElement && node.disabled) continue;
		if (node instanceof HTMLSelectElement && node.disabled) continue;
		if (node instanceof HTMLTextAreaElement && node.disabled) continue;
		const ti = node.getAttribute('tabindex');
		if (ti === '-1') continue;
		return node;
	}
	return null;
}
