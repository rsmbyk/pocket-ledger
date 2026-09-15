import { describe, expect, it } from 'vitest';
import { createMemoryStore } from './memory-store.js';

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
