<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { Input } from '$lib/components/ui/input/index.js';
	import { newPassphraseLiveState } from '$lib/application/new-passphrase-fields';

	type Props = {
		passphrase: string;
		confirm: string;
		passphrasePlaceholder: string;
		passphraseTestId: string;
		confirmTestId: string;
		requirementsTestId: string;
		confirmPlaceholder?: string;
		mustDifferFrom?: string;
		onInput?: () => void;
	};

	let {
		passphrase = $bindable(),
		confirm = $bindable(),
		passphrasePlaceholder,
		passphraseTestId,
		confirmTestId,
		requirementsTestId,
		confirmPlaceholder = 'Confirm passphrase',
		mustDifferFrom = '',
		onInput
	}: Props = $props();

	const live = $derived(newPassphraseLiveState(passphrase, confirm, mustDifferFrom));
</script>

<div class="flex flex-col gap-2">
	<div class="relative">
		<Input
			type="password"
			placeholder={passphrasePlaceholder}
			bind:value={passphrase}
			autocomplete="new-password"
			class="pr-10"
			data-testid={passphraseTestId}
			oninput={() => onInput?.()}
		/>
		{#if live.showPassIcon}
			{#if live.passLongEnough && live.passDiffersFromOld}
				<CheckIcon
					class="text-income pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
				/>
			{:else}
				<XIcon
					class="text-destructive pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
				/>
			{/if}
		{/if}
	</div>
	{#if live.showRequirements}
		<ul class="space-y-1 text-sm" data-testid={requirementsTestId}>
			<li class={live.passLongEnough ? 'text-income' : 'text-destructive'}>
				At least 8 characters
			</li>
			{#if live.showDifferRule}
				<li class={live.passDiffersFromOld ? 'text-income' : 'text-destructive'}>
					New passphrase must be different
				</li>
			{/if}
		</ul>
	{/if}
	<div class="relative">
		<Input
			type="password"
			placeholder={confirmPlaceholder}
			bind:value={confirm}
			autocomplete="new-password"
			class="pr-10"
			data-testid={confirmTestId}
			oninput={() => onInput?.()}
		/>
		{#if live.showConfirmIcon}
			{#if live.passMatch}
				<CheckIcon
					class="text-income pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
				/>
			{:else}
				<XIcon
					class="text-destructive pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
				/>
			{/if}
		{/if}
	</div>
</div>
