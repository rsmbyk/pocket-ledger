/** In-memory users, sessions, wraps, and sync entities (Specs 119–121). */

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export function createMemoryStore() {
	const users = new Map();
	const sessions = new Map();
	const entities = new Map();

	function entityKey(userSub, kind, id) {
		return `${userSub}\0${kind}\0${id}`;
	}

	return {
		getUser(sub) {
			return users.get(sub) ?? null;
		},
		putUser(user) {
			users.set(user.googleSub, { ...user });
			return users.get(user.googleSub);
		},
		ensureUser({ googleSub, email, displayName = '', pictureUrl = '' }) {
			const existing = users.get(googleSub);
			if (existing) {
				existing.email = email;
				existing.displayName = displayName ?? existing.displayName ?? '';
				existing.pictureUrl = pictureUrl ?? existing.pictureUrl ?? '';
				return existing;
			}
			const created = {
				googleSub,
				email,
				displayName: displayName ?? '',
				pictureUrl: pictureUrl ?? '',
				wrap: null,
				recoveryWrap: null,
				wrapRev: 0,
				createdAt: new Date().toISOString()
			};
			users.set(googleSub, created);
			return created;
		},
		cloudHasData(sub) {
			for (const [key, row] of entities) {
				if (key.startsWith(`${sub}\0`) && !row.deleted) return true;
			}
			const user = users.get(sub);
			return Boolean(user?.wrap);
		},
		createSession({ userSub, userAgent, now = Date.now() }) {
			const id = crypto.randomUUID();
			const session = {
				id,
				userSub,
				userAgent: userAgent ?? '',
				createdAt: new Date(now).toISOString(),
				lastSeenAt: new Date(now).toISOString(),
				expiresAt: now + SESSION_MS
			};
			sessions.set(id, session);
			return session;
		},
		getSession(id) {
			return sessions.get(id) ?? null;
		},
		listSessions(userSub) {
			return [...sessions.values()]
				.filter((s) => s.userSub === userSub)
				.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
		},
		touchSession(id, now = Date.now()) {
			const session = sessions.get(id);
			if (!session) return null;
			session.lastSeenAt = new Date(now).toISOString();
			session.expiresAt = now + SESSION_MS;
			return session;
		},
		deleteSession(id) {
			sessions.delete(id);
		},
		putEntity(userSub, { id, kind, rev, deleted, blob }) {
			const key = entityKey(userSub, kind, id);
			const existing = entities.get(key);
			const expected = existing ? existing.rev : 0;
			if (existing && existing.rev !== rev) {
				const err = new Error('conflict');
				err.code = 'conflict';
				err.current = existing;
				throw err;
			}
			const next = {
				id,
				kind,
				rev: expected + 1,
				deleted: Boolean(deleted),
				blob: blob ?? existing?.blob ?? null,
				userSub
			};
			entities.set(key, next);
			return next;
		},
		getEntity(userSub, kind, id) {
			return entities.get(entityKey(userSub, kind, id)) ?? null;
		},
		listEntities(userSub) {
			const out = [];
			for (const [key, row] of entities) {
				if (key.startsWith(`${userSub}\0`)) out.push(row);
			}
			return out;
		},
		putWrap(userSub, { wrap, recoveryWrap, wrapRev }) {
			const user = users.get(userSub);
			if (!user) throw new Error('missing user');
			if (user.wrapRev !== wrapRev) {
				const err = new Error('conflict');
				err.code = 'conflict';
				err.current = user;
				throw err;
			}
			user.wrap = wrap !== undefined ? wrap : user.wrap;
			if (recoveryWrap !== undefined) user.recoveryWrap = recoveryWrap;
			user.wrapRev = user.wrapRev + 1;
			return user;
		},
		deleteAccount(userSub) {
			for (const key of [...entities.keys()]) {
				if (key.startsWith(`${userSub}\0`)) entities.delete(key);
			}
			for (const [id, session] of sessions) {
				if (session.userSub === userSub) sessions.delete(id);
			}
			users.delete(userSub);
		},
		resetAccountKeepSession(userSub, sessionId) {
			for (const key of [...entities.keys()]) {
				if (key.startsWith(`${userSub}\0`)) entities.delete(key);
			}
			for (const [id, session] of sessions) {
				if (session.userSub === userSub && id !== sessionId) sessions.delete(id);
			}
			const user = users.get(userSub);
			if (!user) return;
			user.wrap = null;
			user.recoveryWrap = null;
			user.wrapRev = 0;
		}
	};
}
