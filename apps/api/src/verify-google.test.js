import { describe, expect, it } from 'vitest';
import { verifyGoogleToken } from './verify-google.js';

describe('verifyGoogleToken fake tokens', () => {
	it('accepts fake.<sub>.<email> when AUTH_ALLOW_FAKE is on and AUTH_FAKE_SUB is unset', async () => {
		const identity = await verifyGoogleToken('fake.sub1.a@b.com', {
			allowFake: true,
			allowedSub: '',
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
		const identity = await verifyGoogleToken('fake.pl-debug-cursor.cursor-debug@pocket-ledger.test', {
			allowFake: false,
			allowedSub: 'pl-debug-cursor',
			googleClientId: ''
		});
		expect(identity).toBeNull();
	});

	it('rejects a fake sub that is not AUTH_FAKE_SUB', async () => {
		const identity = await verifyGoogleToken('fake.other.a@b.com', {
			allowFake: true,
			allowedSub: 'pl-debug-cursor',
			googleClientId: ''
		});
		expect(identity).toBeNull();
	});

	it('accepts the allowlisted debug fake token', async () => {
		const identity = await verifyGoogleToken(
			'fake.pl-debug-cursor.cursor-debug@pocket-ledger.test',
			{
				allowFake: true,
				allowedSub: 'pl-debug-cursor',
				googleClientId: ''
			}
		);
		expect(identity).toEqual({
			sub: 'pl-debug-cursor',
			email: 'cursor-debug@pocket-ledger.test',
			name: 'cursor-debug',
			picture: ''
		});
	});

	it('keeps dots in the fake email after the first sub segment', async () => {
		const identity = await verifyGoogleToken('fake.sub1.e2e@example.com', {
			allowFake: true,
			allowedSub: '',
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
