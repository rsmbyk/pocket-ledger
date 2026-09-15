import { describe, expect, it } from 'vitest';
import { verifyGoogleToken } from './verify-google.js';

describe('verifyGoogleToken fake tokens', () => {
	it('accepts fake.<sub>.<email> when AUTH_ALLOW_FAKE is on', async () => {
		const identity = await verifyGoogleToken('fake.sub1.a@b.com', {
			allowFake: true,
			googleClientId: ''
		});
		expect(identity).toEqual({
			sub: 'sub1',
			email: 'a@b.com',
			name: 'a',
			picture: ''
		});
	});

	it('rejects fake tokens when AUTH_ALLOW_FAKE is off', async () => {
		const identity = await verifyGoogleToken('fake.sub1.a@b.com', {
			allowFake: false,
			googleClientId: ''
		});
		expect(identity).toBeNull();
	});

	it('keeps dots in the fake email after the first sub segment', async () => {
		const identity = await verifyGoogleToken('fake.sub1.e2e@example.com', {
			allowFake: true,
			googleClientId: ''
		});
		expect(identity).toEqual({
			sub: 'sub1',
			email: 'e2e@example.com',
			name: 'e2e',
			picture: ''
		});
	});
});
