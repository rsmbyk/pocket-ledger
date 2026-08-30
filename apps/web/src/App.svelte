<script lang="ts">
	import { onMount } from 'svelte';
	import { ModeWatcher, mode, setMode, userPrefersMode } from 'mode-watcher';
	import AppShell from '$lib/ui/AppShell.svelte';
	import UnlockScreen from '$lib/ui/UnlockScreen.svelte';
	import {
		clearPocketGoal,
		createPocket,
		deletePocket,
		ensureDefaultAccount,
		getAccountsOverview,
		reorderPockets,
		updatePocket,
		type CreatePocketInput,
		type UpdatePocketInput
	} from '$lib/application/accounts';
	import {
		getAllPocketsBalance,
		listRecentTransactions
	} from '$lib/application/transactions';
	import { loadMonthSummary } from '$lib/application/month-summary';
	import {
		backupFilename,
		buildEncryptedBackup,
		parseEncryptedBackupJson,
		restoreEncryptedBackup
	} from '$lib/application/backup';
	import { resetLocalData } from '$lib/application/reset';
	import {
		disableLock,
		enableLock,
		ensureLocalDek,
		isLockEnabled,
		lockSession,
		unlockWithPassphrase
	} from '$lib/application/lock';
	import { listAllCategories, listResolvedGroups } from '$lib/application/categories';
	import type { Account } from '$lib/domain/account';
	import type { LedgerTransaction } from '$lib/domain/transaction';
	import type { CategoryRow } from '$lib/data/db';
	import type { OverlayGroup } from '$lib/domain/category-overlay';
	import {
		canShiftMonth,
		currentMonthKey,
		shiftMonth,
		type MonthBounds,
		type MonthKey,
		type MonthSummary
	} from '$lib/domain/month-summary';
	import { parseThemePreference, THEME_STORAGE_KEY, type ThemePreference } from '$lib/shared/theme';
	import AccountPassphraseScreen from '$lib/ui/AccountPassphraseScreen.svelte';
	import HexKitScreen from '$lib/ui/HexKitScreen.svelte';
	import ScreensaverOverlay from '$lib/ui/ScreensaverOverlay.svelte';
	import LocalConflictDialog from '$lib/ui/LocalConflictDialog.svelte';
	import {
		cloudConfigured,
		fakeGoogleEnabled,
		fetchMe,
		googleClientId,
		listCloudSessions,
		LocalConflictError,
		logoutCloud,
		revokeCloudSession,
		signInWithGoogleToken,
		type CloudSession
	} from '$lib/application/cloud-api';
	import { localHasData } from '$lib/application/local-has-data';
	import { generateRecoveryKit, type RecoveryKit } from '$lib/application/hex-kit';
	import {
		setAccountPassphrase,
		unlockAccountWithHex,
		unlockAccountWithPassphrase,
		uploadRecoveryWrap
	} from '$lib/application/account-lock';
	import { parseIdleSettings } from '$lib/application/idle';
	import { enrollWebAuthn } from '$lib/application/webauthn';
	import {
		SETTINGS_IDLE_LEAVE_TAB,
		SETTINGS_IDLE_MINUTES,
		SETTINGS_WEBAUTHN,
		db
	} from '$lib/data/db';
	import { getSetting, setSetting } from '$lib/data/settings-repo';
	import { loadLockout, saveLockout } from '$lib/application/device-lockout-repo';
	import { isLockedOut, recordSuccess, recordWrongGuess } from '$lib/application/device-lockout';
	import {
		pullAndApply,
		pushSealedEntity,
		pushTransactionById
	} from '$lib/application/sync-client';
	import { promptGoogleIdToken } from '$lib/application/google-signin';
	import { clearDataKey } from '$lib/data/session-key';
	import type { AuthMe } from '$lib/application/cloud-api';

	let account = $state<Account | null>(null);
	let accounts = $state<Account[]>([]);
	let isSinglePot = $state(true);
	let balanceMinor = $state(0);
	let transactions = $state<LedgerTransaction[]>([]);
	let categoriesById = $state<Record<string, CategoryRow>>({});
	let expenseCategories = $state<CategoryRow[]>([]);
	let incomeCategories = $state<CategoryRow[]>([]);
	let categoryGroups = $state<OverlayGroup[]>([]);
	let monthKey = $state<MonthKey>(currentMonthKey());
	let monthSummary = $state<MonthSummary | null>(null);
	let monthBounds = $state<MonthBounds | null>(null);
	let lockEnabled = $state(false);
	let unlocked = $state(true);
	let ready = $state(false);
	let error = $state<string | null>(null);
	let themePreference = $state<ThemePreference>('system');
	let signedIn = $state(false);
	let userEmail = $state<string | null>(null);
	let accountOnboarding = $state<AuthMe['onboarding'] | null>(null);
	let recoveryKit = $state<RecoveryKit | null>(null);
	let screensaverOn = $state(false);
	let idleMinutes = $state(30);
	let leaveTab = $state(true);
	let sessions = $state<CloudSession[]>([]);
	let conflictOpen = $state(false);
	let pendingGoogleToken = $state<string | null>(null);
	let lockoutUntil = $state<number | null>(null);
	let lastActivity = $state(Date.now());
	let webauthnEnrolled = $state(false);

	let canPrevMonth = $derived(monthBounds ? canShiftMonth(monthKey, -1, monthBounds) : false);
	let canNextMonth = $derived(monthBounds ? canShiftMonth(monthKey, 1, monthBounds) : false);

	async function refreshLedger(active: Account, key: MonthKey = monthKey) {
		const [overview, balance, recent, allCategories, monthLoad, groups] = await Promise.all([
			getAccountsOverview(),
			getAllPocketsBalance(),
			listRecentTransactions(active.id),
			listAllCategories(),
			loadMonthSummary(active.id, key),
			listResolvedGroups()
		]);
		accounts = overview.accounts;
		isSinglePot = overview.isSinglePot;
		balanceMinor = balance;
		transactions = recent;
		categoriesById = Object.fromEntries(allCategories.map((c) => [c.id, c]));
		monthKey = monthLoad.monthKey;
		monthBounds = monthLoad.bounds;
		monthSummary = monthLoad.summary;
		categoryGroups = groups;
		expenseCategories = allCategories.filter((c) => c.kind === 'expense' && !c.hidden);
		incomeCategories = allCategories.filter((c) => c.kind === 'income' && !c.hidden);
	}

	async function bootstrap() {
		const dekState = await ensureLocalDek();
		lockEnabled = await isLockEnabled();
		unlocked = dekState === 'unlocked';
		const idleStored = parseIdleSettings(
			await getSetting(SETTINGS_IDLE_MINUTES),
			await getSetting(SETTINGS_IDLE_LEAVE_TAB)
		);
		idleMinutes = idleStored.minutes;
		leaveTab = idleStored.leaveTab;
		webauthnEnrolled = Boolean(await getSetting(SETTINGS_WEBAUTHN));
		const lockout = await loadLockout();
		lockoutUntil = lockout.lockedUntil;
		if (cloudConfigured()) {
			try {
				const me = await fetchMe();
				if (me) applyMe(me);
			} catch {
				/* signed-out if API is down */
			}
		}
		if (!unlocked) {
			account = await ensureDefaultAccount();
			isSinglePot = true;
			return;
		}
		if (signedIn && accountOnboarding && accountOnboarding !== 'complete') {
			account = await ensureDefaultAccount();
			return;
		}
		if (signedIn) {
			try {
				await pullAndApply();
			} catch {
				/* online required; keep cache */
			}
			sessions = await listCloudSessions().catch(() => []);
		}
		const overview = await getAccountsOverview();
		const active = overview.accounts[0] ?? null;
		account = active;
		accounts = overview.accounts;
		isSinglePot = overview.isSinglePot;
		if (active) {
			await refreshLedger(active);
		}
	}

	onMount(() => {
		themePreference = parseThemePreference(userPrefersMode.current);
		void (async () => {
			try {
				await bootstrap();
				ready = true;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to open local database';
				ready = true;
			}
		})();
		const onActivity = () => {
			lastActivity = Date.now();
		};
		window.addEventListener('pointerdown', onActivity);
		window.addEventListener('keydown', onActivity);
		const idleTimer = window.setInterval(() => {
			if (screensaverOn || !unlocked) return;
			if (Date.now() - lastActivity >= idleMinutes * 60_000) {
				lockSession();
				unlocked = false;
				screensaverOn = true;
			}
		}, 1000);
		const onVis = () => {
			if (document.visibilityState === 'hidden' && leaveTab && unlocked) {
				lockSession();
				unlocked = false;
				screensaverOn = true;
			}
		};
		document.addEventListener('visibilitychange', onVis);
		let poll: number | undefined;
		poll = window.setInterval(() => {
			if (!signedIn || !unlocked || document.visibilityState !== 'visible') return;
			void pullAndApply()
				.then(() => onRefreshLedger())
				.catch(() => undefined);
		}, 30_000);
		return () => {
			window.removeEventListener('pointerdown', onActivity);
			window.removeEventListener('keydown', onActivity);
			document.removeEventListener('visibilitychange', onVis);
			window.clearInterval(idleTimer);
			if (poll) window.clearInterval(poll);
		};
	});

	function onThemePreferenceChange(next: ThemePreference) {
		themePreference = next;
		setMode(next);
	}

	async function onRefreshLedger() {
		if (!account) return;
		await refreshLedger(account);
	}

	async function onPrevMonth() {
		if (!account || !monthBounds || !canShiftMonth(monthKey, -1, monthBounds)) return;
		const nextKey = shiftMonth(monthKey, -1);
		const loaded = await loadMonthSummary(account.id, nextKey);
		monthKey = loaded.monthKey;
		monthBounds = loaded.bounds;
		monthSummary = loaded.summary;
	}

	async function onNextMonth() {
		if (!account || !monthBounds || !canShiftMonth(monthKey, 1, monthBounds)) return;
		const nextKey = shiftMonth(monthKey, 1);
		const loaded = await loadMonthSummary(account.id, nextKey);
		monthKey = loaded.monthKey;
		monthBounds = loaded.bounds;
		monthSummary = loaded.summary;
	}

	async function onUnlock(passphrase: string) {
		const lockout = await loadLockout();
		if (isLockedOut(lockout, Date.now())) {
			lockoutUntil = lockout.lockedUntil;
			throw new Error('Too many guesses. Try again later.');
		}
		const ok = signedIn
			? await unlockAccountWithPassphrase(passphrase)
			: await unlockWithPassphrase(passphrase);
		if (!ok) {
			const next = recordWrongGuess(lockout, new Date());
			await saveLockout(next);
			lockoutUntil = next.lockedUntil;
			throw new Error('Incorrect passphrase');
		}
		await saveLockout(recordSuccess(lockout, new Date()));
		lockoutUntil = null;
		unlocked = true;
		if (account) await refreshLedger(account);
	}

	function applyMe(me: AuthMe) {
		signedIn = true;
		userEmail = me.user.email;
		accountOnboarding = me.onboarding;
		if (me.onboarding === 'needs-kit' && !recoveryKit) {
			recoveryKit = generateRecoveryKit();
		}
	}

	async function onExport(passphrase: string) {
		const backup = await buildEncryptedBackup(passphrase);
		const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = backupFilename();
		a.click();
		URL.revokeObjectURL(url);
	}

	async function onImportFile(file: File, passphrase: string) {
		const text = await file.text();
		const backup = parseEncryptedBackupJson(text);
		await restoreEncryptedBackup(backup, passphrase);
		await bootstrap();
		if (account && unlocked) await refreshLedger(account);
	}

	async function onResetLocalData(options: {
		preserveCategories: boolean;
		preservePassphrase: boolean;
	}) {
		await resetLocalData(options);
		await bootstrap();
		if (account && unlocked) await refreshLedger(account);
	}

	$effect(() => {
		themePreference = parseThemePreference(userPrefersMode.current);
		void mode.current;
	});

	async function finishGoogle(idToken: string, discardLocal = false) {
		const me = await signInWithGoogleToken(idToken, {
			localHasData: await localHasData(),
			discardLocal
		});
		if (discardLocal) {
			clearDataKey();
			await db.delete();
			await db.open();
			await ensureLocalDek();
		}
		applyMe(me);
		if (me.onboarding === 'complete') {
			unlocked = false;
		}
	}

	async function onGoogleSignIn() {
		const token = fakeGoogleEnabled()
			? `fake.${crypto.randomUUID()}.e2e@example.com`
			: googleClientId()
				? await promptGoogleIdToken(googleClientId())
				: null;
		if (!token) throw new Error('Google Sign-In is not configured on this build');
		try {
			await finishGoogle(token);
		} catch (err) {
			if (err instanceof LocalConflictError) {
				pendingGoogleToken = token;
				conflictOpen = true;
				return;
			}
			throw err;
		}
	}
</script>

<ModeWatcher
	defaultMode="system"
	modeStorageKey={THEME_STORAGE_KEY}
	themeColors={{ dark: '#0a0a0a', light: '#ffffff' }}
/>

{#if !ready}
	<div class="text-muted-foreground flex min-h-svh items-center justify-center text-sm">
		Starting up…
	</div>
{:else if screensaverOn}
	<ScreensaverOverlay
		{signedIn}
		{lockEnabled}
		onContinue={async () => {
			screensaverOn = false;
			if (!lockEnabled && !signedIn) {
				await ensureLocalDek();
				unlocked = true;
				if (account) await refreshLedger(account);
			}
		}}
	/>
{:else if lockEnabled && !unlocked && !signedIn}
	<UnlockScreen variant="device" lockedUntil={lockoutUntil} {onUnlock} />
{:else if signedIn && accountOnboarding === 'needs-passphrase'}
	<AccountPassphraseScreen
		onSubmit={async (passphrase) => {
			await setAccountPassphrase(passphrase);
			lockEnabled = true;
			recoveryKit = generateRecoveryKit();
			accountOnboarding = 'needs-kit';
		}}
	/>
{:else if signedIn && accountOnboarding === 'needs-kit' && recoveryKit}
	<HexKitScreen
		kit={recoveryKit}
		onConfirm={async () => {
			await uploadRecoveryWrap(recoveryKit!.compact);
			accountOnboarding = 'complete';
			unlocked = true;
			await bootstrap();
			if (account) await refreshLedger(account);
		}}
	/>
{:else if signedIn && accountOnboarding === 'complete' && !unlocked}
	<UnlockScreen
		variant="account"
		allowHex
		{onUnlock}
		onUnlockHex={async (hex) => {
			const ok = await unlockAccountWithHex(hex);
			if (!ok) throw new Error('Recovery kit did not match');
			accountOnboarding = 'needs-passphrase';
			unlocked = true;
		}}
	/>
{:else if lockEnabled && !unlocked}
	<UnlockScreen variant="device" lockedUntil={lockoutUntil} {onUnlock} />
{:else}
	<AppShell
		{account}
		{accounts}
		{isSinglePot}
		{balanceMinor}
		{transactions}
		{categoriesById}
		{monthSummary}
		{canPrevMonth}
		{canNextMonth}
		{expenseCategories}
		{incomeCategories}
		{categoryGroups}
		{lockEnabled}
		{signedIn}
		{themePreference}
		{onThemePreferenceChange}
		{onRefreshLedger}
		{onPrevMonth}
		{onNextMonth}
		{onExport}
		{onImportFile}
		{onResetLocalData}
		onEnableLock={async (passphrase) => {
			await enableLock(passphrase);
			lockEnabled = true;
		}}
		onDisableLock={async (passphrase) => {
			await disableLock(passphrase);
			lockEnabled = false;
		}}
		onLockSession={() => {
			lockSession();
			unlocked = false;
		}}
		onCreatePocket={async (input: CreatePocketInput) => {
			await createPocket(input);
			await onRefreshLedger();
		}}
		onUpdatePocket={async (input: UpdatePocketInput) => {
			await updatePocket(input);
			await onRefreshLedger();
		}}
		onDeletePocket={async (id) => {
			await deletePocket(id);
			await onRefreshLedger();
		}}
		onReorderPockets={async (orderedNonMainIds) => {
			await reorderPockets(orderedNonMainIds);
			await onRefreshLedger();
		}}
		onClearPocketGoal={async (id) => {
			await clearPocketGoal(id);
			await onRefreshLedger();
		}}
		onPushTransaction={async (id, deleted) => {
			if (!signedIn) return;
			await pushTransactionById(id, deleted === true);
			await pullAndApply();
		}}
		onSyncConflict={async () => {
			await pullAndApply();
			await onRefreshLedger();
		}}
		cloudConfigured={cloudConfigured()}
		{userEmail}
		{sessions}
		{idleMinutes}
		{leaveTab}
		{onGoogleSignIn}
		onSignOut={async () => {
			await logoutCloud();
			clearDataKey();
			await db.delete();
			window.location.assign('/');
		}}
		onRevokeSession={async (id) => {
			await revokeCloudSession(id);
			sessions = await listCloudSessions();
		}}
		onIdleMinutes={async (minutes) => {
			idleMinutes = minutes as typeof idleMinutes;
			await setSetting(SETTINGS_IDLE_MINUTES, String(minutes));
			if (signedIn) {
				await pushSealedEntity('setting', SETTINGS_IDLE_MINUTES, {
					key: SETTINGS_IDLE_MINUTES,
					value: String(minutes)
				});
			}
		}}
		onLeaveTab={async (on) => {
			leaveTab = on;
			await setSetting(SETTINGS_IDLE_LEAVE_TAB, String(on));
			if (signedIn) {
				await pushSealedEntity('setting', SETTINGS_IDLE_LEAVE_TAB, {
					key: SETTINGS_IDLE_LEAVE_TAB,
					value: String(on)
				});
			}
		}}
		onEnrollWebAuthn={async () => {
			const id = await enrollWebAuthn();
			await setSetting(SETTINGS_WEBAUTHN, id);
			webauthnEnrolled = true;
		}}
		{webauthnEnrolled}
		{ready}
		{error}
	/>
{/if}

<LocalConflictDialog
	open={conflictOpen}
	onCancel={() => {
		conflictOpen = false;
		pendingGoogleToken = null;
	}}
	onConsent={async () => {
		if (!pendingGoogleToken) return;
		await finishGoogle(pendingGoogleToken, true);
		conflictOpen = false;
		pendingGoogleToken = null;
	}}
/>
