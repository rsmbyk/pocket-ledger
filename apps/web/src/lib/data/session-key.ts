/** In-memory AES key for field encryption; never persisted. */
let dataKey: CryptoKey | null = null;

export function setDataKey(key: CryptoKey | null): void {
	dataKey = key;
}

export function getDataKey(): CryptoKey | null {
	return dataKey;
}

export function clearDataKey(): void {
	dataKey = null;
}
