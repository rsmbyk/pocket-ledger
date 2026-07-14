import {
	findSnapshotByDate,
	listNetWorthSnapshots,
	putNetWorthSnapshot
} from '$lib/data/net-worth-repo';
import type { NetWorthSnapshot } from '$lib/domain/net-worth';
import { getAccountBalance } from '$lib/application/transactions';
import { listAccounts } from '$lib/data/account-repo';
import { todayOccurredOn } from '$lib/domain/transaction-rules';

function createId(): string {
	return crypto.randomUUID();
}

export async function getTotalNetWorthMinor(): Promise<number> {
	const accounts = await listAccounts();
	let total = 0;
	for (const account of accounts) {
		total += await getAccountBalance(account.id);
	}
	return total;
}

export async function captureNetWorth(capturedOn = todayOccurredOn()): Promise<NetWorthSnapshot> {
	const totalMinor = await getTotalNetWorthMinor();
	const existing = await findSnapshotByDate(capturedOn);
	const snapshot: NetWorthSnapshot = {
		id: existing?.id ?? createId(),
		capturedOn,
		totalMinor,
		createdAt: existing?.createdAt ?? new Date().toISOString()
	};
	await putNetWorthSnapshot(snapshot);
	return snapshot;
}

export { listNetWorthSnapshots };
