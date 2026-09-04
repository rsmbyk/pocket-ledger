import { describe, expect, it } from 'vitest';
import { displayNameFromIdentity, profileInitials } from './google-profile';

describe('google profile display', () => {
	it('falls back to the email local-part', () => {
		expect(displayNameFromIdentity('', 'cursor-debug@pocket-ledger.test')).toBe('cursor-debug');
		expect(displayNameFromIdentity('Ada Lovelace', 'a@b.com')).toBe('Ada Lovelace');
	});

	it('builds initials from the display name', () => {
		expect(profileInitials('cursor-debug', 'cursor-debug@pocket-ledger.test')).toBe('CD');
		expect(profileInitials('Ada Lovelace', 'a@b.com')).toBe('AL');
	});
});
