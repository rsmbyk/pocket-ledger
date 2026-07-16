<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { CategoryRow } from '$lib/data/db';
	import { isVoided, type LedgerTransaction } from '$lib/domain/transaction';
	import {
		addTransaction,
		getCategoriesForType,
		updateTransaction,
		voidTransaction
	} from '$lib/application/transactions';
	import {
		todayOccurredOn,
		type AddableTransactionType
	} from '$lib/domain/transaction-rules';

	type Props = {
		open: boolean;
		accountId: string;
		currencyLabel: string;
		editing?: LedgerTransaction | null;
		onOpenChange: (open: boolean) => void;
		onSaved: () => void | Promise<void>;
	};

	let { open, accountId, currencyLabel, editing = null, onOpenChange, onSaved }: Props = $props();

	/** Matches Tailwind `md` — desktop shell uses a centered dialog. */
	const desktop = new MediaQuery('min-width: 768px');

	let type = $state<AddableTransactionType>('expense');
	let amountRaw = $state('');
	let categoryId = $state('');
	let note = $state('');
	let occurredOn = $state(todayOccurredOn());
	let categories = $state<CategoryRow[]>([]);
	let error = $state<string | null>(null);
	let saving = $state(false);
	let seeded = $state(false);

	const isEdit = $derived(Boolean(editing));
	const isVoidedView = $derived(Boolean(editing && isVoided(editing)));
	const sheetTitle = $derived(
		isVoidedView ? 'Voided transaction' : isEdit ? 'Edit transaction' : 'Add transaction'
	);
	const sheetDescription = $derived(
		isVoidedView
			? 'This transaction was voided and cannot be edited.'
			: isEdit
				? 'Update or void this entry.'
				: `Quick add for ${currencyLabel} on this account.`
	);

	$effect(() => {
		void open;
		void editing;
		void (async () => {
			error = null;
			if (editing) {
				type = editing.type === 'income' ? 'income' : 'expense';
				amountRaw = String(editing.amountMinor);
				note = editing.note;
				occurredOn = editing.occurredOn;
				categories = await getCategoriesForType(type);
				categoryId = editing.categoryId ?? categories[0]?.id ?? '';
			} else if (!seeded) {
				type = 'expense';
				amountRaw = '';
				note = '';
				occurredOn = todayOccurredOn();
				categories = await getCategoriesForType('expense');
				categoryId = categories[0]?.id ?? '';
				seeded = true;
			}
		})();
	});

	async function onTypeChange(next: AddableTransactionType) {
		if (isVoidedView) return;
		type = next;
		error = null;
		categories = await getCategoriesForType(next);
		categoryId = categories[0]?.id ?? '';
	}

	async function save() {
		if (isVoidedView) return;
		saving = true;
		error = null;
		try {
			if (editing) {
				await updateTransaction({
					id: editing.id,
					accountId,
					type,
					amountRaw,
					categoryId,
					note,
					occurredOn
				});
			} else {
				await addTransaction({
					accountId,
					type,
					amountRaw,
					categoryId,
					note,
					occurredOn
				});
			}
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not save transaction';
		} finally {
			saving = false;
		}
	}

	async function onVoid() {
		if (!editing || isVoidedView) return;
		if (!confirm('Void this transaction permanently? This cannot be undone.')) return;
		saving = true;
		error = null;
		try {
			await voidTransaction(editing.id);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not void transaction';
		} finally {
			saving = false;
		}
	}
</script>

{#snippet txForm()}
	<form
		class="flex flex-col gap-4 overflow-y-auto px-4 py-4"
		onsubmit={(e) => {
			e.preventDefault();
			void save();
		}}
	>
		<div class="grid grid-cols-2 gap-2">
			<Button
				type="button"
				variant={type === 'expense' ? 'default' : 'outline'}
				disabled={isVoidedView || saving}
				onclick={() => void onTypeChange('expense')}
			>
				Expense
			</Button>
			<Button
				type="button"
				variant={type === 'income' ? 'default' : 'outline'}
				disabled={isVoidedView || saving}
				onclick={() => void onTypeChange('income')}
			>
				Income
			</Button>
		</div>

		<div class="space-y-2">
			<Label for="amount">Amount ({currencyLabel})</Label>
			<Input
				id="amount"
				name="amount"
				inputmode="numeric"
				autocomplete="off"
				placeholder="15000"
				bind:value={amountRaw}
				disabled={isVoidedView || saving}
				aria-invalid={error ? true : undefined}
			/>
		</div>

		<div class="space-y-2">
			<Label for="category">Category</Label>
			<select
				id="category"
				class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={categoryId}
				disabled={isVoidedView || saving}
			>
				{#each categories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-2">
			<Label for="occurredOn">Date</Label>
			<Input
				id="occurredOn"
				name="occurredOn"
				type="date"
				bind:value={occurredOn}
				disabled={isVoidedView || saving}
			/>
		</div>

		<div class="space-y-2">
			<Label for="note">Note</Label>
			<Input
				id="note"
				name="note"
				placeholder="Optional"
				bind:value={note}
				disabled={isVoidedView || saving}
			/>
		</div>

		{#if error}
			<p class="text-destructive text-sm" role="alert">{error}</p>
		{/if}

		{#if !isVoidedView}
			<div class="flex flex-col gap-2 pt-2">
				<Button type="submit" class="w-full" disabled={saving} data-testid="tx-save">
					{saving ? 'Saving…' : 'Save'}
				</Button>
				{#if isEdit}
					<Button
						type="button"
						variant="destructive"
						class="w-full"
						disabled={saving}
						data-testid="tx-void"
						onclick={() => void onVoid()}
					>
						Void
					</Button>
				{/if}
			</div>
		{/if}
	</form>
{/snippet}

{#if desktop.current}
	<Dialog.Root {open} onOpenChange={onOpenChange}>
		<Dialog.Content class="gap-0 p-0" data-testid="tx-dialog">
			<Dialog.Header class="border-border border-b px-4 py-3 text-left">
				<Dialog.Title>{sheetTitle}</Dialog.Title>
				<Dialog.Description>{sheetDescription}</Dialog.Description>
			</Dialog.Header>
			{@render txForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Sheet.Root {open} onOpenChange={onOpenChange}>
		<Sheet.Content
			side="bottom"
			class="mx-auto max-h-[90svh] w-full max-w-lg gap-0 rounded-t-2xl p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
			data-testid="tx-sheet"
		>
			<Sheet.Header class="border-border border-b px-4 py-3 text-left">
				<Sheet.Title>{sheetTitle}</Sheet.Title>
				<Sheet.Description>{sheetDescription}</Sheet.Description>
			</Sheet.Header>
			{@render txForm()}
		</Sheet.Content>
	</Sheet.Root>
{/if}
