import { describe, expect, it } from 'vitest';
import { createMemoryStore } from './memory-store.js';

describe('debug reset cloud (180)', () => {
	it('deleteAccount removes user, sessions, and entities', () => {
		const store = createMemoryStore();
		store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		store.putWrap('sub1', { wrap: { kdf: 'x' }, wrapRev: 0 });
		store.createSession({ userSub: 'sub1', userAgent: 'a' });
		store.putEntity('sub1', { id: 'tx1', kind: 'tx', rev: 0, blob: 'sealed' });
		store.deleteAccount('sub1');
		expect(store.getUser('sub1')).toBeNull();
		expect(store.listSessions('sub1')).toHaveLength(0);
		expect(store.listEntities('sub1')).toHaveLength(0);
		expect(store.cloudHasData('sub1')).toBe(false);
	});

	it('resetAccountKeepSession clears wrap and entities but keeps this session', () => {
		const store = createMemoryStore();
		store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		store.putWrap('sub1', {
			wrap: { kdf: 'x' },
			recoveryWrap: { kdf: 'x' },
			wrapRev: 0
		});
		const keep = store.createSession({ userSub: 'sub1', userAgent: 'keep' });
		store.createSession({ userSub: 'sub1', userAgent: 'other' });
		store.putEntity('sub1', { id: 'tx1', kind: 'tx', rev: 0, blob: 'sealed' });
		store.resetAccountKeepSession('sub1', keep.id);
		const user = store.getUser('sub1');
		expect(user.wrap).toBeNull();
		expect(user.recoveryWrap).toBeNull();
		expect(user.wrapRev).toBe(0);
		expect(store.getSession(keep.id)?.id).toBe(keep.id);
		expect(store.listSessions('sub1')).toHaveLength(1);
		expect(store.listEntities('sub1')).toHaveLength(0);
		expect(store.cloudHasData('sub1')).toBe(false);
	});
});

describe('putWrap (185)', () => {
	it('clears wrap to null while keeping recovery wrap', () => {
		const store = createMemoryStore();
		store.ensureUser({ googleSub: 'sub1', email: 'a@b.com' });
		store.putWrap('sub1', {
			wrap: { kdf: 'x' },
			recoveryWrap: { kdf: 'kit' },
			wrapRev: 0
		});
		const next = store.putWrap('sub1', { wrap: null, wrapRev: 1 });
		expect(next.wrap).toBeNull();
		expect(next.recoveryWrap).toEqual({ kdf: 'kit' });
		expect(next.wrapRev).toBe(2);
	});
});
