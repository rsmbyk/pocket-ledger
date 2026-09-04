import { wrapDek, unwrapDek, type WrapEnvelope } from '$lib/application/wrap';
import { getDataKey, setDataKey } from '$lib/data/session-key';
import { enableLock, ensureLocalDek } from '$lib/application/lock';
import { fetchCloudWrap, putCloudWrap } from '$lib/application/cloud-api';
import { knownWrapRev, rememberWrapRev } from '$lib/application/sync-client';
import { normalizeKitInput } from '$lib/application/hex-kit';

export async function setAccountPassphrase(passphrase: string): Promise<void> {
	const status = await ensureLocalDek();
	if (status === 'needs-passphrase') {
		throw new Error('Unlock this device before setting an account passphrase');
	}
	const dek = getDataKey();
	if (!dek) throw new Error('Missing data key');
	const wrap = await wrapDek(dek, passphrase);
	const wrapRev = await knownWrapRev();
	const result = await putCloudWrap({ wrap, wrapRev });
	await rememberWrapRev(result.wrapRev);
	await enableLock(passphrase);
}

export async function uploadRecoveryWrap(compactHex: string): Promise<void> {
	const dek = getDataKey();
	if (!dek) throw new Error('Missing data key');
	const recoveryWrap = await wrapDek(dek, normalizeKitInput(compactHex));
	const wrapRev = await knownWrapRev();
	const result = await putCloudWrap({ recoveryWrap, wrapRev });
	await rememberWrapRev(result.wrapRev);
}

export async function unlockAccountWithPassphrase(passphrase: string): Promise<boolean> {
	const cloud = await fetchCloudWrap();
	if (!cloud.wrap) return false;
	const dek = await unwrapDek(cloud.wrap as WrapEnvelope, passphrase);
	if (!dek) return false;
	setDataKey(dek);
	await enableLock(passphrase);
	return true;
}

export async function unlockAccountWithHex(typed: string): Promise<boolean> {
	const cloud = await fetchCloudWrap();
	if (!cloud.recoveryWrap) return false;
	const dek = await unwrapDek(cloud.recoveryWrap as WrapEnvelope, normalizeKitInput(typed));
	if (!dek) return false;
	setDataKey(dek);
	const result = await putCloudWrap({ wrap: null, wrapRev: cloud.wrapRev });
	await rememberWrapRev(result.wrapRev);
	return true;
}

export function rejectUnchangedPassphrase(oldPass: string, nextPass: string): void {
	if (oldPass === nextPass) throw new Error('New passphrase must be different');
}

export async function changeAccountPassphrase(oldPass: string, nextPass: string): Promise<void> {
	const cloud = await fetchCloudWrap();
	if (!cloud.wrap) throw new Error('Incorrect passphrase');
	const dek = await unwrapDek(cloud.wrap as WrapEnvelope, oldPass);
	if (!dek) throw new Error('Incorrect passphrase');
	rejectUnchangedPassphrase(oldPass, nextPass);
	const wrap = await wrapDek(dek, nextPass);
	const result = await putCloudWrap({ wrap, wrapRev: cloud.wrapRev });
	await rememberWrapRev(result.wrapRev);
	await enableLock(nextPass);
}
