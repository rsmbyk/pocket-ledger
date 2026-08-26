<script lang="ts">
	import HardDriveIcon from '@lucide/svelte/icons/hard-drive';
	import LockIcon from '@lucide/svelte/icons/lock';
	import CloudIcon from '@lucide/svelte/icons/cloud';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import DeviceSkipWarning from '$lib/ui/DeviceSkipWarning.svelte';
	import { IDLE_MINUTES } from '$lib/application/idle';

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
		onExport: (passphrase: string) => void | Promise<void>;
		onImportFile: (file: File, passphrase: string) => void | Promise<void>;
		onResetLocalData: (options: {
			preserveCategories: boolean;
			preservePassphrase: boolean;
		}) => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
		onGoogleSignIn?: () => void | Promise<void>;
		onSignOut?: () => void | Promise<void>;
		onRevokeSession?: (id: string) => void | Promise<void>;
		onIdleMinutes?: (minutes: number) => void;
		onLeaveTab?: (on: boolean) => void;
		onEnrollWebAuthn?: () => void | Promise<void>;
		webauthnEnrolled?: boolean;
	};

	let {
		lockEnabled,
		signedIn = false,
		cloudConfigured = false,
		userEmail = null,
		sessions = [],
		idleMinutes = 30,
		leaveTab = true,
		onExport,
		onImportFile,
		onResetLocalData,
		onEnableLock,
		onDisableLock,
		onGoogleSignIn,
		onSignOut,
		onRevokeSession,
		onIdleMinutes,
		onLeaveTab,
		onEnrollWebAuthn,
		webauthnEnrolled = false
	}: Props = $props();

	let lockPass = $state('');
	let lockPassConfirm = $state('');
	let lockPassError = $state<string | null>(null);
	let resetOpen = $state(false);
	let preserveCategories = $state(false);
	let preservePassphrase = $state(false);

	let importConfirmOpen = $state(false);
	let pendingImportFile = $state<File | null>(null);
	let importPass = $state('');
	let exportOpen = $state(false);
	let exportPass = $state('');
	let exportPassConfirm = $state('');
	let exportPassError = $state<string | null>(null);
	let disableLockConfirmOpen = $state(false);
	let signOutOpen = $state(false);
	let error = $state<string | null>(null);

	async function wrap(action: () => void | Promise<void>) {
		try {
			error = null;
			await action();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		}
	}
</script>

<div class="space-y-4" data-testid="more-panel">
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}
	<div class="flex flex-col gap-4" data-testid="more-sections">
		{#if !signedIn}
		<Card.Root class="p-(--card-spacing)" data-testid="more-section-backup">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<HardDriveIcon class="size-5" aria-hidden="true" />
					Backup
				</Card.Title>
				<Card.Description>Encrypted export or replace all local data.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2 px-0">
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
				<div class="space-y-2">
					<Label for="import-file">Import backup (replaces everything)</Label>
					<Input
						id="import-file"
						type="file"
						accept="application/json,.json"
						data-testid="import-backup"
						onchange={(e) => {
							const file = (e.currentTarget as HTMLInputElement).files?.[0];
							if (!file) return;
							pendingImportFile = file;
							importConfirmOpen = true;
							e.currentTarget.value = '';
						}}
					/>
				</div>
				<Button
					type="button"
					variant="destructive"
					data-testid="reset-all"
					onclick={() => {
						preserveCategories = false;
						preservePassphrase = false;
						resetOpen = true;
					}}
				>
					Reset everything
				</Button>
			</Card.Content>
		</Card.Root>
		{/if}

		<Card.Root class="p-(--card-spacing)" data-testid="more-section-cloud">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<CloudIcon class="size-5" aria-hidden="true" />
					Cloud
				</Card.Title>
				<Card.Description>
					{#if signedIn}
						Signed in as {userEmail}. Signing out wipes this device; cloud stays.
					{:else}
						Optional. Google only. You can keep using Pocket Ledger without an account.
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2 px-0">
				{#if cloudConfigured && !signedIn && onGoogleSignIn}
					<Button type="button" onclick={() => void wrap(onGoogleSignIn)} data-testid="google-sign-in">
						Sign in with Google
					</Button>
				{:else if signedIn}
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
											variant="outline"
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
				{:else}
					<p class="text-muted-foreground text-sm">Cloud sign-in is not configured on this build.</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root class="p-(--card-spacing)" data-testid="more-section-privacy">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<LockIcon class="size-5" aria-hidden="true" />
					Privacy
				</Card.Title>
				<Card.Description>
					Optional passphrase lock (off by default). When on, notes and names are encrypted at rest
					in this browser. Forgotten passphrases cannot be recovered.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2 px-0">
				{#if !lockEnabled && !signedIn}
					<DeviceSkipWarning onSetPassphrase={() => document.querySelector<HTMLInputElement>('[data-testid=enable-lock-pass]')?.focus()} />
				{/if}
				<p class="text-sm" data-testid="lock-status">
					Lock is <strong>{lockEnabled ? 'on' : 'off'}</strong>
					{#if signedIn}
						(account passphrase — cannot be removed while signed in)
					{/if}
				</p>
				<div class="space-y-2" data-testid="idle-settings">
					<Label for="idle-minutes">Idle screensaver</Label>
					<select
						id="idle-minutes"
						class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
						value={String(idleMinutes)}
						onchange={(e) => onIdleMinutes?.(Number((e.currentTarget as HTMLSelectElement).value))}
						data-testid="idle-minutes"
					>
						{#each IDLE_MINUTES as mins}
							<option value={mins}>{mins} minutes</option>
						{/each}
					</select>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							class="size-5 accent-primary md:size-4"
							checked={leaveTab}
							onchange={(e) => onLeaveTab?.((e.currentTarget as HTMLInputElement).checked)}
							data-testid="idle-leave-tab"
						/>
						Lock when I leave this tab
					</label>
				</div>
				{#if !lockEnabled}
					<form
						class="space-y-2"
						onsubmit={(e) => {
							e.preventDefault();
							if (lockPass !== lockPassConfirm) {
								lockPassError = 'Passphrases do not match';
								return;
							}
							lockPassError = null;
							void (async () => {
								try {
									await onEnableLock(lockPass);
									lockPass = '';
									lockPassConfirm = '';
								} catch (err) {
									lockPassError =
										err instanceof Error ? err.message : 'Could not enable lock';
								}
							})();
						}}
					>
						<Input
							type="password"
							placeholder="New passphrase (min 8)"
							bind:value={lockPass}
							autocomplete="new-password"
							data-testid="enable-lock-pass"
							aria-invalid={lockPassError && /at least|Passphrase must/i.test(lockPassError)
								? true
								: undefined}
							oninput={() => (lockPassError = null)}
						/>
						{#if lockPassError && /at least|Passphrase must/i.test(lockPassError)}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="lock-field-error-passphrase"
							>
								{lockPassError}
							</p>
						{/if}
						<Input
							type="password"
							placeholder="Confirm passphrase"
							bind:value={lockPassConfirm}
							autocomplete="new-password"
							aria-invalid={lockPassError && /do not match/i.test(lockPassError) ? true : undefined}
							oninput={() => (lockPassError = null)}
						/>
						{#if lockPassError && /do not match/i.test(lockPassError)}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="lock-field-error-passphraseConfirm"
							>
								{lockPassError}
							</p>
						{:else if lockPassError}
							<p class="text-destructive text-sm" role="alert">{lockPassError}</p>
						{/if}
						<Button type="submit" class="w-full" data-testid="enable-lock">Enable lock</Button>
					</form>
				{:else if !signedIn}
					<form
						class="space-y-2"
						onsubmit={(e) => {
							e.preventDefault();
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
						<Button type="submit" variant="destructive" class="w-full" data-testid="disable-lock"
							>Disable lock</Button
						>
					</form>
				{:else}
					<p class="text-muted-foreground text-sm">
						While signed in, the account passphrase stays on. You can change it from unlock after a
						reload, not remove it.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>

<Dialog.Root bind:open={resetOpen}>
	<Dialog.Content class="sm:max-w-md" data-testid="reset-dialog">
		<Dialog.Header>
			<Dialog.Title>Reset everything?</Dialog.Title>
			<Dialog.Description>
				This permanently deletes transactions, goals, and related local data. Export a backup first if
				you might need the data. Cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-3 py-2">
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					class="size-5 accent-primary md:size-4"
					bind:checked={preserveCategories}
					data-testid="reset-preserve-categories"
				/>
				Keep categories
			</label>
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					class="size-5 accent-primary md:size-4"
					bind:checked={preservePassphrase}
					data-testid="reset-preserve-passphrase"
				/>
				Keep passphrase lock
			</label>
		</div>
		<div class="flex justify-end gap-2">
			<Button type="button" variant="outline" onclick={() => (resetOpen = false)}>Cancel</Button>
			<Button
				type="button"
				variant="destructive"
				data-testid="reset-all-confirm"
				onclick={() =>
					void wrap(async () => {
						await onResetLocalData({ preserveCategories, preservePassphrase });
						resetOpen = false;
					})
				}
			>
				Reset
			</Button>
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
	<Dialog.Content class="sm:max-w-md" data-testid="export-backup-dialog">
		<Dialog.Header>
			<Dialog.Title>Export encrypted backup</Dialog.Title>
			<Dialog.Description>
				{#if lockEnabled}
					Enter your device passphrase to wrap this file. The ledger stays unlocked here.
				{:else}
					Set a one-time file passphrase (min 8). This does not turn on device lock.
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
				placeholder={lockEnabled ? 'Device passphrase' : 'File passphrase (min 8)'}
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

<Dialog.Root
	bind:open={importConfirmOpen}
	onOpenChange={(open) => {
		importConfirmOpen = open;
		if (!open) {
			pendingImportFile = null;
			importPass = '';
		}
	}}
>
	<Dialog.Content class="sm:max-w-md" data-testid="import-backup-dialog">
		<Dialog.Header>
			<Dialog.Title>Import backup?</Dialog.Title>
			<Dialog.Description>
				Import replaces all local data with this backup. This cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-3">
			<Input
				type="password"
				placeholder="File passphrase"
				bind:value={importPass}
				autocomplete="off"
				data-testid="import-backup-pass"
			/>
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (importConfirmOpen = false)}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					data-testid="import-backup-confirm"
					onclick={() =>
						void wrap(async () => {
							if (!pendingImportFile) return;
							const file = pendingImportFile;
							pendingImportFile = null;
							await onImportFile(file, importPass);
							importPass = '';
							importConfirmOpen = false;
						})
					}
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
	description="This device’s copy is wiped. There is no signed-in file export. Cloud data stays."
	confirmLabel="Sign out"
	destructive
	dangerChrome
	confirmTestId="cloud-sign-out-confirm"
	onOpenChange={(open) => (signOutOpen = open)}
	onConfirm={async () => {
		if (onSignOut) await wrap(onSignOut);
	}}
/>
