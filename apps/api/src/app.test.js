import { describe, expect, it } from 'vitest';
import { createMemoryStore } from './memory-store.js';
import { createApp, onboardingState } from './app.js';

function fakeGoogle(idToken) {
	if (!idToken.startsWith('fake.')) return Promise.resolve(null);
	const [, sub, email] = idToken.split('.');
	return Promise.resolve({ sub, email: email || `${sub}@example.com` });
}

function appWith(store = createMemoryStore()) {
	return {
		store,
		app: createApp({
			store,
			verifyGoogle: fakeGoogle,
			webOrigin: 'http://127.0.0.1:4173',
			cookieSecure: false
		})
	};
}

function cookieHeader(res) {
	const set = res.headers.get('set-cookie') ?? '';
	const match = set.match(/pl_session=([^;]+)/);
	return match ? `pl_session=${match[1]}` : '';
}

describe('onboarding state', () => {
	it('resumes passphrase, kit, then complete', () => {
		expect(onboardingState({ wrap: null, recoveryWrap: null })).toBe('needs-passphrase');
		expect(onboardingState({ wrap: { kdf: 'pbkdf2-sha256' }, recoveryWrap: null })).toBe(
			'needs-kit'
		);
		expect(
			onboardingState({ wrap: { kdf: 'pbkdf2-sha256' }, recoveryWrap: { kdf: 'pbkdf2-sha256' } })
		).toBe('complete');
	});
});

describe('auth session', () => {
	it('issues a cookie for a valid Google token and never forces local-only users', async () => {
		const { app } = appWith();
		const res = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com', localHasData: false })
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.onboarding).toBe('needs-passphrase');
		expect(cookieHeader(res)).toMatch(/pl_session=/);
	});

	it('rejects a bad token', async () => {
		const { app } = appWith();
		const res = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'nope' })
		});
		expect(res.status).toBe(401);
	});

	it('blocks when cloud already has data and local is dirty unless they consent', async () => {
		const store = createMemoryStore();
		store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		store.putWrap('sub1', { wrap: { kdf: 'x' }, wrapRev: 0 });
		const { app } = appWith(store);
		const blocked = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com', localHasData: true })
		});
		expect(blocked.status).toBe(409);
		expect((await blocked.json()).error).toBe('local_conflict');

		const consented = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				idToken: 'fake.sub1.a@b.com',
				localHasData: true,
				discardLocal: true
			})
		});
		expect(consented.status).toBe(200);
	});

	it('lists and revokes sessions', async () => {
		const { app } = appWith();
		const a = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'user-agent': 'device-a' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const b = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'user-agent': 'device-b' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookieA = cookieHeader(a);
		const cookieB = cookieHeader(b);
		const list = await app.request('/v1/sessions', { headers: { cookie: cookieA } });
		const sessions = (await list.json()).sessions;
		expect(sessions).toHaveLength(2);
		const other = sessions.find((s) => !s.current);
		const revoked = await app.request(`/v1/sessions/${other.id}`, {
			method: 'DELETE',
			headers: { cookie: cookieA }
		});
		expect(revoked.status).toBe(200);
		const after = await app.request('/v1/me', { headers: { cookie: cookieB } });
		expect(after.status).toBe(401);
	});
});

describe('sync CAS', () => {
	it('returns 409 on stale rev and stores gravestones', async () => {
		const { app } = appWith();
		const login = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookie = cookieHeader(login);
		const created = await app.request('/v1/sync/tx/tx1', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ rev: 0, blob: 'sealed-a' })
		});
		expect(created.status).toBe(200);
		expect((await created.json()).rev).toBe(1);

		const stale = await app.request('/v1/sync/tx/tx1', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ rev: 0, blob: 'sealed-b' })
		});
		expect(stale.status).toBe(409);

		const tomb = await app.request('/v1/sync/tx/tx1', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ rev: 1, deleted: true })
		});
		const body = await tomb.json();
		expect(body.deleted).toBe(true);
		expect(body.rev).toBe(2);

		const pull = await app.request('/v1/sync', { headers: { cookie } });
		expect((await pull.json()).entities[0].deleted).toBe(true);
	});

	it('CAS-updates the coat-check wrap', async () => {
		const { app } = appWith();
		const login = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookie = cookieHeader(login);
		const first = await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ wrap: { kdf: 'pbkdf2-sha256' }, wrapRev: 0 })
		});
		expect((await first.json()).onboarding).toBe('needs-kit');
		const kit = await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({
				recoveryWrap: { kdf: 'pbkdf2-sha256' },
				wrapRev: 1
			})
		});
		expect((await kit.json()).onboarding).toBe('complete');
		const stale = await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ wrap: { kdf: 'other' }, wrapRev: 1 })
		});
		expect(stale.status).toBe(409);
	});
});

describe('debug reset cloud', () => {
	it('rejects without a session', async () => {
		const { app } = appWith();
		const res = await app.request('/v1/debug/reset-cloud', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ signOut: true })
		});
		expect(res.status).toBe(401);
	});

	it('signOut true deletes the user and clears the cookie', async () => {
		const { app, store } = appWith();
		const login = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookie = cookieHeader(login);
		await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ wrap: { kdf: 'pbkdf2-sha256' }, wrapRev: 0 })
		});
		await app.request('/v1/sync/tx/tx1', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ rev: 0, blob: 'sealed' })
		});
		const reset = await app.request('/v1/debug/reset-cloud', {
			method: 'POST',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ signOut: true })
		});
		expect(reset.status).toBe(200);
		expect((await reset.json()).signedOut).toBe(true);
		expect(store.getUser('sub1')).toBeNull();
		const me = await app.request('/v1/me', { headers: { cookie } });
		expect(me.status).toBe(401);
		const again = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com', localHasData: false })
		});
		expect((await again.json()).onboarding).toBe('needs-passphrase');
	});

	it('signOut false keeps the session and needs-passphrase', async () => {
		const { app } = appWith();
		const login = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookie = cookieHeader(login);
		await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({
				wrap: { kdf: 'pbkdf2-sha256' },
				recoveryWrap: { kdf: 'pbkdf2-sha256' },
				wrapRev: 0
			})
		});
		const reset = await app.request('/v1/debug/reset-cloud', {
			method: 'POST',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ signOut: false })
		});
		expect(reset.status).toBe(200);
		const body = await reset.json();
		expect(body.signedOut).toBe(false);
		expect(body.onboarding).toBe('needs-passphrase');
		const me = await app.request('/v1/me', { headers: { cookie } });
		expect(me.status).toBe(200);
		expect((await me.json()).onboarding).toBe('needs-passphrase');
	});
});
