import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { openStore } from './store.js';

/**
 * Specs 118–121, 178, 180: health, Google session, wrap coat-check, sync, debug reset.
 * DATABASE_URL → Cloud SQL / Postgres. Unset → in-memory.
 * Set GOOGLE_CLIENT_ID to verify real GIS tokens. AUTH_ALLOW_FAKE=1 accepts `fake.<sub>.<email>`.
 */

const webOrigin = process.env.WEB_ORIGIN ?? 'http://127.0.0.1:4173';
const googleClientId = process.env.GOOGLE_CLIENT_ID ?? '';
const allowFake = process.env.AUTH_ALLOW_FAKE === '1';
const cookieSecure = process.env.COOKIE_SECURE !== '0';

async function verifyGoogle(idToken) {
	if (allowFake && idToken.startsWith('fake.')) {
		const parts = idToken.split('.');
		return { sub: parts[1] || 'dev', email: parts[2] || 'dev@localhost' };
	}
	if (!googleClientId) return null;
	const url = new URL('https://oauth2.googleapis.com/tokeninfo');
	url.searchParams.set('id_token', idToken);
	const res = await fetch(url);
	if (!res.ok) return null;
	const payload = await res.json();
	if (payload.aud !== googleClientId) return null;
	if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
		return null;
	}
	return { sub: payload.sub, email: payload.email ?? '' };
}

const store = await openStore();
const app = createApp({
	store,
	verifyGoogle,
	webOrigin,
	cookieSecure
});

const port = Number(process.env.PORT ?? 8080);

serve({ fetch: app.fetch, port }, (info) => {
	console.log(`pocket-ledger api listening on :${info.port}`);
});
