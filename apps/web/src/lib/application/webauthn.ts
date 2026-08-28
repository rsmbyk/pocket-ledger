/** This-device WebAuthn third box (Spec 119). Never leaves this origin. */

export async function enrollWebAuthn(): Promise<string> {
	const cred = (await navigator.credentials.create({
		publicKey: {
			challenge: crypto.getRandomValues(new Uint8Array(32)),
			rp: { name: 'Pocket Ledger' },
			user: {
				id: crypto.getRandomValues(new Uint8Array(16)),
				name: 'pocket-ledger',
				displayName: 'Pocket Ledger'
			},
			pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
			authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
			timeout: 60_000
		}
	})) as PublicKeyCredential | null;
	if (!cred) throw new Error('Could not enroll this device');
	return bufferToB64(cred.rawId);
}

export async function assertWebAuthn(credentialIdB64: string): Promise<boolean> {
	try {
		const cred = await navigator.credentials.get({
			publicKey: {
				challenge: crypto.getRandomValues(new Uint8Array(32)),
				allowCredentials: [{ type: 'public-key', id: b64ToBuffer(credentialIdB64) }],
				userVerification: 'required',
				timeout: 60_000
			}
		});
		return cred != null;
	} catch {
		return false;
	}
}

function bufferToB64(buf: ArrayBuffer): string {
	const bytes = new Uint8Array(buf);
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary);
}

function b64ToBuffer(value: string): ArrayBuffer {
	const binary = atob(value);
	const out = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
	return out.buffer;
}
