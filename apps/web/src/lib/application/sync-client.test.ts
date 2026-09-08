import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, SETTINGS_IDLE_MINUTES, SETTINGS_THEME_PREFERENCE } from '$lib/data/db';
import { setSetting } from '$lib/data/settings-repo';
import * as cloudApi from '$lib/application/cloud-api';
import { DEFAULT_ACCOUNT_NAME, type Account } from '$lib/domain/account';
import type { SyncEntity } from '$lib/application/sync';
import { SyncConflictError } from '$lib/application/sync';
import {
	catchUpPushLocal,
	localRev,
	pullAndApply,
	pushAccountById,
	pushSealedEntityIfSignedIn,
	setLocalRev
} from './sync-client';

function accountRow(id: string, opts?: Partial<Account>): Account {
	return {
		id,
		name: opts?.name ?? DEFAULT_ACCOUNT_NAME,
		currencyLabel: 'IDR',
		createdAt: '2026-01-01T00:00:00.000Z',
		isMain: opts?.isMain ?? true,
		sortOrder: opts?.sortOrder ?? 0,
		notes: opts?.notes ?? '',
		openingBalanceMinor: 0,
		openingAsOf: '2026-01-01',
		openingEnabled: opts?.openingEnabled ?? false,
		goalTargetMinor: null,
		goalTargetOn: null,
		goalEnabled: false
	};
}

function entity(
	kind: string,
	id: string,
	blob: unknown,
	opts?: { rev?: number; deleted?: boolean }
): SyncEntity {
	return {
		id,
		kind,
		rev: opts?.rev ?? 1,
		deleted: opts?.deleted === true,
		blob: blob == null ? null : JSON.stringify(blob)
	};
}

describe('sync-client catalog (241)', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
		vi.spyOn(cloudApi, 'cloudConfigured').mockReturnValue(true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('applies account, custom category, and category group blobs', async () => {
		vi.spyOn(cloudApi, 'pullCloudEntities').mockResolvedValue([
			entity('account', 'p1', accountRow('p1', { name: 'A', isMain: false })),
			entity('category', 'c1', {
				id: 'c1',
				name: 'Warung',
				kind: 'expense',
				sortOrder: 0,
				createdAt: '2026-01-01T00:00:00.000Z',
				deletedAt: null,
				groupId: 'stock-group:food-drink',
				icon: 'tag',
				hidden: false,
				source: 'custom'
			}),
			entity('categoryGroup', 'g1', {
				id: 'g1',
				name: 'Side',
				kind: 'expense',
				createdAt: '2026-01-01T00:00:00.000Z'
			})
		]);
		await pullAndApply();
		expect((await db.accounts.get('p1'))?.name).toBe('A');
		expect((await db.categories.get('c1'))?.name).toBe('Warung');
		expect((await db.categoryGroups.get('g1'))?.name).toBe('Side');
		expect(await localRev('account', 'p1')).toBe(1);
	});

	it('applies allowlisted settings and skips lock keys', async () => {
		vi.spyOn(cloudApi, 'pullCloudEntities').mockResolvedValue([
			entity('setting', SETTINGS_THEME_PREFERENCE, {
				key: SETTINGS_THEME_PREFERENCE,
				value: 'dark'
			}),
			entity('setting', SETTINGS_IDLE_MINUTES, { key: SETTINGS_IDLE_MINUTES, value: '10' }),
			entity('setting', 'lock.rawDek', { key: 'lock.rawDek', value: 'nope' })
		]);
		await pullAndApply();
		expect((await db.settings.get(SETTINGS_THEME_PREFERENCE))?.value).toBe('dark');
		expect((await db.settings.get(SETTINGS_IDLE_MINUTES))?.value).toBe('10');
		expect(await db.settings.get('lock.rawDek')).toBeUndefined();
	});

	it('drops an unused local seed Main when the cloud already has a Main', async () => {
		const seed = accountRow('local-seed');
		await db.accounts.put(seed);
		const cloudMain = accountRow('cloud-main');
		vi.spyOn(cloudApi, 'pullCloudEntities').mockResolvedValue([
			entity('account', 'cloud-main', cloudMain),
			entity('account', 'pocket-a', accountRow('pocket-a', { name: 'A', isMain: false }))
		]);
		await pullAndApply();
		expect(await db.accounts.get('local-seed')).toBeUndefined();
		expect(await db.accounts.get('cloud-main')).toBeTruthy();
		expect((await db.accounts.get('pocket-a'))?.name).toBe('A');
	});

	it('keeps a local seed Main that still has transactions', async () => {
		const seed = accountRow('local-seed');
		await db.accounts.put(seed);
		await db.transactions.put({
			id: 'tx1',
			accountId: 'local-seed',
			counterAccountId: null,
			type: 'expense',
			amountMinor: 100,
			feeMinor: 0,
			categoryId: null,
			note: '',
			occurredOn: '2026-01-02',
			createdAt: '2026-01-02T00:00:00.000Z',
			voidedAt: null
		});
		vi.spyOn(cloudApi, 'pullCloudEntities').mockResolvedValue([
			entity('account', 'cloud-main', accountRow('cloud-main'))
		]);
		await pullAndApply();
		expect(await db.accounts.get('local-seed')).toBeTruthy();
	});

	it('catch-up PUTs a local pocket with no rev and skips ones already pulled', async () => {
		const put = vi.spyOn(cloudApi, 'putCloudEntity').mockImplementation(async (incoming) => ({
			id: incoming.id,
			kind: incoming.kind,
			rev: 1,
			deleted: incoming.deleted === true,
			blob: incoming.blob
		}));
		await db.accounts.put(accountRow('new-a', { name: 'A', isMain: false }));
		await db.accounts.put(accountRow('already'));
		await setLocalRev('account', 'already', 3);
		await catchUpPushLocal();
		const accountPuts = put.mock.calls.filter((c) => c[0].kind === 'account');
		expect(accountPuts.map((c) => c[0].id)).toEqual(['new-a']);
		expect(await localRev('account', 'new-a')).toBe(1);
	});

	it('does not PUT when cloud is not configured', async () => {
		vi.spyOn(cloudApi, 'cloudConfigured').mockReturnValue(false);
		const put = vi.spyOn(cloudApi, 'putCloudEntity');
		await db.accounts.put(accountRow('a', { name: 'A', isMain: false }));
		await pushAccountById('a');
		expect(put).not.toHaveBeenCalled();
	});

	it('swallows 401 on signed-out PUT', async () => {
		const err = Object.assign(new Error('unauthorized'), { status: 401 });
		vi.spyOn(cloudApi, 'putCloudEntity').mockRejectedValue(err);
		await db.accounts.put(accountRow('a', { name: 'A', isMain: false }));
		await expect(pushSealedEntityIfSignedIn('account', 'a', accountRow('a'))).resolves.toBeUndefined();
	});

	it('propagates non-401 PUT failures', async () => {
		vi.spyOn(cloudApi, 'putCloudEntity').mockRejectedValue(new Error('network'));
		await db.accounts.put(accountRow('a', { name: 'A', isMain: false }));
		await expect(pushAccountById('a')).rejects.toThrow(/network/);
	});

	it('skips catch-up PUT after a 409', async () => {
		vi.spyOn(cloudApi, 'putCloudEntity').mockRejectedValue(new SyncConflictError());
		await db.accounts.put(accountRow('a', { name: 'A', isMain: false }));
		await expect(catchUpPushLocal()).resolves.toBeUndefined();
	});
});
