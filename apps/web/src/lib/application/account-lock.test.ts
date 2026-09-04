import { describe, expect, it } from 'vitest';
import { rejectUnchangedPassphrase } from './account-lock';

describe('change account passphrase', () => {
	it('rejects a new passphrase that matches the old one', () => {
		expect(() => rejectUnchangedPassphrase('same-pass', 'same-pass')).toThrow(
			/must be different/i
		);
		expect(() => rejectUnchangedPassphrase('old-pass', 'new-pass')).not.toThrow();
	});
});
