import { SyncConflictError, type SyncEntity } from '$lib/application/sync';
import { sessionRequestHeaders } from '$lib/application/session-device';

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

/** Spec 241 testing-only: two Playwright contexts share one fake GIS token. */
export const E2E_FAKE_TOKEN_KEY = 'pl-e2e-fake-token';

type Json = Record<string, unknown>;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const meta = await sessionRequestHeaders().catch(() => ({}) as Record<string, string>);
	const headers = new Headers(init.headers);
	if (!headers.has('content-type')) headers.set('content-type', 'application/json');
	for (const [key, value] of Object.entries(meta)) {
		if (value && !headers.has(key)) headers.set(key, value);
	}
	const res = await fetch(`${apiBase()}${path}`, {
		...init,
		credentials: 'include',
		headers
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
	current: boolean;
	client: 'browser' | 'android';
	browserLabel: string;
	deviceLabel: string;
	lastSeenAt: string;
	lastArea: string;
	lastIp: string;
};

export async function listCloudSessions(): Promise<CloudSession[]> {
	const body = await request<{ sessions: CloudSession[] }>('/v1/sessions');
	return body.sessions;
}

export async function revokeCloudSession(id: string): Promise<void> {
	await request(`/v1/sessions/${id}`, { method: 'DELETE' });
}

export async function revokeAllCloudSessions(includeCurrent: boolean): Promise<void> {
	await request('/v1/sessions/revoke-all', {
		method: 'POST',
		body: JSON.stringify({ includeCurrent })
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
