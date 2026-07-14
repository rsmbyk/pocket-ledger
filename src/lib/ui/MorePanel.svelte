<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { RecurringRule } from '$lib/domain/recurring';
	import type { Goal } from '$lib/domain/goals';
	import type { NetWorthSnapshot } from '$lib/domain/net-worth';
	import type { CategoryRow } from '$lib/data/db';
	import { goalProgressPercent } from '$lib/domain/goals';
	import { formatMinor } from '$lib/domain/money';
	import type { AddableTransactionType } from '$lib/domain/transaction-rules';
	import type { RecurringFrequency } from '$lib/domain/recurring';

	type Props = {
		currencyLabel: string;
		recurringRules: RecurringRule[];
		goals: Goal[];
		snapshots: NetWorthSnapshot[];
		expenseCategories: CategoryRow[];
		incomeCategories: CategoryRow[];
		lockEnabled: boolean;
		onExport: () => void | Promise<void>;
		onImportFile: (file: File) => void | Promise<void>;
		onCreateRecurring: (input: {
			type: AddableTransactionType;
			amountRaw: string;
			categoryId: string;
			frequency: RecurringFrequency;
			note: string;
		}) => void | Promise<void>;
		onToggleRecurring: (id: string, active: boolean) => void | Promise<void>;
		onDeleteRecurring: (id: string) => void | Promise<void>;
		onCreateGoal: (name: string, targetRaw: string) => void | Promise<void>;
		onUpdateGoalSaved: (id: string, savedRaw: string) => void | Promise<void>;
		onDeleteGoal: (id: string) => void | Promise<void>;
		onCaptureNetWorth: () => void | Promise<void>;
		onEnableLock: (passphrase: string) => void | Promise<void>;
		onDisableLock: (passphrase: string) => void | Promise<void>;
	};

	let {
		currencyLabel,
		recurringRules,
		goals,
		snapshots,
		expenseCategories,
		incomeCategories,
		lockEnabled,
		onExport,
		onImportFile,
		onCreateRecurring,
		onToggleRecurring,
		onDeleteRecurring,
		onCreateGoal,
		onUpdateGoalSaved,
		onDeleteGoal,
		onCaptureNetWorth,
		onEnableLock,
		onDisableLock
	}: Props = $props();

	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	let recType = $state<AddableTransactionType>('expense');
	let recAmount = $state('');
	let recCategoryId = $state('');
	let recFrequency = $state<RecurringFrequency>('monthly');
	let recNote = $state('');

	let goalName = $state('');
	let goalTarget = $state('');

	let lockPass = $state('');
	let lockPassConfirm = $state('');

	const recCategories = $derived(recType === 'expense' ? expenseCategories : incomeCategories);

	$effect(() => {
		if (!recCategories.some((c) => c.id === recCategoryId)) {
			recCategoryId = recCategories[0]?.id ?? '';
		}
	});

	const maxSnap = $derived(Math.max(...snapshots.map((s) => Math.abs(s.totalMinor)), 1));

	async function wrap(action: () => void | Promise<void>, ok: string) {
		error = null;
		message = null;
		try {
			await action();
			message = ok;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		}
	}
</script>

<div class="space-y-4" data-testid="more-panel">
	{#if message}
		<p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">{message}</p>
	{/if}
	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Backup</Card.Title>
			<Card.Description>Export or replace all local data.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			<Button
				type="button"
				onclick={() => void wrap(onExport, 'Backup downloaded')}
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
						if (
							!confirm(
								'Import replaces all local data with the backup. Continue?'
							)
						) {
							e.currentTarget.value = '';
							return;
						}
						void wrap(() => onImportFile(file), 'Backup imported');
						e.currentTarget.value = '';
					}}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Recurring</Card.Title>
			<Card.Description>Templates that spawn transactions when due.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<form
				class="space-y-2"
				onsubmit={(e) => {
					e.preventDefault();
					void wrap(
						() =>
							onCreateRecurring({
								type: recType,
								amountRaw: recAmount,
								categoryId: recCategoryId,
								frequency: recFrequency,
								note: recNote
							}),
						'Recurring rule added'
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
									void wrap(
										() => onToggleRecurring(rule.id, !rule.active),
										rule.active ? 'Paused' : 'Resumed'
									)}
							>
								{rule.active ? 'Pause' : 'Resume'}
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onclick={() => void wrap(() => onDeleteRecurring(rule.id), 'Deleted')}
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

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Goals</Card.Title>
			<Card.Description>Savings targets and progress.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<form
				class="space-y-2"
				onsubmit={(e) => {
					e.preventDefault();
					void wrap(() => onCreateGoal(goalName, goalTarget), 'Goal created');
					goalName = '';
					goalTarget = '';
				}}
			>
				<Input placeholder="Name" bind:value={goalName} required />
				<Input
					placeholder="Target amount"
					inputmode="numeric"
					bind:value={goalTarget}
					required
				/>
				<Button type="submit" class="w-full">Add goal</Button>
			</form>
			<ul class="space-y-3 text-sm">
				{#each goals as goal (goal.id)}
					<li class="border-border space-y-2 rounded-lg border p-3">
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="font-medium">{goal.name}</p>
								<p class="text-muted-foreground">
									{formatMinor(goal.savedMinor, currencyLabel)} /
									{formatMinor(goal.targetMinor, currencyLabel)} · {goalProgressPercent(goal)}%
								</p>
							</div>
							<Button
								size="sm"
								variant="ghost"
								onclick={() => void wrap(() => onDeleteGoal(goal.id), 'Goal deleted')}
								>Delete</Button
							>
						</div>
						<div class="bg-muted h-2 overflow-hidden rounded-full">
							<div
								class="bg-primary h-full rounded-full"
								style={`width: ${goalProgressPercent(goal)}%`}
							></div>
						</div>
						<form
							class="flex gap-2"
							onsubmit={(e) => {
								e.preventDefault();
								const fd = new FormData(e.currentTarget);
								const saved = String(fd.get('saved') ?? '0');
								void wrap(() => onUpdateGoalSaved(goal.id, saved), 'Progress updated');
							}}
						>
							<Input name="saved" inputmode="numeric" value={String(goal.savedMinor)} />
							<Button type="submit" size="sm">Set saved</Button>
						</form>
					</li>
				{:else}
					<li class="text-muted-foreground">No goals yet.</li>
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Net worth</Card.Title>
			<Card.Description>Manual snapshots of your total balance.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			<Button
				type="button"
				class="w-full"
				data-testid="capture-net-worth"
				onclick={() => void wrap(onCaptureNetWorth, 'Snapshot saved')}
			>
				Capture now
			</Button>
			{#if snapshots.length > 0}
				<div class="flex h-16 items-end gap-1" data-testid="net-worth-chart" aria-label="Net worth history">
					{#each [...snapshots].reverse() as snap (snap.id)}
						<div
							class="bg-primary/80 min-w-2 flex-1 rounded-t"
							style={`height: ${Math.max(8, (Math.abs(snap.totalMinor) / maxSnap) * 100)}%`}
							title={`${snap.capturedOn}: ${formatMinor(snap.totalMinor, currencyLabel)}`}
						></div>
					{/each}
				</div>
				<ul class="text-muted-foreground space-y-1 text-xs" data-testid="net-worth-list">
					{#each snapshots.slice(0, 5) as snap (snap.id)}
						<li class="flex justify-between gap-2">
							<span>{snap.capturedOn}</span>
							<span>{formatMinor(snap.totalMinor, currencyLabel)}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-muted-foreground text-sm">No snapshots yet.</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Privacy</Card.Title>
			<Card.Description>
				Optional passphrase lock (off by default). When on, notes and names are encrypted at rest
				in this browser. Forgotten passphrases cannot be recovered.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-2">
			<p class="text-sm" data-testid="lock-status">
				Lock is <strong>{lockEnabled ? 'on' : 'off'}</strong>
			</p>
			{#if !lockEnabled}
				<form
					class="space-y-2"
					onsubmit={(e) => {
						e.preventDefault();
						if (lockPass !== lockPassConfirm) {
							error = 'Passphrases do not match';
							return;
						}
						void wrap(async () => {
							await onEnableLock(lockPass);
							lockPass = '';
							lockPassConfirm = '';
						}, 'Lock enabled');
					}}
				>
					<Input
						type="password"
						placeholder="New passphrase (min 8)"
						bind:value={lockPass}
						autocomplete="new-password"
						data-testid="enable-lock-pass"
					/>
					<Input
						type="password"
						placeholder="Confirm passphrase"
						bind:value={lockPassConfirm}
						autocomplete="new-password"
					/>
					<Button type="submit" class="w-full" data-testid="enable-lock">Enable lock</Button>
				</form>
			{:else}
				<form
					class="space-y-2"
					onsubmit={(e) => {
						e.preventDefault();
						void wrap(async () => {
							await onDisableLock(lockPass);
							lockPass = '';
						}, 'Lock disabled');
					}}
				>
					<Input
						type="password"
						placeholder="Current passphrase"
						bind:value={lockPass}
						autocomplete="current-password"
						data-testid="disable-lock-pass"
					/>
					<Button type="submit" variant="outline" class="w-full" data-testid="disable-lock"
						>Disable lock</Button
					>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
