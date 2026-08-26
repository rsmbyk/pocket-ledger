import { describe, expect, it } from 'vitest';
import { applyPull, nextPutRev, SyncConflictError } from './sync';

describe('sync rev', () => {
	it('applies a newer server rev and treats equal as already-have', () => {
		expect(applyPull(1, { id: 'a', kind: 'tx', rev: 2, deleted: false, blob: 'x' })).toBe('apply');
		expect(applyPull(2, { id: 'a', kind: 'tx', rev: 2, deleted: false, blob: 'x' })).toBe('ignore');
	});

	it('starts new entities at rev 0', () => {
		expect(nextPutRev(undefined)).toBe(0);
	});

	it('names the 409 error so the editor can close', () => {
		expect(new SyncConflictError().status).toBe(409);
	});
});
