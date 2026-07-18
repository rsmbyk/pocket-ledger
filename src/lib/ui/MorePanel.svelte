<script lang="ts">
	import HardDriveIcon from '@lucide/svelte/icons/hard-drive';
	import RepeatIcon from '@lucide/svelte/icons/repeat';
	import LockIcon from '@lucide/svelte/icons/lock';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { RecurringRule, RecurringFrequency } from '$lib/domain/recurring';
	import type { CategoryRow } from '$lib/data/db';
	import { formatMinor } from '$lib/domain/money';
	import { type AddableTransactionType } from '$lib/domain/transaction-rules';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';

	type Props = {
		currencyLabel: string;
		recurringRules: RecurringRule[];
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		lockEnabled: boolean;
		onExport: () => void | Promise<void>;
		onImportFile: (file: File) => void | Promise<void>;
		onResetLocalData: (options: {
			preserveCategories: boolean;
			preservePassphrase: boolean;
		}) => void | Promise<void>;
		onCreateRecurring: (input: {
			type: AddableTransactionType;
			amountRaw: string;
			categoryId: string;
			frequency: RecurringFrequency;
			note: string;
		}) => void | Promise<void>;
		onToggleRecurring: (id: string, active: boolean) => void | Promise<void>;
		onDeleteRecurring: (id: string) => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
	};

	let {
		currencyLabel,
		recurringRules,
		expenseCategories,
		incomeCategories,
		lockEnabled,
		onExport,
		onImportFile,
		onResetLocalData,
		onCreateRecurring,
		onToggleRecurring,
		onDeleteRecurring,
		onEnableLock,
		onDisableLock
	}: Props = $props();

	let recType = $state<AddableTransactionType>('expense');
	let recAmount = $state('');
	let recCategoryId = $state('');
	let recFrequency = $state<RecurringFrequency>('monthly');
	let recNote = $state('');

	let lockPass = $state('');
	let lockPassConfirm = $state('');
	let lockPassError = $state<string | null>(null);
	let resetOpen = $state(false);
	let preserveCategories = $state(false);
	let preservePassphrase = $state(false);

	let pendingDeleteRecurringId = $state<string | null>(null);
	let importConfirmOpen = $state(false);
	let pendingImportFile = $state<File | null>(null);
	let disableLockConfirmOpen = $state(false);
	let error = $state<string | null>(null);

	const recCategories = $derived(recType === 'expense' ? expenseCategories : incomeCategories);

	$effect(() => {
		if (!recCategories.some((c) => c.id === recCategoryId)) {
			recCategoryId = recCategories[0]?.id ?? '';
		}
	});

	async function wrap(action: () => void | Promise<void>) {
		try {
			error = null;
			await action();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		}
	}

	function requestDeleteRecurring(id: string) {
		pendingDeleteRecurringId = id;
	}
</script>

<div class="space-y-4" data-testid="more-panel">
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}
	<div class="flex flex-col gap-4" data-testid="more-sections">
		<Card.Root class="p-(--card-spacing)" data-testid="more-section-backup">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<HardDriveIcon class="size-5" aria-hidden="true" />
					Backup
				</Card.Title>
				<Card.Description>Export or replace all local data.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2 px-0">
				<Button
					type="button"
					onclick={() => void wrap(onExport)}
					data-testid="export-backup"
				>
					Export JSON
				</Button>
				<div class="space-y-2">
					<Label for="import-file">Import JSON (replaces everything)</Label>
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

		<Card.Root class="p-(--card-spacing)" data-testid="more-section-recurring">
			<Card.Header class="px-0">
				<Card.Title class="flex items-center gap-2 text-base">
					<RepeatIcon class="size-5" aria-hidden="true" />
					Recurring
				</Card.Title>
				<Card.Description>Templates that spawn transactions when due.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4 px-0">
				<form
					class="space-y-2"
					onsubmit={(e) => {
						e.preventDefault();
						void wrap(() =>
							onCreateRecurring({
								type: recType,
								amountRaw: recAmount,
								categoryId: recCategoryId,
								frequency: recFrequency,
								note: recNote
							})
						);
						recAmount = '';
						recNote = '';
					}}
				>
					<div class="grid grid-cols-2 gap-2">
						<Button
							type="button"
							size="sm"
							variant={recType === 'expense' ? 'default' : 'outline'}
							onclick={() => (recType = 'expense')}>Expense</Button
						>
						<Button
							type="button"
							size="sm"
							variant={recType === 'income' ? 'default' : 'outline'}
							onclick={() => (recType = 'income')}>Income</Button
						>
					</div>
					<Input placeholder="Amount" inputmode="numeric" bind:value={recAmount} required />
					<select
						class="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
						bind:value={recCategoryId}
					>
						{#each recCategories as c (c.id)}
							<option value={c.id}>{c.name}</option>
						{/each}
					</select>
					<select
						class="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
						bind:value={recFrequency}
					>
						<option value="monthly">Monthly</option>
						<option value="weekly">Weekly</option>
					</select>
					<Input placeholder="Note (optional)" bind:value={recNote} />
					<Button type="submit" class="w-full">Add rule</Button>
				</form>

				<ul class="divide-border divide-y text-sm" data-testid="recurring-list">
					{#each recurringRules as rule (rule.id)}
						<li class="flex items-start justify-between gap-2 py-2">
							<div class="min-w-0">
								<p class="font-medium">
									{rule.type} · {formatMinor(rule.amountMinor, currencyLabel)}
								</p>
								<p class="text-muted-foreground truncate">
									{rule.frequency} · next {rule.nextOccurredOn}
									{rule.active ? '' : ' · paused'}
								</p>
							</div>
							<div class="flex shrink-0 gap-1">
								<Button
									size="sm"
									variant="outline"
									onclick={() =>
										void wrap(() => onToggleRecurring(rule.id, !rule.active))}
								>
									{rule.active ? 'Pause' : 'Resume'}
								</Button>
								<Button
									size="sm"
									variant="destructive"
									onclick={() => requestDeleteRecurring(rule.id)}
								>
									Delete
								</Button>
							</div>
						</li>
					{:else}
						<li class="text-muted-foreground py-2">No recurring rules yet.</li>
					{/each}
				</ul>
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
				<p class="text-sm" data-testid="lock-status">
					Lock is <strong>{lockEnabled ? 'on' : 'off'}</strong>
				</p>
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
				{:else}
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
				This permanently deletes transactions, recurring rules, goals, and related local data.
				Export a backup first if you might need the data. Cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-3 py-2">
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					bind:checked={preserveCategories}
					data-testid="reset-preserve-categories"
				/>
				Keep categories
			</label>
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
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

<ConfirmDialog
	open={pendingDeleteRecurringId !== null}
	title="Delete recurring rule?"
	description="Delete this recurring rule permanently? This cannot be undone."
	confirmLabel="Delete"
	destructive
	dangerChrome
	confirmTestId="recurring-delete-confirm"
	onOpenChange={(open) => {
		if (!open) pendingDeleteRecurringId = null;
	}}
	onConfirm={async () => {
		if (!pendingDeleteRecurringId) return;
		const id = pendingDeleteRecurringId;
		pendingDeleteRecurringId = null;
		await wrap(() => onDeleteRecurring(id));
	}}
/>

<ConfirmDialog
	open={importConfirmOpen}
	title="Import backup?"
	description="Import replaces all local data with this backup. This cannot be undone."
	confirmLabel="Import"
	destructive
	dangerChrome
	confirmTestId="import-backup-confirm"
	onOpenChange={(open) => {
		importConfirmOpen = open;
		if (!open) pendingImportFile = null;
	}}
	onConfirm={async () => {
		if (!pendingImportFile) return;
		const file = pendingImportFile;
		pendingImportFile = null;
		await wrap(() => onImportFile(file));
	}}
/>

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
