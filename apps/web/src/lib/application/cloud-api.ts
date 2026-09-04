import { SyncConflictError, type SyncEntity } from '$lib/application/sync';

export class LocalConflictError extends Error {
	readonly status = 409;
	constructor(message: string) {
		super(message);
		this.name = 'LocalConflictError';
	}
}

export function apiBase(): string {
	return ((import.meta.env.VITE_API_URL as string | undefined) ?? '').trim().replace(/\/$/, '');
}

export function cloudConfigured(): boolean {
	if (!apiBase()) return false;
	return fakeGoogleEnabled() || googleClientId().length > 0;
}

export function fakeGoogleEnabled(): boolean {
	return import.meta.env.VITE_FAKE_GOOGLE === 'true' || import.meta.env.VITE_FAKE_GOOGLE === '1';
}

export function googleClientId(): string {
	return ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '').trim();
}

/** Spec 181 temporary: fixed fake Google identity for production Cursor testing. */
export const DEBUG_FAKE_GOOGLE_SUB = 'pl-debug-cursor';
export const DEBUG_FAKE_GOOGLE_TOKEN = `fake.${DEBUG_FAKE_GOOGLE_SUB}.cursor-debug@pocket-ledger.test`;

export function shouldWipeCloudOnSignOut(googleSub: string | null | undefined): boolean {
	return googleSub === DEBUG_FAKE_GOOGLE_SUB;
}

type Json = Record<string, unknown>;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const res = await fetch(`${apiBase()}${path}`, {
		...init,
		credentials: 'include',
		headers: {
			'content-type': 'application/json',
			...(init.headers ?? {})
		}
	});
	if (res.status === 409) {
		const body = (await res.json().catch(() => ({}))) as Json;
		if (body.error === 'local_conflict') {
			throw new LocalConflictError(
				String(body.message ?? 'This Google account already has a ledger on the cloud.')
			);
		}
		throw new SyncConflictError();
	}
	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as Json;
		const err = new Error(String(body.message ?? body.error ?? res.statusText));
		(err as Error & { status: number; body: Json }).status = res.status;
		(err as Error & { status: number; body: Json }).body = body;
		throw err;
	}
	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

export type AuthMe = {
	user: {
		googleSub: string;
		email: string;
		displayName?: string;
		pictureUrl?: string;
	};
	onboarding: 'needs-passphrase' | 'needs-kit' | 'complete';
	sessionId?: string;
	cloudHasData?: boolean;
};

export async function signInWithGoogleToken(
	idToken: string,
	opts: { localHasData: boolean; discardLocal?: boolean }
): Promise<AuthMe> {
	return request<AuthMe>('/v1/auth/google', {
		method: 'POST',
		body: JSON.stringify({
			idToken,
			localHasData: opts.localHasData,
			discardLocal: opts.discardLocal === true
		})
	});
}

export async function fetchMe(): Promise<AuthMe | null> {
	try {
		return await request<AuthMe>('/v1/me');
	} catch (err) {
		if (err instanceof Error && 'status' in err && (err as { status: number }).status === 401) {
			return null;
		}
		throw err;
	}
}

export async function logoutCloud(): Promise<void> {
	try {
		await request('/v1/auth/logout', { method: 'POST' });
	} catch {
		/* still wipe locally */
	}
}

export type CloudSession = {
	id: string;
	userAgent: string;
	createdAt: string;
	lastSeenAt: string;
	current: boolean;
};

export async function listCloudSessions(): Promise<CloudSession[]> {
	const body = await request<{ sessions: CloudSession[] }>('/v1/sessions');
	return body.sessions;
}

export async function revokeCloudSession(id: string): Promise<void> {
	await request(`/v1/sessions/${id}`, { method: 'DELETE' });
}

/** Spec 180 temporary: wipe this account’s cloud copy. */
export async function resetCloudAccount(opts: { signOut: boolean }): Promise<{
	ok: true;
	signedOut: boolean;
	onboarding?: AuthMe['onboarding'];
}> {
	return request('/v1/debug/reset-cloud', {
		method: 'POST',
		body: JSON.stringify({ signOut: opts.signOut })
	});
}

export type CloudWrap = {
	wrap: unknown;
	recoveryWrap?: unknown;
	hasRecovery: boolean;
	wrapRev: number;
	onboarding: AuthMe['onboarding'];
};

export async function fetchCloudWrap(): Promise<CloudWrap> {
	return request<CloudWrap>('/v1/wrap');
}

export async function putCloudWrap(body: {
	wrap?: unknown;
	recoveryWrap?: unknown;
	wrapRev: number;
}): Promise<{ wrapRev: number; onboarding: AuthMe['onboarding'] }> {
	return request('/v1/wrap', { method: 'PUT', body: JSON.stringify(body) });
}

export async function pullCloudEntities(): Promise<SyncEntity[]> {
	const body = await request<{ entities: SyncEntity[] }>('/v1/sync');
	return body.entities;
}

export async function putCloudEntity(entity: {
	id: string;
	kind: string;
	rev: number;
	deleted?: boolean;
	blob: string | null;
}): Promise<SyncEntity> {
	return request<SyncEntity>(
		`/v1/sync/${encodeURIComponent(entity.kind)}/${encodeURIComponent(entity.id)}`,
		{
			method: 'PUT',
			body: JSON.stringify({
				rev: entity.rev,
				deleted: entity.deleted === true,
				blob: entity.blob
			})
		}
	);
}
