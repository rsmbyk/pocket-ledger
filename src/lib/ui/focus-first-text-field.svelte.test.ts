import { describe, expect, it } from 'vitest';
import {
	applyModalOpenFocus,
	findFirstTextField,
	focusFirstTextField,
	isTextEntryField
} from './focus-first-text-field';

function mount(html: string): HTMLElement {
	const root = document.createElement('div');
	root.innerHTML = html;
	document.body.appendChild(root);
	return root;
}

describe('focus-first-text-field', () => {
	it('finds the first text input, skipping buttons and tabs', () => {
		const root = mount(`
			<button type="button">Tab</button>
			<input type="text" data-id="name" />
			<input type="text" data-id="other" />
		`);
		const found = findFirstTextField(root);
		expect(found?.getAttribute('data-id')).toBe('name');
		expect(focusFirstTextField(root)).toBe(true);
		expect(document.activeElement).toBe(found);
		root.remove();
	});

	it('skips checkbox, radio, date, disabled, and readonly', () => {
		const root = mount(`
			<input type="checkbox" />
			<input type="radio" name="r" />
			<input type="date" />
			<input type="text" disabled />
			<input type="text" readonly />
			<textarea data-id="note"></textarea>
		`);
		const found = findFirstTextField(root);
		expect(found?.getAttribute('data-id')).toBe('note');
		expect(isTextEntryField(root.querySelector('input[type="date"]')!)).toBe(false);
		root.remove();
	});

	it('skips native select and focuses the next text input', () => {
		const root = mount(`
			<button type="button">Clear</button>
			<select data-id="type"><option>All</option></select>
			<input type="text" data-id="amount" />
		`);
		expect(isTextEntryField(root.querySelector('select')!)).toBe(false);
		expect(findFirstTextField(root)?.getAttribute('data-id')).toBe('amount');
		root.remove();
	});

	it('applyModalOpenFocus focuses panel when first focusable is select', () => {
		const root = mount(`
			<select data-id="type"><option>All</option></select>
			<button type="button">Apply</button>
		`);
		expect(applyModalOpenFocus(root)).toBe(true);
		expect(document.activeElement).toBe(root);
		expect(root.querySelector('select')).not.toBe(document.activeElement);
		root.remove();
	});

	it('applyModalOpenFocus leaves default when first focusable is a button', () => {
		const root = mount(`
			<button type="button">Cancel</button>
			<button type="button">Confirm</button>
		`);
		expect(applyModalOpenFocus(root)).toBe(false);
		root.remove();
	});

	it('returns null when only select/checkbox controls exist', () => {
		const root = mount(`
			<select data-id="type"><option>All</option></select>
			<input type="checkbox" />
		`);
		expect(findFirstTextField(root)).toBeNull();
		expect(focusFirstTextField(root)).toBe(false);
		root.remove();
	});

	it('returns false when no text-entry field exists', () => {
		const root = mount(`
			<button type="button">Cancel</button>
			<button type="button">Confirm</button>
			<input type="checkbox" />
		`);
		expect(findFirstTextField(root)).toBeNull();
		expect(focusFirstTextField(root)).toBe(false);
		root.remove();
	});

	it('skips controls inside hidden ancestors', () => {
		const root = mount(`
			<div hidden><input type="text" data-id="hidden" /></div>
			<input type="password" data-id="pass" />
		`);
		expect(findFirstTextField(root)?.getAttribute('data-id')).toBe('pass');
		root.remove();
	});
});
