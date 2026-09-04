import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

export const COOKIE_NAME = 'pl_session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;

export function onboardingState(user) {
	if (!user?.wrap) return 'needs-passphrase';
	if (!user.recoveryWrap) return 'needs-kit';
	return 'complete';
}

/**
 * @param {{
 *   store: ReturnType<typeof import('./memory-store.js').createMemoryStore>;
 *   verifyGoogle: (idToken: string) => Promise<{ sub: string; email: string } | null>;
 *   webOrigin: string;
 *   cookieSecure?: boolean;
 * }} deps
 */
export function createApp(deps) {
	const { store, verifyGoogle, webOrigin } = deps;
	const cookieSecure = deps.cookieSecure !== false;
	const app = new Hono();

	app.use(
		'*',
		cors({
			origin: webOrigin,
			credentials: true,
			allowHeaders: ['Content-Type'],
			allowMethods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
		})
	);

	app.get('/healthz', (c) => c.json({ ok: true }));

	app.post('/v1/auth/google', async (c) => {
		const body = await c.req.json().catch(() => ({}));
		const identity = await verifyGoogle(String(body.idToken ?? ''));
		if (!identity) return c.json({ error: 'invalid_token' }, 401);
		const user = await store.ensureUser({ googleSub: identity.sub, email: identity.email });
		const cloudHasData = await store.cloudHasData(user.googleSub);
		const localHasData = body.localHasData === true;
		if (cloudHasData && localHasData && body.discardLocal !== true) {
			return c.json(
				{
					error: 'local_conflict',
					message:
						'This Google account already has a ledger. Signing in discards local data on this device.'
				},
				409
			);
		}
		const session = await store.createSession({
			userSub: user.googleSub,
			userAgent: c.req.header('user-agent') ?? ''
		});
		writeSessionCookie(c, session.id, cookieSecure);
		return c.json({
			user: publicUser(user),
			onboarding: onboardingState(user),
			cloudHasData
		});
	});

	app.post('/v1/auth/logout', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		await store.deleteSession(session.value.id);
		deleteCookie(c, COOKIE_NAME, cookieOpts(cookieSecure));
		return c.json({ ok: true });
	});

	app.get('/*', async (c, next) => {
		if (c.req.path === '/healthz') return next();
		return next();
	});

	app.get('/v1/me', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const user = await store.getUser(session.value.userSub);
		if (!user) return c.json({ error: 'unknown_user' }, 401);
		await store.touchSession(session.value.id);
		writeSessionCookie(c, session.value.id, cookieSecure);
		return c.json({
			user: publicUser(user),
			onboarding: onboardingState(user),
			sessionId: session.value.id
		});
	});

	app.get('/v1/sessions', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const sessions = await store.listSessions(session.value.userSub);
		return c.json({
			sessions: sessions.map((s) => ({
				id: s.id,
				userAgent: s.userAgent,
				createdAt: s.createdAt,
				lastSeenAt: s.lastSeenAt,
				current: s.id === session.value.id
			}))
		});
	});

	app.delete('/v1/sessions/:id', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const id = c.req.param('id');
		const target = await store.getSession(id);
		if (!target || target.userSub !== session.value.userSub) {
			return c.json({ error: 'not_found' }, 404);
		}
		await store.deleteSession(id);
		if (id === session.value.id) {
			deleteCookie(c, COOKIE_NAME, cookieOpts(cookieSecure));
		}
		return c.json({ ok: true });
	});

	app.get('/v1/wrap', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const user = await store.getUser(session.value.userSub);
		if (!user) return c.json({ error: 'unknown_user' }, 401);
		return c.json({
			wrap: user.wrap,
			recoveryWrap: user.recoveryWrap,
			hasRecovery: Boolean(user.recoveryWrap),
			wrapRev: user.wrapRev,
			onboarding: onboardingState(user)
		});
	});

	app.put('/v1/wrap', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const body = await c.req.json().catch(() => ({}));
		try {
			const user = await store.putWrap(session.value.userSub, {
				wrap: body.wrap ?? null,
				recoveryWrap: body.recoveryWrap,
				wrapRev: Number(body.wrapRev ?? 0)
			});
			return c.json({
				wrapRev: user.wrapRev,
				onboarding: onboardingState(user)
			});
		} catch (err) {
			if (err && err.code === 'conflict') return c.json({ error: 'conflict' }, 409);
			throw err;
		}
	});

	app.get('/v1/sync', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		return c.json({ entities: await store.listEntities(session.value.userSub) });
	});

	app.put('/v1/sync/:kind/:id', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const body = await c.req.json().catch(() => ({}));
		try {
			const row = await store.putEntity(session.value.userSub, {
				id: c.req.param('id'),
				kind: c.req.param('kind'),
				rev: Number(body.rev ?? 0),
				deleted: body.deleted === true,
				blob: body.blob ?? null
			});
			return c.json(row);
		} catch (err) {
			if (err && err.code === 'conflict') {
				return c.json({ error: 'conflict', current: err.current }, 409);
			}
			throw err;
		}
	});

	app.post('/v1/debug/reset-cloud', async (c) => {
		const session = await requireSession(c, store);
		if (session.ok === false) return session.res;
		const body = await c.req.json().catch(() => ({}));
		const signOut = body.signOut === true;
		if (signOut) {
			await store.deleteAccount(session.value.userSub);
			deleteCookie(c, COOKIE_NAME, cookieOpts(cookieSecure));
			return c.json({ ok: true, signedOut: true });
		}
		await store.resetAccountKeepSession(session.value.userSub, session.value.id);
		const user = await store.getUser(session.value.userSub);
		return c.json({
			ok: true,
			signedOut: false,
			onboarding: onboardingState(user)
		});
	});

	return app;
}

function publicUser(user) {
	return {
		googleSub: user.googleSub,
		email: user.email,
		onboarding: onboardingState(user)
	};
}

function cookieOpts(secure) {
	return {
		path: '/',
		httpOnly: true,
		secure,
		sameSite: secure ? 'None' : 'Lax',
		maxAge: SESSION_SECONDS
	};
}

function writeSessionCookie(c, id, secure) {
	setCookie(c, COOKIE_NAME, id, cookieOpts(secure));
}

async function requireSession(c, store) {
	const id = getCookie(c, COOKIE_NAME);
	if (!id) return { ok: false, res: c.json({ error: 'unauthorized' }, 401) };
	const session = await store.getSession(id);
	if (!session || session.expiresAt < Date.now()) {
		return { ok: false, res: c.json({ error: 'unauthorized' }, 401) };
	}
	return { ok: true, value: session };
}
