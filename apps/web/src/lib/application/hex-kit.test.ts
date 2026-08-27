import { describe, expect, it } from 'vitest';
import { generateRecoveryKit, kitsMatch, normalizeKitInput } from './hex-kit';

describe('hex recovery kit', () => {
	it('is 32 bytes of grouped case-insensitive hex', () => {
		const kit = generateRecoveryKit(() => new Uint8Array(32).fill(0xab));
		expect(kit.compact).toHaveLength(64);
		expect(kit.grouped.split(' ')).toHaveLength(8);
		expect(kitsMatch(kit.compact, kit.grouped.toUpperCase())).toBe(true);
		expect(normalizeKitInput('AB CD')).toBe('abcd');
	});
});
