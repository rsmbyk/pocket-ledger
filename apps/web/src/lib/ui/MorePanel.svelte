<script lang="ts">
	import HardDriveIcon from '@lucide/svelte/icons/hard-drive';
	import LockIcon from '@lucide/svelte/icons/lock';
	import XIcon from '@lucide/svelte/icons/x';
	import CloudIcon from '@lucide/svelte/icons/cloud';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { Popover } from 'bits-ui';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import NewPassphraseFields from '$lib/ui/NewPassphraseFields.svelte';
	import { IDLE_MINUTES, DEFAULT_IDLE_MINUTES, DEFAULT_LEAVE_TAB } from '$lib/application/idle';
	import {
		DEFAULT_DISPLAY_CURRENCY,
		listCurrencyOptions,
		searchCurrencies,
		type CurrencyOption
	} from '$lib/domain/display-currency';
	import { inspectEncryptedBackup, type BackupInspectSummary } from '$lib/application/backup';
	import { verifyPassphrase } from '$lib/application/lock';
	import { newPassphraseLiveState } from '$lib/application/new-passphrase-fields';
	import { fakeGoogleEnabled, googleClientId } from '$lib/application/cloud-api';
	import { mountGoogleSignInButton } from '$lib/application/google-signin';
	import { untrack } from 'svelte';
	import { mode } from 'mode-watcher';

	type Props = {
		lockEnabled: boolean;
		signedIn?: boolean;
		cloudConfigured?: boolean;
		userEmail?: string | null;
		sessions?: Array<{
			id: string;
			userAgent: string;
			lastSeenAt: string;
			current: boolean;
		}>;
		idleMinutes?: number;
		leaveTab?: boolean;
		displayCurrency?: string;
		onExport: (passphrase: string) => void | Promise<void>;
		onImportFile: (file: File, passphrase: string) => void | Promise<void>;
		onResetLocalData: (options: {
			preserveSettings: boolean;
			preservePassphrase: boolean;
		}) => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
		onChangeAccountPassphrase?: (oldPass: string, nextPass: string) => void | Promise<void>;
		onGoogleSignIn?: () => void | Promise<void>;
		onGoogleCredential?: (idToken: string) => void | Promise<void>;
		onDebugFakeSignUp?: () => void | Promise<void>;
		debugFakeUser?: boolean;
		onSignOut?: () => void | Promise<void>;
		onResetCloudSignOut?: () => void | Promise<void>;
		onResetCloudStaySignedIn?: () => void | Promise<void>;
		onRevokeSession?: (id: string) => void | Promise<void>;
		onSaveIdle?: (minutes: number, leaveTab: boolean) => void | Promise<void>;
		onSaveCurrency?: (code: string) => void | Promise<void>;
		onEnrollWebAuthn?: () => void | Promise<void>;
		webauthnEnrolled?: boolean;
	};

	let {
		lockEnabled,
		signedIn = false,
		cloudConfigured = false,
		userEmail = null,
		sessions = [],
		idleMinutes = DEFAULT_IDLE_MINUTES,
		leaveTab = DEFAULT_LEAVE_TAB,
		displayCurrency = DEFAULT_DISPLAY_CURRENCY,
		onExport,
		onImportFile,
		onResetLocalData,
		onEnableLock,
		onDisableLock,
		onChangeAccountPassphrase,
		onGoogleSignIn,
		onGoogleCredential,
		onDebugFakeSignUp,
		debugFakeUser = false,
		onSignOut,
		onResetCloudSignOut,
		onResetCloudStaySignedIn,
		onRevokeSession,
		onSaveIdle,
		onSaveCurrency,
		onEnrollWebAuthn,
		webauthnEnrolled = false
	}: Props = $props();

	const currencies = listCurrencyOptions();

	let lockPass = $state('');
	let lockPassConfirm = $state('');
	let lockPassError = $state<string | null>(null);
	let accountCurrentPass = $state('');
	let accountNewPass = $state('');
	let accountNewConfirm = $state('');
	let accountPassError = $state<string | null>(null);
	let accountPassBusy = $state(false);
	let resetOpen = $state(false);
	let preserveSettings = $state(false);
	let preservePassphrase = $state(false);
	let resetPass = $state('');
	let resetPassError = $state<string | null>(null);

	let importConfirmOpen = $state(false);
	let importInvalidOpen = $state(false);
	let importInvalidReason = $state<'v1' | 'invalid'>('invalid');
	let importSummary = $state<BackupInspectSummary | null>(null);
	let pendingImportFile = $state<File | null>(null);
	let importPass = $state('');
	let importPassError = $state<string | null>(null);
	let importFileInput = $state<HTMLInputElement | null>(null);
	let exportOpen = $state(false);
	let exportPass = $state('');
	let exportPassConfirm = $state('');
	let exportPassError = $state<string | null>(null);
	let disableLockConfirmOpen = $state(false);
	let signOutOpen = $state(false);
	let fakeSignupOpen = $state(false);
	let resetCloudSignOutOpen = $state(false);
	let resetCloudStayOpen = $state(false);
	let error = $state<string | null>(null);
	let gisHost = $state<HTMLDivElement | undefined>(undefined);

	let currencyDraft = $state(DEFAULT_DISPLAY_CURRENCY);
	let currencySearch = $state('');
	let currencyOpen = $state(false);
	let idleMinutesOpen = $state(false);

	let idleDraftMinutes = $state(String(DEFAULT_IDLE_MINUTES));
	let idleDraftLeave = $state(DEFAULT_LEAVE_TAB);
	let syncedCurrency = $state<string | null>(null);
	let syncedIdleMinutes = $state<number | null>(null);
	let syncedLeaveTab = $state<boolean | null>(null);

	$effect.pre(() => {
		if (syncedCurrency !== displayCurrency) {
			syncedCurrency = displayCurrency;
			currencyDraft = displayCurrency;
		}
	});
	$effect.pre(() => {
		if (syncedIdleMinutes !== idleMinutes || syncedLeaveTab !== leaveTab) {
			syncedIdleMinutes = idleMinutes;
			syncedLeaveTab = leaveTab;
			idleDraftMinutes = String(idleMinutes);
			idleDraftLeave = leaveTab;
		}
	});

	const currencyDirty = $derived(currencyDraft !== displayCurrency);
	const idleDirty = $derived(
		Number(idleDraftMinutes) !== idleMinutes || idleDraftLeave !== leaveTab
	);
	const filteredCurrencies = $derived(searchCurrencies(currencies, currencySearch));
	const selectedCurrency = $derived(
		currencies.find((c) => c.code === currencyDraft) ?? currencies[0]!
	);

	const canEnableLock = $derived(newPassphraseLiveState(lockPass, lockPassConfirm).canSubmit);
	const canChangeAccount = $derived(
		Boolean(accountCurrentPass.trim()) &&
			newPassphraseLiveState(accountNewPass, accountNewConfirm, accountCurrentPass).canSubmit
	);
	const accountCurrentInvalid = $derived(
		Boolean(accountPassError && /incorrect passphrase/i.test(accountPassError))
	);
	const accountUnchangedError = $derived(
		Boolean(accountPassError && /must be different/i.test(accountPassError))
	);

	async function wrap(action: () => void | Promise<void>) {
		try {
			error = null;
			await action();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		}
	}

	$effect(() => {
		const el = gisHost;
		const colorScheme = mode.current === 'dark' ? 'dark' : 'light';
		const showGis =
			Boolean(el) &&
			cloudConfigured &&
			!signedIn &&
			!fakeGoogleEnabled() &&
			googleClientId().length > 0;
		if (!el || !showGis) return;
		const clientId = googleClientId();
		const onCred = untrack(() => onGoogleCredential);
		let cancelled = false;
		void mountGoogleSignInButton({
			host: el,
			clientId,
			colorScheme,
			onCredential: (credential) => {
				if (cancelled || !onCred) return;
				void wrap(() => onCred(credential));
			}
		}).catch((err) => {
			if (cancelled) return;
			error = err instanceof Error ? err.message : 'Something went wrong';
		});
		return () => {
			cancelled = true;
			el.replaceChildren();
		};
	});

	function pickCurrency(option: CurrencyOption) {
		currencyDraft = option.code;
		currencyOpen = false;
		currencySearch = '';
	}

	function pickIdleMinutes(mins: number) {
		idleDraftMinutes = String(mins);
		idleMinutesOpen = false;
	}

	async function onImportPicked(file: File) {
		const raw = await file.text();
		const inspected = inspectEncryptedBackup(raw);
		if (!inspected.ok) {
			importInvalidReason = inspected.reason;
			importInvalidOpen = true;
			pendingImportFile = null;
			importSummary = null;
			return;
		}
		pendingImportFile = file;
		importSummary = inspected.summary;
	}
</script>

{#snippet sectionHeading(title: string)}
	<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</p>
{/snippet}

{#snippet currencyOptionLabel(option: CurrencyOption)}
	<span class="flex min-w-0 items-baseline gap-2">
		<span class="font-mono shrink-0">{option.code}</span>
		<span class="truncate">{option.name}</span>
	</span>
{/snippet}

<div class="space-y-4" data-testid="settings-panel">
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}
	<div class="flex flex-col gap-4" data-testid="settings-sections">
		<Card.Root class="p-(--card-spacing)" data-testid="settings-section-cloud">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<CloudIcon class="size-5" aria-hidden="true" />
					Cloud Sync
				</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4 px-0">
				<div class="flex flex-col gap-2">
					{@render sectionHeading('Account')}
					<p class="text-muted-foreground text-sm">
						{#if signedIn}
							Signed in as {userEmail}.
							{#if debugFakeUser}
								Signing out deletes this debug user’s cloud copy and wipes this device.
							{:else}
								Signing out wipes this device; cloud stays.
							{/if}
						{:else}
							Optional. Google only. You can keep using Pocket Ledger without an account.
						{/if}
					</p>
					{#if signedIn}
						{#if sessions.length > 0}
							<ul class="space-y-2 text-sm" data-testid="session-list">
								{#each sessions as session (session.id)}
									<li class="flex items-center justify-between gap-2">
										<span>
											{session.current ? 'This device' : session.userAgent || 'Other device'}
										</span>
										{#if !session.current && onRevokeSession}
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onclick={() => void wrap(() => onRevokeSession(session.id))}
												data-testid="session-revoke"
											>
												Revoke
											</Button>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
						<Button
							type="button"
							variant="destructive"
							data-testid="cloud-sign-out"
							onclick={() => (signOutOpen = true)}
						>
							Sign out
						</Button>
						{#if onResetCloudSignOut}
							<Button
								type="button"
								variant="destructive"
								data-testid="debug-reset-cloud-sign-out"
								onclick={() => (resetCloudSignOutOpen = true)}
							>
								Reset cloud and sign out
							</Button>
						{/if}
						{#if onResetCloudStaySignedIn}
							<Button
								type="button"
								variant="destructive"
								data-testid="debug-reset-cloud-stay"
								onclick={() => (resetCloudStayOpen = true)}
							>
								Reset cloud, stay signed in
							</Button>
						{/if}
						{#if onEnrollWebAuthn}
							<Button
								type="button"
								variant="outline"
								onclick={() => void wrap(onEnrollWebAuthn)}
								data-testid="webauthn-enroll"
							>
								{webauthnEnrolled ? 'This device unlock is on' : 'Use this device’s screen lock'}
							</Button>
						{/if}
					{:else if cloudConfigured && fakeGoogleEnabled() && onGoogleSignIn}
						<Button
							type="button"
							class="w-full"
							onclick={() => void wrap(onGoogleSignIn)}
							data-testid="google-sign-in"
						>
							Sign in with Google
						</Button>
					{:else if cloudConfigured && googleClientId()}
						<div
							bind:this={gisHost}
							class="gis-sign-in scheme-light w-full overflow-hidden rounded-[4px]"
							data-testid="google-sign-in"
						></div>
						{#if onDebugFakeSignUp}
							<Button
								type="button"
								variant="destructive"
								data-testid="debug-fake-signup"
								onclick={() => (fakeSignupOpen = true)}
							>
								Sign up with fake account
							</Button>
						{/if}
					{:else}
						<p class="text-muted-foreground text-sm">
							Cloud sign-in is not configured on this build.
						</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="p-(--card-spacing)" data-testid="settings-section-currency">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<BanknoteIcon class="size-5" aria-hidden="true" />
					Currency
				</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4 px-0">
				<div class="flex flex-col gap-2">
					{@render sectionHeading('Display currency')}
					<Popover.Root bind:open={currencyOpen}>
						<Popover.Trigger
							type="button"
							class="border-input bg-background flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm md:h-9"
							data-testid="currency-picker"
						>
							{@render currencyOptionLabel(selectedCurrency)}
							<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Content
								class="bg-popover text-popover-foreground z-50 w-(--bits-popover-anchor-width) overflow-hidden rounded-md border p-1 shadow-md"
								align="start"
								sideOffset={4}
							>
								<Input
									placeholder="Search ISO or name"
									bind:value={currencySearch}
									data-testid="currency-picker-search"
									class="mb-1"
								/>
								<div class="max-h-60 overflow-y-auto">
									{#each filteredCurrencies as option (option.code)}
										<button
											type="button"
											class="hover:bg-accent flex w-full px-2 py-1.5 text-left text-sm"
											onclick={() => pickCurrency(option)}
										>
											{@render currencyOptionLabel(option)}
										</button>
									{/each}
								</div>
							</Popover.Content>
						</Popover.Portal>
					</Popover.Root>
				</div>
				<div class="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={!currencyDirty}
						data-testid="currency-cancel"
						onclick={() => (currencyDraft = displayCurrency)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="outline"
						disabled={currencyDraft === DEFAULT_DISPLAY_CURRENCY}
						data-testid="currency-default"
						onclick={() => (currencyDraft = DEFAULT_DISPLAY_CURRENCY)}
					>
						Default
					</Button>
					<Button
						type="button"
						disabled={!currencyDirty}
						data-testid="currency-save"
						onclick={() => void wrap(async () => onSaveCurrency?.(currencyDraft))}
					>
						Save
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="p-(--card-spacing)" data-testid="settings-section-idle">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<MoonIcon class="size-5" aria-hidden="true" />
					Idle Screensaver
				</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4 px-0">
				<div class="flex flex-col gap-2">
					{@render sectionHeading('Timeout')}
					<Popover.Root bind:open={idleMinutesOpen}>
						<Popover.Trigger
							id="idle-minutes"
							type="button"
							class="border-input bg-background flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm md:h-9"
							data-testid="idle-minutes"
							aria-label="Timeout"
						>
							<span class="truncate">{idleDraftMinutes} minutes</span>
							<ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Content
								class="bg-popover text-popover-foreground z-50 w-(--bits-popover-anchor-width) overflow-hidden rounded-md border p-1 shadow-md"
								align="start"
								sideOffset={4}
							>
								<div class="max-h-60 overflow-y-auto">
									{#each IDLE_MINUTES as mins}
										<button
											type="button"
											role="option"
											class="hover:bg-accent flex w-full px-2 py-1.5 text-left text-sm"
											aria-selected={idleDraftMinutes === String(mins)}
											data-testid="idle-minutes-{mins}"
											onclick={() => pickIdleMinutes(mins)}
										>
											{mins} minutes
										</button>
									{/each}
								</div>
							</Popover.Content>
						</Popover.Portal>
					</Popover.Root>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							class="size-5 accent-primary md:size-4"
							checked={idleDraftLeave}
							onchange={(e) => (idleDraftLeave = (e.currentTarget as HTMLInputElement).checked)}
							data-testid="idle-leave-tab"
						/>
						Lock when I leave this tab
					</label>
				</div>
				<div class="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={!idleDirty}
						data-testid="idle-cancel"
						onclick={() => {
							idleDraftMinutes = String(idleMinutes);
							idleDraftLeave = leaveTab;
						}}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="outline"
						disabled={
							Number(idleDraftMinutes) === DEFAULT_IDLE_MINUTES &&
							idleDraftLeave === DEFAULT_LEAVE_TAB
						}
						data-testid="idle-default"
						onclick={() => {
							idleDraftMinutes = String(DEFAULT_IDLE_MINUTES);
							idleDraftLeave = DEFAULT_LEAVE_TAB;
						}}
					>
						Default
					</Button>
					<Button
						type="button"
						disabled={!idleDirty}
						data-testid="idle-save"
						onclick={() =>
							void wrap(async () => onSaveIdle?.(Number(idleDraftMinutes), idleDraftLeave))}
					>
						Save
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="p-(--card-spacing)" data-testid="settings-section-privacy">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<LockIcon class="size-5" aria-hidden="true" />
					Privacy
				</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4 px-0">
				<div class="flex flex-col gap-2">
					{@render sectionHeading('Device encryption')}
					<p class="text-sm">
						Without a passphrase, anyone with this browser can read the ledger. A passphrase wraps
						the key on this device; forgotten passphrases cannot be recovered.
					</p>
					<p class="text-sm" data-testid="lock-status">
						Lock is <strong>{lockEnabled ? 'on' : 'off'}</strong>
						{#if signedIn}
							(account passphrase — cannot be removed while signed in)
						{/if}
					</p>
				</div>
				{#if !lockEnabled}
					<form
						class="flex flex-col gap-2"
						onsubmit={(e) => {
							e.preventDefault();
							if (!canEnableLock) return;
							lockPassError = null;
							void (async () => {
								try {
									await onEnableLock(lockPass);
									lockPass = '';
									lockPassConfirm = '';
								} catch (err) {
									lockPassError = err instanceof Error ? err.message : 'Could not enable lock';
								}
							})();
						}}
					>
						<NewPassphraseFields
							bind:passphrase={lockPass}
							bind:confirm={lockPassConfirm}
							passphrasePlaceholder="New passphrase (min 8)"
							passphraseTestId="enable-lock-pass"
							confirmTestId="enable-lock-pass-confirm"
							requirementsTestId="enable-lock-requirements"
							onInput={() => (lockPassError = null)}
						/>
						{#if lockPassError}
							<p class="text-destructive text-sm" role="alert">{lockPassError}</p>
						{/if}
						<Button type="submit" class="w-full" disabled={!canEnableLock} data-testid="enable-lock"
							>Enable lock</Button
						>
					</form>
				{:else if !signedIn}
					<form
						class="flex flex-col gap-2"
						onsubmit={(e) => {
							e.preventDefault();
							if (!lockPass.trim()) return;
							disableLockConfirmOpen = true;
						}}
					>
						<Input
							type="password"
							placeholder="Current passphrase"
							bind:value={lockPass}
							autocomplete="current-password"
							data-testid="disable-lock-pass"
						/>
						<Button
							type="submit"
							variant="destructive"
							class="w-full"
							disabled={!lockPass.trim()}
							data-testid="disable-lock">Disable lock</Button
						>
					</form>
				{:else}
					<form
						class="flex flex-col gap-4"
						onsubmit={(e) => {
							e.preventDefault();
							if (!canChangeAccount || !onChangeAccountPassphrase || accountPassBusy) return;
							accountPassError = null;
							accountPassBusy = true;
							void (async () => {
								try {
									await onChangeAccountPassphrase(accountCurrentPass, accountNewPass);
									accountCurrentPass = '';
									accountNewPass = '';
									accountNewConfirm = '';
								} catch (err) {
									accountPassError =
										err instanceof Error ? err.message : 'Could not change passphrase';
								} finally {
									accountPassBusy = false;
								}
							})();
						}}
					>
						<p class="text-muted-foreground text-sm">
							While signed in, the account passphrase stays on. You can change it here, not remove
							it.
						</p>
						<div class="flex flex-col gap-2">
							{@render sectionHeading('Old passphrase')}
							<div class="relative">
								<Input
									type="password"
									placeholder="Current passphrase"
									class="pr-10"
									bind:value={accountCurrentPass}
									autocomplete="current-password"
									data-testid="change-account-current"
									aria-invalid={accountCurrentInvalid ? true : undefined}
									oninput={() => (accountPassError = null)}
								/>
								{#if accountCurrentInvalid}
									<XIcon
										class="text-destructive pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
									/>
								{/if}
							</div>
							{#if accountCurrentInvalid}
								<p class="text-destructive text-sm" role="alert" data-testid="change-account-error">
									{accountPassError}
								</p>
							{/if}
						</div>
						<div class="flex flex-col gap-2">
							{@render sectionHeading('New passphrase')}
							<NewPassphraseFields
								bind:passphrase={accountNewPass}
								bind:confirm={accountNewConfirm}
								mustDifferFrom={accountCurrentPass}
								passphrasePlaceholder="New passphrase (min 8)"
								passphraseTestId="change-account-pass"
								confirmTestId="change-account-pass-confirm"
								requirementsTestId="change-account-requirements"
								onInput={() => (accountPassError = null)}
							/>
							{#if accountUnchangedError}
								<p class="text-destructive text-sm" role="alert">{accountPassError}</p>
							{:else if accountPassError && !accountCurrentInvalid}
								<p class="text-destructive text-sm" role="alert">{accountPassError}</p>
							{/if}
						</div>
						<Button
							type="submit"
							class="w-full"
							disabled={!canChangeAccount || accountPassBusy}
							data-testid="change-account-submit">Change passphrase</Button
						>
					</form>
				{/if}
			</Card.Content>
		</Card.Root>

		{#if !signedIn}
			<Card.Root class="p-(--card-spacing)" data-testid="settings-section-backup">
				<Card.Header class="px-0">
					<Card.Title class="flex items-center gap-2 text-base">
						<HardDriveIcon class="size-5" aria-hidden="true" />
						Backup
					</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-(--card-spacing) px-0">
					<div class="flex flex-col gap-2">
						{@render sectionHeading('Export')}
						<p class="text-muted-foreground text-sm">
							The passphrase wraps this backup file. It is not a separate product unlock.
						</p>
						<Button
							type="button"
							onclick={() => {
								exportPass = '';
								exportPassConfirm = '';
								exportPassError = null;
								exportOpen = true;
							}}
							data-testid="export-backup"
						>
							Export backup
						</Button>
					</div>
					<div class="flex flex-col gap-2">
						{@render sectionHeading('Import')}
						<p class="text-muted-foreground text-sm">Choose a Pocket Ledger backup</p>
						<input
							bind:this={importFileInput}
							id="import-file"
							type="file"
							accept="application/json,.json"
							class="sr-only"
							data-testid="import-backup"
							onchange={(e) => {
								const file = (e.currentTarget as HTMLInputElement).files?.[0];
								e.currentTarget.value = '';
								if (!file) return;
								void onImportPicked(file);
							}}
						/>
						<Button type="button" onclick={() => importFileInput?.click()} data-testid="import-backup-choose">
							Choose file
						</Button>
						{#if pendingImportFile}
							<p class="text-muted-foreground truncate text-sm" data-testid="import-backup-filename">
								{pendingImportFile.name}
							</p>
						{/if}
						{#if importSummary}
							<div class="text-muted-foreground space-y-1 text-sm" data-testid="backup-import-summary">
								<p>{importSummary.pockets} pockets</p>
								<p>{importSummary.transactions} transactions</p>
								<p>{importSummary.categories} categories</p>
								<p>{importSummary.categoryGroups} category groups</p>
								<p>{importSummary.goals} goals</p>
								{#if importSummary.exportedAt}
									<p>Exported {importSummary.exportedAt}</p>
								{/if}
							</div>
							<Button
								type="button"
								onclick={() => (importConfirmOpen = true)}
								data-testid="import-backup-open"
							>
								Import
							</Button>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root
				class="border-destructive/40 p-(--card-spacing)"
				data-testid="settings-section-reset"
			>
				<Card.Header class="px-0">
					<Card.Title class="text-destructive flex items-center gap-2 text-base">
						<TriangleAlertIcon class="size-5" aria-hidden="true" />
						Reset
					</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4 px-0">
					<p class="text-sm">
						Permanently delete local ledger data. Export a backup first if you might need it.
					</p>
					<Button
						type="button"
						variant="destructive"
						data-testid="reset-all"
						onclick={() => {
							preserveSettings = false;
							preservePassphrase = false;
							resetPass = '';
							resetPassError = null;
							resetOpen = true;
						}}
					>
						Reset
					</Button>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>

<Dialog.Root bind:open={resetOpen}>
	<Dialog.Content
		class="max-w-sm gap-0 overflow-hidden p-0 sm:max-w-sm"
		data-testid="reset-dialog"
		showCloseButton={false}
	>
		<Dialog.Header
			class="gap-1 space-y-0 border-b border-destructive/20 bg-destructive/5 px-6 py-3"
			data-testid="confirm-dialog-danger-header"
		>
			<div class="flex items-center gap-2">
				<TriangleAlertIcon class="text-destructive size-5 shrink-0" aria-hidden="true" />
				<Dialog.Title>Reset everything?</Dialog.Title>
			</div>
		</Dialog.Header>
		<div class="space-y-4 px-6 py-4">
			<Dialog.Description>
				This permanently deletes transactions, pockets, goals, and categories. Cannot be undone.
				Export a backup first if you might need the data.
			</Dialog.Description>
			<div class="flex flex-col gap-1">
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						class="size-5 accent-primary md:size-4"
						bind:checked={preserveSettings}
						data-testid="reset-preserve-settings"
					/>
					Keep settings
				</label>
				<p class="text-muted-foreground pl-7 text-sm" data-testid="reset-preserve-settings-hint">
					Display currency, idle minutes, and lock when you leave this tab.
				</p>
			</div>
			{#if lockEnabled}
				<div class="flex flex-col gap-1">
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							class="size-5 accent-primary md:size-4"
							bind:checked={preservePassphrase}
							data-testid="reset-preserve-passphrase"
						/>
						Keep passphrase
					</label>
					<p
						class="text-muted-foreground pl-7 text-sm"
						data-testid="reset-preserve-passphrase-hint"
					>
						Device lock on this browser.
					</p>
				</div>
				<Input
					type="password"
					placeholder="Current passphrase"
					bind:value={resetPass}
					data-testid="reset-passphrase"
					oninput={() => (resetPassError = null)}
				/>
				{#if resetPassError}
					<p class="text-destructive text-sm" role="alert">{resetPassError}</p>
				{/if}
			{/if}
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (resetOpen = false)}>Cancel</Button>
				<Button
					type="button"
					variant="destructive"
					data-testid="reset-all-confirm"
					disabled={lockEnabled && !resetPass.trim()}
					onclick={() =>
						void wrap(async () => {
							if (lockEnabled) {
								const ok = await verifyPassphrase(resetPass);
								if (!ok) {
									resetPassError = 'Incorrect passphrase';
									return;
								}
							}
							await onResetLocalData({ preserveSettings, preservePassphrase });
							resetOpen = false;
						})}
				>
					Reset
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	bind:open={exportOpen}
	onOpenChange={(open) => {
		exportOpen = open;
		if (!open) {
			exportPass = '';
			exportPassConfirm = '';
			exportPassError = null;
		}
	}}
>
	<Dialog.Content class="max-w-sm sm:max-w-sm" data-testid="export-backup-dialog">
		<Dialog.Header>
			<Dialog.Title>Export encrypted backup</Dialog.Title>
			<Dialog.Description>
				{#if lockEnabled}
					Enter the passphrase that wraps this backup file. Use the same passphrase as this
					device’s lock.
				{:else}
					Set a one-time backup file passphrase (min 8). This does not turn on device lock.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-3"
			onsubmit={(e) => {
				e.preventDefault();
				if (!lockEnabled && exportPass !== exportPassConfirm) {
					exportPassError = 'Passphrases do not match';
					return;
				}
				if (exportPass.length < 8) {
					exportPassError = 'Passphrase must be at least 8 characters';
					return;
				}
				exportPassError = null;
				void wrap(async () => {
					await onExport(exportPass);
					exportOpen = false;
				});
			}}
		>
			<Input
				type="password"
				placeholder="Backup file passphrase"
				bind:value={exportPass}
				autocomplete="off"
				data-testid="export-backup-pass"
				oninput={() => (exportPassError = null)}
			/>
			{#if !lockEnabled}
				<Input
					type="password"
					placeholder="Confirm file passphrase"
					bind:value={exportPassConfirm}
					autocomplete="off"
					data-testid="export-backup-pass-confirm"
					oninput={() => (exportPassError = null)}
				/>
			{/if}
			{#if exportPassError}
				<p class="text-destructive text-sm" role="alert">{exportPassError}</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (exportOpen = false)}>Cancel</Button>
				<Button type="submit" data-testid="export-backup-confirm">Export</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={importInvalidOpen}>
	<Dialog.Content class="max-w-sm sm:max-w-sm" data-testid="backup-import-invalid-dialog">
		<Dialog.Header>
			<Dialog.Title>Not a Pocket Ledger backup</Dialog.Title>
			<Dialog.Description>
				{#if importInvalidReason === 'v1'}
					Plaintext backups (formatVersion 1) are no longer supported.
				{:else}
					This file is not a Pocket Ledger backup.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end">
			<Button type="button" onclick={() => (importInvalidOpen = false)}>OK</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	bind:open={importConfirmOpen}
	onOpenChange={(open) => {
		importConfirmOpen = open;
		if (!open) {
			importPass = '';
			importPassError = null;
		}
	}}
>
	<Dialog.Content
		class="max-w-sm gap-0 overflow-hidden p-0 sm:max-w-sm"
		data-testid="import-backup-dialog"
		showCloseButton={false}
	>
		<Dialog.Header
			class="gap-1 space-y-0 border-b border-destructive/20 bg-destructive/5 px-6 py-3"
			data-testid="confirm-dialog-danger-header"
		>
			<div class="flex items-center gap-2">
				<TriangleAlertIcon class="text-destructive size-5 shrink-0" aria-hidden="true" />
				<Dialog.Title>Replace local data?</Dialog.Title>
			</div>
		</Dialog.Header>
		<div class="space-y-4 px-6 py-4">
			<Dialog.Description>
				Import replaces all local data with this backup. This cannot be undone.
			</Dialog.Description>
			<Input
				type="password"
				placeholder="Backup file passphrase"
				bind:value={importPass}
				autocomplete="off"
				data-testid="import-backup-pass"
				oninput={() => (importPassError = null)}
			/>
			{#if importPassError}
				<p class="text-destructive text-sm" role="alert" data-testid="import-backup-pass-error">
					{importPassError}
				</p>
			{/if}
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (importConfirmOpen = false)}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					data-testid="import-backup-confirm"
					onclick={() =>
						void (async () => {
							if (!pendingImportFile) return;
							importPassError = null;
							try {
								await onImportFile(pendingImportFile, importPass);
								pendingImportFile = null;
								importSummary = null;
								importPass = '';
								importPassError = null;
								importConfirmOpen = false;
							} catch (err) {
								importPassError =
									err instanceof Error ? err.message : 'Something went wrong';
							}
						})()}
				>
					Import
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<ConfirmDialog
	open={disableLockConfirmOpen}
	title="Disable lock?"
	description="Passphrase protection will be removed from this browser. Continue?"
	confirmLabel="Disable"
	destructive
	dangerChrome
	confirmTestId="disable-lock-confirm"
	onOpenChange={(open) => (disableLockConfirmOpen = open)}
	onConfirm={async () => {
		await wrap(async () => {
			await onDisableLock(lockPass);
			lockPass = '';
		});
	}}
/>

<ConfirmDialog
	open={signOutOpen}
	title="Sign out?"
	description={debugFakeUser
		? 'Testing only. Permanently deletes this debug user’s cloud copy and wipes this device.'
		: 'This device’s copy is wiped. There is no signed-in file export. Cloud data stays.'}
	confirmLabel="Sign out"
	destructive
	dangerChrome
	confirmTestId="cloud-sign-out-confirm"
	onOpenChange={(open) => (signOutOpen = open)}
	onConfirm={async () => {
		if (onSignOut) await wrap(onSignOut);
	}}
/>

<ConfirmDialog
	open={fakeSignupOpen}
	title="Sign up with fake account?"
	description="Testing only. Wipes this device and signs in as the debug fake user (no Google). Next sign-out deletes that user’s cloud copy."
	confirmLabel="Sign up with fake account"
	destructive
	dangerChrome
	confirmTestId="debug-fake-signup-confirm"
	onOpenChange={(open) => (fakeSignupOpen = open)}
	onConfirm={async () => {
		if (onDebugFakeSignUp) await wrap(onDebugFakeSignUp);
	}}
/>

<ConfirmDialog
	open={resetCloudSignOutOpen}
	title="Reset cloud and sign out?"
	description="Testing only. Permanently deletes this account’s cloud copy and wipes this device. You will need to Sign in with Google again."
	confirmLabel="Reset and sign out"
	destructive
	dangerChrome
	confirmTestId="debug-reset-cloud-sign-out-confirm"
	onOpenChange={(open) => (resetCloudSignOutOpen = open)}
	onConfirm={async () => {
		if (onResetCloudSignOut) await wrap(onResetCloudSignOut);
	}}
/>

<ConfirmDialog
	open={resetCloudStayOpen}
	title="Reset cloud, stay signed in?"
	description="Testing only. Permanently deletes this account’s cloud copy and wipes this device. You stay signed in and will set a new passphrase."
	confirmLabel="Reset and stay signed in"
	destructive
	dangerChrome
	confirmTestId="debug-reset-cloud-stay-confirm"
	onOpenChange={(open) => (resetCloudStayOpen = open)}
	onConfirm={async () => {
		if (onResetCloudStaySignedIn) await wrap(onResetCloudStaySignedIn);
	}}
/>
