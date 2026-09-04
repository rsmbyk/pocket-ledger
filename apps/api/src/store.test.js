import { describe, expect, it } from 'vitest';
import { openStore } from './store.js';

describe('openStore', () => {
	it('uses the in-memory store when DATABASE_URL is unset', async () => {
		const store = await openStore({});
		const user = store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		expect(user.googleSub).toBe('sub1');
		expect(user.wrapRev).toBe(0);
		expect(store.pool).toBeUndefined();
	});

	it('uses the in-memory store when DATABASE_URL is empty', async () => {
		const store = await openStore({ DATABASE_URL: '' });
		expect(typeof store.putEntity).toBe('function');
		expect(typeof store.pool).toBe('undefined');
	});
});
