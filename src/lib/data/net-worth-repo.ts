import { db } from '$lib/data/db';
import type { NetWorthSnapshot } from '$lib/domain/net-worth';

export async function listNetWorthSnapshots(): Promise<NetWorthSnapshot[]> {
	const rows = await db.netWorthSnapshots.toArray();
	return rows.sort((a, b) => b.capturedOn.localeCompare(a.capturedOn));
}

export async function putNetWorthSnapshot(snapshot: NetWorthSnapshot): Promise<void> {
	await db.netWorthSnapshots.put(snapshot);
}

export async function findSnapshotByDate(capturedOn: string): Promise<NetWorthSnapshot | undefined> {
	return db.netWorthSnapshots.where('capturedOn').equals(capturedOn).first();
}
