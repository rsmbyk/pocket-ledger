<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	type Props = {
		title?: string;
		onSubmit: (passphrase: string) => void | Promise<void>;
	};

	let { title = 'Set your account passphrase', onSubmit }: Props = $props();
	let pass = $state('');
	let confirm = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);
</script>

<div class="bg-background flex min-h-svh items-center justify-center px-4" data-testid="account-passphrase-screen">
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
					if (pass !== confirm) {
						error = 'Passphrases do not match';
						return;
					}
					if (pass.length < 8) {
						error = 'Passphrase must be at least 8 characters';
						return;
					}
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
				<Input
					type="password"
					placeholder="Account passphrase (min 8)"
					bind:value={pass}
					data-testid="account-pass"
					autocomplete="new-password"
					oninput={() => (error = null)}
				/>
				<Input
					type="password"
					placeholder="Confirm passphrase"
					bind:value={confirm}
					data-testid="account-pass-confirm"
					autocomplete="new-password"
					oninput={() => (error = null)}
				/>
				{#if error}
					<p class="text-destructive text-sm" role="alert">{error}</p>
				{/if}
				<Button type="submit" class="w-full" disabled={busy} data-testid="account-pass-submit">
					Continue
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
