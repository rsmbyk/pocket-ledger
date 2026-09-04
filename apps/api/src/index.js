import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { openStore } from './store.js';
import { verifyGoogleToken } from './verify-google.js';

/**
 * Specs 118–121, 178, 180, 181: health, Google session, wrap coat-check, sync, debug reset.
 * DATABASE_URL → Cloud SQL / Postgres. Unset → in-memory.
 * Set GOOGLE_CLIENT_ID to verify real GIS tokens. AUTH_ALLOW_FAKE=1 accepts `fake.<sub>.<email>`.
 * AUTH_FAKE_SUB restrict fake tokens to one sub (Spec 181 temporary production debug user).
 */

const webOrigin = process.env.WEB_ORIGIN ?? 'http://127.0.0.1:4173';
const googleClientId = process.env.GOOGLE_CLIENT_ID ?? '';
const allowFake = process.env.AUTH_ALLOW_FAKE === '1';
const allowedFakeSub = (process.env.AUTH_FAKE_SUB ?? '').trim();
const cookieSecure = process.env.COOKIE_SECURE !== '0';

function verifyGoogle(idToken) {
	return verifyGoogleToken(idToken, {
		allowFake,
		allowedSub: allowedFakeSub,
		googleClientId
	});
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
