<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ModeWatcher, mode, setMode, userPrefersMode } from 'mode-watcher';
	import AppShell from '$lib/ui/AppShell.svelte';
	import UnlockScreen from '$lib/ui/UnlockScreen.svelte';
	import {
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
	import { listGoals, migratePocketGoals } from '$lib/application/goals';
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
	import type { PocketGoal } from '$lib/domain/goals';
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
	import AccountRecoveryScreen from '$lib/ui/AccountRecoveryScreen.svelte';
	import HexKitScreen from '$lib/ui/HexKitScreen.svelte';
	import ScreensaverOverlay from '$lib/ui/ScreensaverOverlay.svelte';
	import LocalConflictDialog from '$lib/ui/LocalConflictDialog.svelte';
	import {
		cloudConfigured,
		fetchMe,
		listCloudSessions,
		LocalConflictError,
		logoutCloud,
		resetCloudAccount,
		revokeCloudSession,
		shouldWipeCloudOnSignOut,
		signInWithGoogleToken,
		DEBUG_FAKE_GOOGLE_TOKEN,
		type CloudSession
	} from '$lib/application/cloud-api';
	import { localHasData } from '$lib/application/local-has-data';
	import { generateRecoveryKit, type RecoveryKit } from '$lib/application/hex-kit';
	import {
		changeAccountPassphrase,
		setAccountPassphrase,
		unlockAccountWithHex,
		unlockAccountWithPassphrase,
		uploadRecoveryWrap
	} from '$lib/application/account-lock';
	import { parseIdleSettings } from '$lib/application/idle';
	import { getDisplayCurrency, saveDisplayCurrency } from '$lib/application/display-currency';
	import { enrollWebAuthn } from '$lib/application/webauthn';
	import {
		SETTINGS_IDLE_LEAVE_TAB,
		SETTINGS_IDLE_MINUTES,
		SETTINGS_WEBAUTHN,
		db
	} from '$lib/data/db';
	import { getSetting, setSetting } from '$lib/data/settings-repo';
	import { loadLockout, saveLockout } from '$lib/application/device-lockout-repo';
	import {
		loadPendingPassphraseReset,
		loadRecoveryOffered,
		savePendingPassphraseReset,
		saveRecoveryOffered
	} from '$lib/application/account-recovery-flags';
	import { displayNameFromIdentity } from '$lib/application/google-profile';
	import { isLockedOut, recordSuccess, recordWrongGuess, emptyLockout } from '$lib/application/device-lockout';
	import {
		pullAndApply,
		pushSealedEntity,
		pushTransactionById
	} from '$lib/application/sync-client';
	import { clearDataKey, getDataKey } from '$lib/data/session-key';
	import type { AuthMe } from '$lib/application/cloud-api';

	let account = $state<Account | null>(null);
	let accounts = $state<Account[]>([]);
	let goals = $state<PocketGoal[]>([]);
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
	let userDisplayName = $state('');
	let userPictureUrl = $state('');
	let cloudGoogleSub = $state<string | null>(null);
	let accountOnboarding = $state<AuthMe['onboarding'] | null>(null);
	let recoveryKit = $state<RecoveryKit | null>(null);
	let recoveryOffered = $state(false);
	let pendingPassphraseReset = $state(false);
	let accountRecoveryOpen = $state(false);
	let dekPresent = $state(false);
	let screensaverOn = $state(false);
	let idleMinutes = $state(30);
	let leaveTab = $state(true);
	let displayCurrency = $state('IDR');
	let sessions = $state<CloudSession[]>([]);
	let conflictOpen = $state(false);
	let pendingGoogleToken = $state<string | null>(null);
	let lockoutUntil = $state<number | null>(null);
	let lastActivity = $state(Date.now());
	let webauthnEnrolled = $state(false);

	let canPrevMonth = $derived(monthBounds ? canShiftMonth(monthKey, -1, monthBounds) : false);
	let canNextMonth = $derived(monthBounds ? canShiftMonth(monthKey, 1, monthBounds) : false);

	async function refreshLedger(active: Account, key: MonthKey = monthKey) {
		const [overview, balance, recent, allCategories, monthLoad, groups, allGoals] = await Promise.all([
			getAccountsOverview(),
			getAllPocketsBalance(),
			listRecentTransactions(active.id),
			listAllCategories(),
			loadMonthSummary(active.id, key),
			listResolvedGroups(),
			listGoals()
		]);
		accounts = overview.accounts;
		goals = allGoals;
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
		recoveryOffered = await loadRecoveryOffered();
		pendingPassphraseReset = await loadPendingPassphraseReset();
		if (pendingPassphraseReset && !getDataKey()) {
			lockEnabled = true;
			unlocked = false;
			dekPresent = false;
		} else {
			const dekState = await ensureLocalDek();
			lockEnabled = await isLockEnabled();
			unlocked = dekState === 'unlocked';
			dekPresent = Boolean(getDataKey());
		}
		const idleStored = parseIdleSettings(
			await getSetting(SETTINGS_IDLE_MINUTES),
			await getSetting(SETTINGS_IDLE_LEAVE_TAB)
		);
		idleMinutes = idleStored.minutes;
		leaveTab = idleStored.leaveTab;
		displayCurrency = await getDisplayCurrency();
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
		await migratePocketGoals();
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
				dekPresent = false;
				screensaverOn = true;
			}
		}, 1000);
		const onVis = () => {
			if (document.visibilityState === 'hidden' && leaveTab && unlocked) {
				lockSession();
				unlocked = false;
				dekPresent = false;
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
			if (signedIn && next.lockedUntil) {
				await saveRecoveryOffered(true);
				recoveryOffered = true;
			}
			throw new Error('Incorrect passphrase');
		}
		await saveLockout(recordSuccess(lockout, new Date()));
		lockoutUntil = null;
		if (signedIn) {
			await saveRecoveryOffered(false);
			recoveryOffered = false;
		}
		unlocked = true;
		dekPresent = true;
		if (account) await refreshLedger(account);
	}

	function applyMe(me: AuthMe) {
		signedIn = true;
		userEmail = me.user.email;
		userDisplayName = displayNameFromIdentity(me.user.displayName, me.user.email);
		userPictureUrl = me.user.pictureUrl ?? '';
		cloudGoogleSub = me.user.googleSub;
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
		preserveSettings: boolean;
		preservePassphrase: boolean;
	}) {
		await resetLocalData(options);
		await bootstrap();
		if (account && unlocked) await refreshLedger(account);
	}

	function unlockOrRecoveryShowing(): boolean {
		if (!ready || screensaverOn) return false;
		if (lockEnabled && !unlocked && !signedIn) return true;
		if (signedIn && (accountRecoveryOpen || (pendingPassphraseReset && !dekPresent))) return true;
		if (signedIn && accountOnboarding === 'needs-passphrase') return false;
		if (signedIn && accountOnboarding === 'needs-kit' && recoveryKit) return false;
		if (signedIn && accountOnboarding === 'complete' && !unlocked) return true;
		if (lockEnabled && !unlocked) return true;
		return false;
	}

	function redirectUnlockToHome() {
		if (!unlockOrRecoveryShowing()) return;
		if (page.url.pathname === '/') return;
		void goto('/', { replaceState: true });
	}

	$effect(() => {
		themePreference = parseThemePreference(userPrefersMode.current);
		void mode.current;
	});

	$effect(() => {
		redirectUnlockToHome();
	});

	afterNavigate(() => {
		redirectUnlockToHome();
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

	async function onGoogleCredential(idToken: string) {
		try {
			await finishGoogle(idToken);
		} catch (err) {
			if (err instanceof LocalConflictError) {
				pendingGoogleToken = idToken;
				conflictOpen = true;
				return;
			}
			throw err;
		}
	}

	async function onGoogleSignIn() {
		await onGoogleCredential(`fake.${crypto.randomUUID()}.e2e@example.com`);
	}

	async function onDebugFakeSignUp() {
		clearDataKey();
		await db.delete();
		await db.open();
		await ensureLocalDek();
		await onGoogleCredential(DEBUG_FAKE_GOOGLE_TOKEN);
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
{:else if signedIn && (accountRecoveryOpen || (pendingPassphraseReset && !dekPresent))}
	<AccountRecoveryScreen
		onRecover={async (hex) => {
			const ok = await unlockAccountWithHex(hex);
			if (!ok) throw new Error('Recovery kit did not match');
			await savePendingPassphraseReset(true);
			pendingPassphraseReset = true;
			accountRecoveryOpen = false;
			dekPresent = true;
			accountOnboarding = 'needs-passphrase';
		}}
		onBack={
			accountRecoveryOpen && !pendingPassphraseReset
				? () => (accountRecoveryOpen = false)
				: undefined
		}
	/>
{:else if signedIn && accountOnboarding === 'needs-passphrase'}
	<AccountPassphraseScreen
		onSubmit={async (passphrase) => {
			await setAccountPassphrase(passphrase);
			lockEnabled = true;
			await savePendingPassphraseReset(false);
			await saveRecoveryOffered(false);
			await saveLockout(emptyLockout(new Date()));
			lockoutUntil = null;
			pendingPassphraseReset = false;
			recoveryOffered = false;
			const me = await fetchMe();
			if (!me) throw new Error('Not signed in');
			applyMe(me);
			if (me.onboarding === 'complete') {
				unlocked = true;
				await bootstrap();
				if (account) await refreshLedger(account);
				return;
			}
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
		lockedUntil={lockoutUntil}
		showRecovery={recoveryOffered}
		{onUnlock}
		onOpenRecovery={() => (accountRecoveryOpen = true)}
	/>
{:else if lockEnabled && !unlocked}
	<UnlockScreen variant="device" lockedUntil={lockoutUntil} {onUnlock} />
{:else}
	<AppShell
		{account}
		{accounts}
		{goals}
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
		onChangeAccountPassphrase={async (oldPass, nextPass) => {
			await changeAccountPassphrase(oldPass, nextPass);
		}}
		onLockSession={() => {
			lockSession();
			unlocked = false;
			dekPresent = false;
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
		{userDisplayName}
		{userPictureUrl}
		{sessions}
		{idleMinutes}
		{leaveTab}
		{displayCurrency}
		{onGoogleSignIn}
		{onGoogleCredential}
		{onDebugFakeSignUp}
		debugFakeUser={shouldWipeCloudOnSignOut(cloudGoogleSub)}
		onSignOut={async () => {
			if (shouldWipeCloudOnSignOut(cloudGoogleSub)) {
				await resetCloudAccount({ signOut: true });
			} else {
				await logoutCloud();
			}
			clearDataKey();
			await db.delete();
			window.location.assign('/');
		}}
		onResetCloudSignOut={async () => {
			await resetCloudAccount({ signOut: true });
			clearDataKey();
			await db.delete();
			window.location.assign('/');
		}}
		onResetCloudStaySignedIn={async () => {
			await resetCloudAccount({ signOut: false });
			clearDataKey();
			await db.delete();
			window.location.assign('/');
		}}
		onRevokeSession={async (id) => {
			await revokeCloudSession(id);
			sessions = await listCloudSessions();
		}}
		onSaveIdle={async (minutes, on) => {
			idleMinutes = minutes as typeof idleMinutes;
			leaveTab = on;
			await setSetting(SETTINGS_IDLE_MINUTES, String(minutes));
			await setSetting(SETTINGS_IDLE_LEAVE_TAB, String(on));
			if (signedIn) {
				await pushSealedEntity('setting', SETTINGS_IDLE_MINUTES, {
					key: SETTINGS_IDLE_MINUTES,
					value: String(minutes)
				});
				await pushSealedEntity('setting', SETTINGS_IDLE_LEAVE_TAB, {
					key: SETTINGS_IDLE_LEAVE_TAB,
					value: String(on)
				});
			}
		}}
		onSaveCurrency={async (code) => {
			displayCurrency = await saveDisplayCurrency(code);
			if (signedIn) {
				await pushSealedEntity('setting', 'displayCurrency', {
					key: 'displayCurrency',
					value: displayCurrency
				});
			}
			await onRefreshLedger();
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
