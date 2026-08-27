/** 32-byte hex recovery kit (Spec 119). */

export const KIT_BYTES = 32;

export type RecoveryKit = {
	compact: string;
	grouped: string;
};

export function generateRecoveryKit(
	random: () => Uint8Array = () => crypto.getRandomValues(new Uint8Array(KIT_BYTES))
): RecoveryKit {
	const bytes = random();
	if (bytes.length !== KIT_BYTES) throw new Error('Recovery kit must be 32 bytes');
	const compact = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
	return { compact, grouped: groupHex(compact) };
}

export function normalizeKitInput(value: string): string {
	return value.replace(/[^0-9a-f]/gi, '').toLowerCase();
}

export function kitsMatch(storedCompact: string, typed: string): boolean {
	return normalizeKitInput(typed) === normalizeKitInput(storedCompact);
}

export function groupHex(compact: string): string {
	const hex = normalizeKitInput(compact);
	return hex.match(/.{1,8}/g)?.join(' ') ?? hex;
}

export function kitDownloadBlob(grouped: string): Blob {
	return new Blob([`${grouped}\n`], { type: 'text/plain' });
}
