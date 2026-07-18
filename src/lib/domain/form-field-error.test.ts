import { describe, expect, it } from 'vitest';
import { classifyFormFieldError } from './form-field-error';

describe('classifyFormFieldError', () => {
	it('maps amount messages', () => {
		expect(classifyFormFieldError('Amount is required')).toBe('amount');
		expect(classifyFormFieldError('Amount must be greater than zero')).toBe('amount');
		expect(classifyFormFieldError('Amount must be a whole number')).toBe('amount');
	});

	it('maps date and pocket messages', () => {
		expect(classifyFormFieldError('Date must be YYYY-MM-DD')).toBe('occurredOn');
		expect(classifyFormFieldError('As-of date must be YYYY-MM-DD')).toBe('asOf');
		expect(classifyFormFieldError('Choose source and destination pockets')).toBe('source');
		expect(classifyFormFieldError('Source and destination must be different')).toBe('dest');
	});

	it('maps passphrase and form-level', () => {
		expect(classifyFormFieldError('Passphrases do not match')).toBe('passphraseConfirm');
		expect(classifyFormFieldError('Passphrase must be at least 8 characters')).toBe('passphrase');
		expect(classifyFormFieldError('Incorrect passphrase')).toBe('passphrase');
		expect(classifyFormFieldError('Transaction not found')).toBe('form');
		expect(classifyFormFieldError('Something went wrong')).toBe('form');
	});

	it('maps opening and name', () => {
		expect(classifyFormFieldError('Opening balance must be a whole number')).toBe('opening');
		expect(classifyFormFieldError('Name is required')).toBe('name');
		expect(classifyFormFieldError('Choose a category for this type')).toBe('category');
	});
});
