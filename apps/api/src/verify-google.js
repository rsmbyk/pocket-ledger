/**
 * Specs 119, 178, 181: GIS tokeninfo + optional fake tokens.
 * AUTH_ALLOW_FAKE=1 accepts `fake.<sub>.<email>`.
 * AUTH_FAKE_SUB, when set, allowlists that fake sub only (production debug user).
 */

/**
 * @param {string} idToken
 * @param {{
 *   allowFake: boolean;
 *   allowedSub: string;
 *   googleClientId: string;
 *   fetchImpl?: typeof fetch;
 * }} opts
 * @returns {Promise<{ sub: string; email: string } | null>}
 */
export async function verifyGoogleToken(idToken, opts) {
	const { allowFake, allowedSub, googleClientId, fetchImpl = fetch } = opts;
	if (allowFake && idToken.startsWith('fake.')) {
		const rest = idToken.slice('fake.'.length);
		const dot = rest.indexOf('.');
		const sub = (dot === -1 ? rest : rest.slice(0, dot)) || 'dev';
		if (allowedSub && sub !== allowedSub) return null;
		const email = dot === -1 ? 'dev@localhost' : rest.slice(dot + 1);
		return { sub, email: email || 'dev@localhost' };
	}
	if (!googleClientId) return null;
	const url = new URL('https://oauth2.googleapis.com/tokeninfo');
	url.searchParams.set('id_token', idToken);
	const res = await fetchImpl(url);
	if (!res.ok) return null;
	const payload = await res.json();
	if (payload.aud !== googleClientId) return null;
	if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
		return null;
	}
	return { sub: payload.sub, email: payload.email ?? '' };
}
