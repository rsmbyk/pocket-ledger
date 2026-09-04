import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const schemaPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'schema.sql');

function mapUser(row) {
	if (!row) return null;
	return {
		googleSub: row.google_sub,
		email: row.email,
		displayName: row.display_name ?? '',
		pictureUrl: row.picture_url ?? '',
		wrap: row.wrap ?? null,
		recoveryWrap: row.recovery_wrap ?? null,
		wrapRev: row.wrap_rev,
		createdAt:
			row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
	};
}

function mapSession(row) {
	if (!row) return null;
	const expiresAt =
		row.expires_at instanceof Date ? row.expires_at.getTime() : Number(row.expires_at);
	return {
		id: row.id,
		userSub: row.user_sub,
		userAgent: row.user_agent ?? '',
		createdAt:
			row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
		lastSeenAt:
			row.last_seen_at instanceof Date ? row.last_seen_at.toISOString() : String(row.last_seen_at),
		expiresAt
	};
}

function blobToString(blob) {
	if (blob == null) return null;
	if (Buffer.isBuffer(blob)) return blob.toString('utf8');
	if (blob instanceof Uint8Array) return Buffer.from(blob).toString('utf8');
	return String(blob);
}

function mapEntity(row) {
	if (!row) return null;
	return {
		id: row.id,
		kind: row.kind,
		rev: row.rev,
		deleted: Boolean(row.deleted),
		blob: blobToString(row.blob),
		userSub: row.user_sub
	};
}

function conflict(current) {
	const err = new Error('conflict');
	err.code = 'conflict';
	err.current = current;
	return err;
}

async function withTx(pool, fn) {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const result = await fn(client);
		await client.query('COMMIT');
		return result;
	} catch (err) {
		try {
			await client.query('ROLLBACK');
		} catch {
			/* ignore */
		}
		throw err;
	} finally {
		client.release();
	}
}

async function applySchema(pool) {
	const raw = readFileSync(schemaPath, 'utf8');
	const statements = raw
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	for (const stmt of statements) {
		await pool.query(stmt);
	}
}

/**
 * Cloud SQL / Postgres store (Spec 178). Same shape as createMemoryStore.
 * @param {{ query: Function, connect: Function }} pool
 */
export async function createPostgresStore(pool) {
	await applySchema(pool);

	return {
		async getUser(sub) {
			const res = await pool.query(
				`-- pl:get-user
				SELECT google_sub, email, display_name, picture_url, wrap, recovery_wrap, wrap_rev, created_at
				FROM users WHERE google_sub = $1`,
				[sub]
			);
			return mapUser(res.rows[0]);
		},
		async putUser(user) {
			const res = await pool.query(
				`-- pl:ensure-user
				INSERT INTO users (google_sub, email, display_name, picture_url, wrap, recovery_wrap, wrap_rev)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (google_sub) DO UPDATE SET
					email = EXCLUDED.email,
					display_name = EXCLUDED.display_name,
					picture_url = EXCLUDED.picture_url,
					wrap = EXCLUDED.wrap,
					recovery_wrap = EXCLUDED.recovery_wrap,
					wrap_rev = EXCLUDED.wrap_rev
				RETURNING google_sub, email, display_name, picture_url, wrap, recovery_wrap, wrap_rev, created_at`,
				[
					user.googleSub,
					user.email,
					user.displayName ?? '',
					user.pictureUrl ?? '',
					user.wrap ?? null,
					user.recoveryWrap ?? null,
					user.wrapRev ?? 0
				]
			);
			return mapUser(res.rows[0]);
		},
		async ensureUser({ googleSub, email, displayName = '', pictureUrl = '' }) {
			const upserted = await pool.query(
				`-- pl:ensure-user
				INSERT INTO users (google_sub, email, display_name, picture_url)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (google_sub) DO UPDATE SET
					email = EXCLUDED.email,
					display_name = EXCLUDED.display_name,
					picture_url = EXCLUDED.picture_url
				RETURNING google_sub, email, display_name, picture_url, wrap, recovery_wrap, wrap_rev, created_at`,
				[googleSub, email, displayName ?? '', pictureUrl ?? '']
			);
			return mapUser(upserted.rows[0]);
		},
		async cloudHasData(sub) {
			const res = await pool.query(
				`-- pl:cloud-has-data
				SELECT
					EXISTS (SELECT 1 FROM entities WHERE user_sub = $1 AND deleted = FALSE) AS has_entities,
					EXISTS (SELECT 1 FROM users WHERE google_sub = $1 AND wrap IS NOT NULL) AS has_wrap`,
				[sub]
			);
			const row = res.rows[0];
			return Boolean(row?.has_entities) || Boolean(row?.has_wrap);
		},
		async createSession({ userSub, userAgent, now = Date.now() }) {
			const id = crypto.randomUUID();
			const createdAt = new Date(now).toISOString();
			const expiresAt = new Date(now + SESSION_MS);
			const res = await pool.query(
				`-- pl:insert-session
				INSERT INTO sessions (id, user_sub, user_agent, created_at, last_seen_at, expires_at)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING id, user_sub, user_agent, created_at, last_seen_at, expires_at`,
				[id, userSub, userAgent ?? '', createdAt, createdAt, expiresAt]
			);
			return mapSession(res.rows[0]);
		},
		async getSession(id) {
			const res = await pool.query(
				`-- pl:get-session
				SELECT id, user_sub, user_agent, created_at, last_seen_at, expires_at
				FROM sessions WHERE id = $1`,
				[id]
			);
			return mapSession(res.rows[0]);
		},
		async listSessions(userSub) {
			const res = await pool.query(
				`-- pl:list-sessions
				SELECT id, user_sub, user_agent, created_at, last_seen_at, expires_at
				FROM sessions WHERE user_sub = $1
				ORDER BY last_seen_at DESC`,
				[userSub]
			);
			return res.rows.map(mapSession);
		},
		async touchSession(id, now = Date.now()) {
			const lastSeenAt = new Date(now).toISOString();
			const expiresAt = new Date(now + SESSION_MS);
			const res = await pool.query(
				`-- pl:touch-session
				UPDATE sessions SET last_seen_at = $2, expires_at = $3
				WHERE id = $1
				RETURNING id, user_sub, user_agent, created_at, last_seen_at, expires_at`,
				[id, lastSeenAt, expiresAt]
			);
			return mapSession(res.rows[0]);
		},
		async deleteSession(id) {
			await pool.query(
				`-- pl:delete-session
				DELETE FROM sessions WHERE id = $1`,
				[id]
			);
		},
		async putEntity(userSub, { id, kind, rev, deleted, blob }) {
			return withTx(pool, async (client) => {
				const got = await client.query(
					`-- pl:get-entity
					SELECT user_sub, kind, id, rev, deleted, blob
					FROM entities WHERE user_sub = $1 AND kind = $2 AND id = $3
					FOR UPDATE`,
					[userSub, kind, id]
				);
				const existing = mapEntity(got.rows[0]);
				const expected = existing ? existing.rev : 0;
				if (existing && existing.rev !== rev) {
					throw conflict(existing);
				}
				const blobValue = blob ?? existing?.blob ?? null;
				const blobParam = blobValue == null ? null : Buffer.from(String(blobValue), 'utf8');
				const upserted = await client.query(
					`-- pl:upsert-entity
					INSERT INTO entities (user_sub, kind, id, rev, deleted, blob)
					VALUES ($1, $2, $3, $4, $5, $6)
					ON CONFLICT (user_sub, kind, id) DO UPDATE SET
						rev = EXCLUDED.rev,
						deleted = EXCLUDED.deleted,
						blob = COALESCE(EXCLUDED.blob, entities.blob)
					RETURNING user_sub, kind, id, rev, deleted, blob`,
					[userSub, kind, id, expected + 1, Boolean(deleted), blobParam]
				);
				return mapEntity(upserted.rows[0]);
			});
		},
		async getEntity(userSub, kind, id) {
			const res = await pool.query(
				`-- pl:get-entity
				SELECT user_sub, kind, id, rev, deleted, blob
				FROM entities WHERE user_sub = $1 AND kind = $2 AND id = $3`,
				[userSub, kind, id]
			);
			return mapEntity(res.rows[0]);
		},
		async listEntities(userSub) {
			const res = await pool.query(
				`-- pl:list-entities
				SELECT user_sub, kind, id, rev, deleted, blob
				FROM entities WHERE user_sub = $1`,
				[userSub]
			);
			return res.rows.map(mapEntity);
		},
		async putWrap(userSub, { wrap, recoveryWrap, wrapRev }) {
			return withTx(pool, async (client) => {
				const got = await client.query(
					`-- pl:get-user
					SELECT google_sub, email, display_name, picture_url, wrap, recovery_wrap, wrap_rev, created_at
					FROM users WHERE google_sub = $1
					FOR UPDATE`,
					[userSub]
				);
				const user = mapUser(got.rows[0]);
				if (!user) throw new Error('missing user');
				if (user.wrapRev !== wrapRev) throw conflict(user);
				const setRecovery = recoveryWrap !== undefined ? 1 : 0;
				const setWrap = wrap !== undefined ? 1 : 0;
				const updated = await client.query(
					`-- pl:put-wrap
					UPDATE users
					SET
						wrap = CASE WHEN $2::int = 1 THEN $3::jsonb ELSE wrap END,
						recovery_wrap = CASE WHEN $4::int = 1 THEN $5::jsonb ELSE recovery_wrap END,
						wrap_rev = wrap_rev + 1
					WHERE google_sub = $1 AND wrap_rev = $6
					RETURNING google_sub, email, display_name, picture_url, wrap, recovery_wrap, wrap_rev, created_at`,
					[
						userSub,
						setWrap,
						setWrap ? wrap : null,
						setRecovery,
						setRecovery ? recoveryWrap ?? null : null,
						wrapRev
					]
				);
				return mapUser(updated.rows[0]);
			});
		},
		async deleteAccount(userSub) {
			await withTx(pool, async (client) => {
				await client.query(
					`-- pl:delete-user-entities
					DELETE FROM entities WHERE user_sub = $1`,
					[userSub]
				);
				await client.query(
					`-- pl:delete-user-sessions
					DELETE FROM sessions WHERE user_sub = $1`,
					[userSub]
				);
				await client.query(
					`-- pl:delete-user
					DELETE FROM users WHERE google_sub = $1`,
					[userSub]
				);
			});
		},
		async resetAccountKeepSession(userSub, sessionId) {
			await withTx(pool, async (client) => {
				await client.query(
					`-- pl:delete-user-entities
					DELETE FROM entities WHERE user_sub = $1`,
					[userSub]
				);
				await client.query(
					`-- pl:delete-other-sessions
					DELETE FROM sessions WHERE user_sub = $1 AND id <> $2`,
					[userSub, sessionId]
				);
				await client.query(
					`-- pl:reset-user-wraps
					UPDATE users
					SET wrap = NULL, recovery_wrap = NULL, wrap_rev = 0
					WHERE google_sub = $1`,
					[userSub]
				);
			});
		}
	};
}
