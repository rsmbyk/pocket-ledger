import { describe, expect, it } from 'vitest';
import {
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

	it('treats native select as a text-entry field', () => {
		const root = mount(`
			<button type="button">Clear</button>
			<select data-id="type"><option>All</option></select>
			<input type="text" data-id="amount" />
		`);
		expect(findFirstTextField(root)?.getAttribute('data-id')).toBe('type');
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
