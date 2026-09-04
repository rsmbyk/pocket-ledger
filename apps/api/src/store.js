import pg from 'pg';
import { createMemoryStore } from './memory-store.js';
import { createPostgresStore } from './postgres-store.js';

/**
 * Spec 178: Cloud SQL when DATABASE_URL is set; otherwise in-memory (local / CI / e2e).
 * @param {NodeJS.ProcessEnv} [env]
 */
export async function openStore(env = process.env) {
	const url = env.DATABASE_URL;
	if (!url) return createMemoryStore();
	const pool = new pg.Pool({ connectionString: url });
	return createPostgresStore(pool);
}
