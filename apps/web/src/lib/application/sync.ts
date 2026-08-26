export class SyncConflictError extends Error {
	readonly status = 409;
	constructor(message = 'This record changed on another device') {
		super(message);
		this.name = 'SyncConflictError';
	}
}

export type SyncEntity = {
	id: string;
	kind: string;
	rev: number;
	deleted: boolean;
	blob: string | null;
};

export function applyPull(
	localRev: number | undefined,
	incoming: SyncEntity
): 'apply' | 'ignore' | 'conflict' {
	if (incoming.rev === localRev) return 'ignore';
	if (localRev == null || incoming.rev > localRev) return 'apply';
	return 'conflict';
}

export function nextPutRev(localRev: number | undefined): number {
	return localRev ?? 0;
}
