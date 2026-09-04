import { describe, expect, it } from 'vitest';
import { createPostgresStore } from './postgres-store.js';

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function toUserRow(u) {
	return {
		google_sub: u.googleSub,
		email: u.email,
		wrap: u.wrap,
		recovery_wrap: u.recoveryWrap,
		wrap_rev: u.wrapRev,
		created_at: u.createdAt
	};
}

function toSessionRow(s) {
	return {
		id: s.id,
		user_sub: s.userSub,
		user_agent: s.userAgent,
		created_at: s.createdAt,
		last_seen_at: s.lastSeenAt,
		expires_at: new Date(s.expiresAt)
	};
}

function toEntityRow(e) {
	return {
		user_sub: e.userSub,
		kind: e.kind,
		id: e.id,
		rev: e.rev,
		deleted: e.deleted,
		blob: e.blob == null ? null : Buffer.from(String(e.blob), 'utf8')
	};
}

function tagOf(text) {
	const m = String(text).match(/pl:([a-z0-9-]+)/);
	return m ? m[1] : '';
}

/** In-memory pool that understands postgres-store SQL tags (Spec 178). */
function createFakePool() {
	const users = new Map();
	const sessions = new Map();
	const entities = new Map();
	const statements = [];

	function entityKey(userSub, kind, id) {
		return `${userSub}\0${kind}\0${id}`;
	}

	async function query(text, params = []) {
		statements.push(text);
		const trimmed = String(text).trim();
		if (trimmed === 'BEGIN' || trimmed === 'COMMIT' || trimmed === 'ROLLBACK') {
			return { rows: [] };
		}
		if (/CREATE TABLE/i.test(text)) {
			return { rows: [] };
		}
		const tag = tagOf(text);
		switch (tag) {
			case 'get-user': {
				const u = users.get(params[0]);
				return { rows: u ? [toUserRow(u)] : [] };
			}
			case 'ensure-user': {
				if (users.has(params[0])) return { rows: [] };
				users.set(params[0], {
					googleSub: params[0],
					email: params[1],
					wrap: null,
					recoveryWrap: null,
					wrapRev: 0,
					createdAt: new Date().toISOString()
				});
				return { rows: [toUserRow(users.get(params[0]))] };
			}
			case 'cloud-has-data': {
				let hasEntities = false;
				for (const [key, row] of entities) {
					if (key.startsWith(`${params[0]}\0`) && !row.deleted) hasEntities = true;
				}
				const user = users.get(params[0]);
				return {
					rows: [{ has_entities: hasEntities, has_wrap: Boolean(user?.wrap) }]
				};
			}
			case 'insert-session': {
				const session = {
					id: params[0],
					userSub: params[1],
					userAgent: params[2],
					createdAt: params[3],
					lastSeenAt: params[4],
					expiresAt: params[5] instanceof Date ? params[5].getTime() : Number(params[5])
				};
				sessions.set(session.id, session);
				return { rows: [toSessionRow(session)] };
			}
			case 'get-session': {
				const s = sessions.get(params[0]);
				return { rows: s ? [toSessionRow(s)] : [] };
			}
			case 'list-sessions': {
				const rows = [...sessions.values()]
					.filter((s) => s.userSub === params[0])
					.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
					.map(toSessionRow);
				return { rows };
			}
			case 'touch-session': {
				const s = sessions.get(params[0]);
				if (!s) return { rows: [] };
				s.lastSeenAt = params[1];
				s.expiresAt = params[2] instanceof Date ? params[2].getTime() : Number(params[2]);
				return { rows: [toSessionRow(s)] };
			}
			case 'delete-session': {
				sessions.delete(params[0]);
				return { rows: [] };
			}
			case 'get-entity': {
				const row = entities.get(entityKey(params[0], params[1], params[2]));
				return { rows: row ? [toEntityRow(row)] : [] };
			}
			case 'upsert-entity': {
				const next = {
					userSub: params[0],
					kind: params[1],
					id: params[2],
					rev: params[3],
					deleted: params[4],
					blob:
						params[5] == null
							? entities.get(entityKey(params[0], params[1], params[2]))?.blob ?? null
							: Buffer.isBuffer(params[5])
								? params[5].toString('utf8')
								: String(params[5])
				};
				entities.set(entityKey(next.userSub, next.kind, next.id), next);
				return { rows: [toEntityRow(next)] };
			}
			case 'list-entities': {
				const rows = [];
				for (const [key, row] of entities) {
					if (key.startsWith(`${params[0]}\0`)) rows.push(toEntityRow(row));
				}
				return { rows };
			}
			case 'put-wrap': {
				const user = users.get(params[0]);
				if (!user) return { rows: [] };
				if (user.wrapRev !== params[4]) return { rows: [] };
				if (params[1] != null) user.wrap = params[1];
				if (params[2] === 1) user.recoveryWrap = params[3];
				user.wrapRev += 1;
				return { rows: [toUserRow(user)] };
			}
			case 'delete-user-entities': {
				for (const key of [...entities.keys()]) {
					if (key.startsWith(`${params[0]}\0`)) entities.delete(key);
				}
				return { rows: [] };
			}
			case 'delete-user-sessions': {
				for (const [id, s] of sessions) {
					if (s.userSub === params[0]) sessions.delete(id);
				}
				return { rows: [] };
			}
			case 'delete-other-sessions': {
				for (const [id, s] of sessions) {
					if (s.userSub === params[0] && id !== params[1]) sessions.delete(id);
				}
				return { rows: [] };
			}
			case 'delete-user': {
				users.delete(params[0]);
				return { rows: [] };
			}
			case 'reset-user-wraps': {
				const user = users.get(params[0]);
				if (!user) return { rows: [] };
				user.wrap = null;
				user.recoveryWrap = null;
				user.wrapRev = 0;
				return { rows: [toUserRow(user)] };
			}
			default:
				throw new Error(`unhandled sql: ${trimmed.slice(0, 120)}`);
		}
	}

	return {
		statements,
		query,
		connect: async () => ({ query, release() {} })
	};
}

describe('postgres store', () => {
	it('applies schema.sql on connect', async () => {
		const pool = createFakePool();
		await createPostgresStore(pool);
		expect(pool.statements.some((s) => /CREATE TABLE/i.test(s))).toBe(true);
	});

	it('CAS-rejects a stale entity rev and stores gravestones', async () => {
		const store = await createPostgresStore(createFakePool());
		const user = await store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		const created = await store.putEntity(user.googleSub, {
			id: 'tx1',
			kind: 'tx',
			rev: 0,
			blob: 'sealed-a'
		});
		expect(created.rev).toBe(1);
		expect(created.blob).toBe('sealed-a');

		await expect(
			store.putEntity(user.googleSub, { id: 'tx1', kind: 'tx', rev: 0, blob: 'sealed-b' })
		).rejects.toMatchObject({ code: 'conflict' });

		const tomb = await store.putEntity(user.googleSub, {
			id: 'tx1',
			kind: 'tx',
			rev: 1,
			deleted: true
		});
		expect(tomb.deleted).toBe(true);
		expect(tomb.rev).toBe(2);

		const listed = await store.listEntities(user.googleSub);
		expect(listed).toHaveLength(1);
		expect(listed[0].deleted).toBe(true);
	});

	it('CAS-updates the coat-check wrap', async () => {
		const store = await createPostgresStore(createFakePool());
		const user = await store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		const first = await store.putWrap(user.googleSub, { wrap: { kdf: 'pbkdf2-sha256' }, wrapRev: 0 });
		expect(first.wrapRev).toBe(1);
		expect(first.wrap).toEqual({ kdf: 'pbkdf2-sha256' });

		const kit = await store.putWrap(user.googleSub, {
			recoveryWrap: { kdf: 'pbkdf2-sha256' },
			wrapRev: 1
		});
		expect(kit.wrapRev).toBe(2);
		expect(kit.recoveryWrap).toEqual({ kdf: 'pbkdf2-sha256' });
		expect(kit.wrap).toEqual({ kdf: 'pbkdf2-sha256' });

		await expect(
			store.putWrap(user.googleSub, { wrap: { kdf: 'other' }, wrapRev: 1 })
		).rejects.toMatchObject({ code: 'conflict' });
	});

	it('cloudHasData is true once a wrap exists', async () => {
		const store = await createPostgresStore(createFakePool());
		await store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		expect(await store.cloudHasData('sub1')).toBe(false);
		await store.putWrap('sub1', { wrap: { kdf: 'x' }, wrapRev: 0 });
		expect(await store.cloudHasData('sub1')).toBe(true);
	});

	it('creates, lists, touches, and deletes sessions', async () => {
		const store = await createPostgresStore(createFakePool());
		await store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		const now = 1_700_000_000_000;
		const session = await store.createSession({
			userSub: 'sub1',
			userAgent: 'device-a',
			now
		});
		expect(session.expiresAt).toBe(now + SESSION_MS);
		expect(await store.getSession(session.id)).toMatchObject({
			id: session.id,
			userSub: 'sub1',
			userAgent: 'device-a'
		});

		const touched = await store.touchSession(session.id, now + 1000);
		expect(touched.lastSeenAt).toBeTruthy();
		expect(touched.expiresAt).toBe(now + 1000 + SESSION_MS);

		const listed = await store.listSessions('sub1');
		expect(listed).toHaveLength(1);
		await store.deleteSession(session.id);
		expect(await store.getSession(session.id)).toBeNull();
	});

	it('deleteAccount removes user, sessions, and entities', async () => {
		const store = await createPostgresStore(createFakePool());
		await store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		await store.putWrap('sub1', { wrap: { kdf: 'x' }, wrapRev: 0 });
		await store.createSession({ userSub: 'sub1', userAgent: 'a' });
		await store.putEntity('sub1', { id: 'tx1', kind: 'tx', rev: 0, blob: 'sealed' });
		await store.deleteAccount('sub1');
		expect(await store.getUser('sub1')).toBeNull();
		expect(await store.listSessions('sub1')).toHaveLength(0);
		expect(await store.listEntities('sub1')).toHaveLength(0);
		expect(await store.cloudHasData('sub1')).toBe(false);
	});

	it('resetAccountKeepSession clears wrap and entities but keeps this session', async () => {
		const store = await createPostgresStore(createFakePool());
		await store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		await store.putWrap('sub1', {
			wrap: { kdf: 'x' },
			recoveryWrap: { kdf: 'x' },
			wrapRev: 0
		});
		const keep = await store.createSession({ userSub: 'sub1', userAgent: 'keep' });
		await store.createSession({ userSub: 'sub1', userAgent: 'other' });
		await store.putEntity('sub1', { id: 'tx1', kind: 'tx', rev: 0, blob: 'sealed' });
		await store.resetAccountKeepSession('sub1', keep.id);
		const user = await store.getUser('sub1');
		expect(user.wrap).toBeNull();
		expect(user.recoveryWrap).toBeNull();
		expect(user.wrapRev).toBe(0);
		expect((await store.getSession(keep.id)).id).toBe(keep.id);
		expect(await store.listSessions('sub1')).toHaveLength(1);
		expect(await store.listEntities('sub1')).toHaveLength(0);
		expect(await store.cloudHasData('sub1')).toBe(false);
	});
});
