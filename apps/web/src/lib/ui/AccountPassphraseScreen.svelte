<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import NewPassphraseFields from '$lib/ui/NewPassphraseFields.svelte';
	import { newPassphraseLiveState } from '$lib/application/new-passphrase-fields';

	type Props = {
		title?: string;
		onSubmit: (passphrase: string) => void | Promise<void>;
	};

	let { title = 'Set your account passphrase', onSubmit }: Props = $props();
	let pass = $state('');
	let confirm = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);
	const canSubmit = $derived(newPassphraseLiveState(pass, confirm).canSubmit);
</script>

<div
	class="bg-background flex min-h-svh items-center justify-center px-4"
	data-testid="account-passphrase-screen"
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>{title}</Card.Title>
			<Card.Description>
				Required for the cloud copy. Pocket Ledger never sends this passphrase to the server.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				class="space-y-3"
				onsubmit={(e) => {
					e.preventDefault();
					if (!canSubmit || busy) return;
					busy = true;
					error = null;
					void (async () => {
						try {
							await onSubmit(pass);
						} catch (err) {
							error = err instanceof Error ? err.message : 'Could not save passphrase';
						} finally {
							busy = false;
						}
					})();
				}}
			>
				<NewPassphraseFields
					bind:passphrase={pass}
					bind:confirm
					passphrasePlaceholder="Account passphrase (min 8)"
					passphraseTestId="account-pass"
					confirmTestId="account-pass-confirm"
					requirementsTestId="account-pass-requirements"
					onInput={() => (error = null)}
				/>
				{#if error}
					<p class="text-destructive text-sm" role="alert">{error}</p>
				{/if}
				<Button
					type="submit"
					class="w-full"
					disabled={!canSubmit || busy}
					data-testid="account-pass-submit"
				>
					Continue
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
