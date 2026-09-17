import { describe, expect, it } from 'vitest';
import { createMemoryStore } from './memory-store.js';
import { createApp, onboardingState } from './app.js';

function fakeGoogle(idToken) {
	if (!idToken.startsWith('fake.')) return Promise.resolve(null);
	const [, sub, email] = idToken.split('.');
	return Promise.resolve({ sub, email: email || `${sub}@example.com` });
}

function appWith(store = createMemoryStore(), extra = {}) {
	return {
		store,
		app: createApp({
			store,
			verifyGoogle: fakeGoogle,
			webOrigin: 'http://127.0.0.1:4173',
			cookieSecure: false,
			...extra
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

	it('returns labeled sessions without public userAgent and puts current first', async () => {
		const store = createMemoryStore();
		const { app } = appWith(store, {
			lookupArea: () => ({ city: 'Bandung', region: 'West Java', country: 'ID' })
		});
		const a = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'user-agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
				'x-forwarded-for': '203.0.113.9',
				'x-pl-client': 'browser',
				'x-pl-browser': 'Chrome 128',
				'x-pl-device': 'Windows 11'
			},
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const b = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'user-agent': 'device-b' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookieA = cookieHeader(a);
		const otherId = cookieHeader(b).replace('pl_session=', '');
		const other = [...(await store.listSessions('sub1'))].find((s) => s.id !== cookieHeader(a).replace('pl_session=', ''));
		await store.touchSession(other.id, Date.now() + 60_000);
		const list = await app.request('/v1/sessions', { headers: { cookie: cookieA } });
		const sessions = (await list.json()).sessions;
		expect(sessions[0].current).toBe(true);
		expect(sessions[0]).not.toHaveProperty('userAgent');
		expect(sessions[0].client).toBe('browser');
		expect(sessions[0].browserLabel).toBe('Chrome 128');
		expect(sessions[0].deviceLabel).toBe('Windows 11');
		expect(sessions[0].lastIp).toBe('203.0.113.9');
		expect(sessions[0].lastArea).toMatch(/Bandung/);
		expect(sessions.some((s) => s.id === otherId || !s.current)).toBe(true);
	});

	it('advances lastSeenAt on sync GET and PUT', async () => {
		const { app } = appWith();
		const login = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookie = cookieHeader(login);
		const first = await app.request('/v1/sessions', { headers: { cookie } });
		const before = (await first.json()).sessions[0].lastSeenAt;
		await new Promise((r) => setTimeout(r, 8));
		await app.request('/v1/sync', { headers: { cookie } });
		await app.request('/v1/sync/tx/tx1', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ rev: 0, blob: 'x' })
		});
		const afterList = await app.request('/v1/sessions', { headers: { cookie } });
		const after = (await afterList.json()).sessions[0].lastSeenAt;
		expect(after > before).toBe(true);
	});

	it('uses Local network for private IPs', async () => {
		const { app } = appWith();
		const login = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-forwarded-for': '127.0.0.1'
			},
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const list = await app.request('/v1/sessions', { headers: { cookie: cookieHeader(login) } });
		const row = (await list.json()).sessions[0];
		expect(row.lastArea).toBe('Local network');
		expect(row.lastIp).toBe('127.0.0.1');
	});

	it('revokes all other sessions or every session including current', async () => {
		const { app } = appWith();
		const a = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const b = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookieA = cookieHeader(a);
		const cookieB = cookieHeader(b);
		const others = await app.request('/v1/sessions/revoke-all', {
			method: 'POST',
			headers: { cookie: cookieA, 'content-type': 'application/json' },
			body: JSON.stringify({ includeCurrent: false })
		});
		expect(others.status).toBe(200);
		expect((await app.request('/v1/me', { headers: { cookie: cookieB } })).status).toBe(401);
		expect((await app.request('/v1/me', { headers: { cookie: cookieA } })).status).toBe(200);

		const c = await app.request('/v1/auth/google', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken: 'fake.sub1.a@b.com' })
		});
		const cookieC = cookieHeader(c);
		const all = await app.request('/v1/sessions/revoke-all', {
			method: 'POST',
			headers: { cookie: cookieA, 'content-type': 'application/json' },
			body: JSON.stringify({ includeCurrent: true })
		});
		expect(all.status).toBe(200);
		expect((await app.request('/v1/me', { headers: { cookie: cookieA } })).status).toBe(401);
		expect((await app.request('/v1/me', { headers: { cookie: cookieC } })).status).toBe(401);
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
		const cleared = await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ wrap: null, wrapRev: 2 })
		});
		expect(cleared.status).toBe(200);
		const wrap = await app.request('/v1/wrap', { headers: { cookie } });
		const wrapBody = await wrap.json();
		expect(wrapBody.wrap).toBeNull();
		expect(wrapBody.recoveryWrap).toEqual({ kdf: 'pbkdf2-sha256' });
		expect(wrapBody.onboarding).toBe('needs-passphrase');
	});

	it('PUT wrap null clears the passphrase wrap and keeps recovery (185)', async () => {
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
			body: JSON.stringify({ wrap: { kdf: 'pbkdf2-sha256' }, wrapRev: 0 })
		});
		await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({
				recoveryWrap: { kdf: 'pbkdf2-sha256' },
				wrapRev: 1
			})
		});
		const cleared = await app.request('/v1/wrap', {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ wrap: null, wrapRev: 2 })
		});
		expect(cleared.status).toBe(200);
		expect((await cleared.json()).onboarding).toBe('needs-passphrase');
		const wrap = await app.request('/v1/wrap', { headers: { cookie } });
		const body = await wrap.json();
		expect(body.wrap).toBeNull();
		expect(body.recoveryWrap).toEqual({ kdf: 'pbkdf2-sha256' });
	});
});

describe('debug reset cloud (250)', () => {
	it('is gone without a session', async () => {
		const { app } = appWith();
		const res = await app.request('/v1/debug/reset-cloud', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ signOut: true })
		});
		expect(res.status).toBe(404);
	});

	it('is gone with a session', async () => {
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
		expect(reset.status).toBe(404);
		expect(store.getUser('sub1')).not.toBeNull();
		expect(store.listEntities('sub1')).toHaveLength(1);
		const me = await app.request('/v1/me', { headers: { cookie } });
		expect(me.status).toBe(200);
	});
});

describe('gis redirect callback', () => {
	it('redirects to settings hash without a session cookie', async () => {
		const { app } = appWith();
		const res = await app.request('/v1/auth/gis-callback', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				cookie: 'g_csrf_token=csrf-1'
			},
			body: 'credential=fake.sub1.a%40b.com&g_csrf_token=csrf-1'
		});
		expect(res.status).toBe(302);
		expect(res.headers.get('location')).toBe(
			'http://127.0.0.1:4173/settings#pl_gis=fake.sub1.a%40b.com'
		);
		expect(res.headers.get('set-cookie') ?? '').not.toMatch(/pl_session=/);
		const me = await app.request('/v1/me');
		expect(me.status).toBe(401);
	});

	it('allows a valid token when the CSRF cookie is omitted', async () => {
		const { app } = appWith();
		const res = await app.request('/v1/auth/gis-callback', {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: 'credential=fake.sub1.a%40b.com&g_csrf_token=csrf-1'
		});
		expect(res.status).toBe(302);
		expect(res.headers.get('location')).toContain('#pl_gis=');
	});

	it('redirects to the error hash when CSRF mismatches or the token is invalid', async () => {
		const { app } = appWith();
		const csrf = await app.request('/v1/auth/gis-callback', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				cookie: 'g_csrf_token=one'
			},
			body: 'credential=fake.sub1.a%40b.com&g_csrf_token=two'
		});
		expect(csrf.status).toBe(302);
		expect(csrf.headers.get('location')).toBe('http://127.0.0.1:4173/settings#pl_gis_error=1');

		const bad = await app.request('/v1/auth/gis-callback', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				cookie: 'g_csrf_token=csrf-1'
			},
			body: 'credential=nope&g_csrf_token=csrf-1'
		});
		expect(bad.headers.get('location')).toBe('http://127.0.0.1:4173/settings#pl_gis_error=1');
	});
});
