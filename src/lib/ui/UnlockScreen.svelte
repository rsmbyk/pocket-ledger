<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	type Props = {
		onUnlock: (passphrase: string) => void | Promise<void>;
	};

	let { onUnlock }: Props = $props();
	let passphrase = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);

	async function submit() {
		busy = true;
		error = null;
		try {
			await onUnlock(passphrase);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unlock failed';
		} finally {
			busy = false;
		}
	}
</script>

<div class="bg-background flex min-h-svh items-center justify-center px-4" data-testid="unlock-screen">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Unlock Pocket Ledger</Card.Title>
			<Card.Description>Enter your passphrase to open the ledger.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				class="space-y-3"
				onsubmit={(e) => {
					e.preventDefault();
					void submit();
				}}
			>
				<div class="space-y-2">
					<Label for="unlock-pass">Passphrase</Label>
					<Input
						id="unlock-pass"
						type="password"
						autocomplete="current-password"
						bind:value={passphrase}
						data-testid="unlock-passphrase"
					/>
				</div>
				{#if error}
					<p class="text-destructive text-sm" role="alert">{error}</p>
				{/if}
				<Button type="submit" class="w-full" disabled={busy} data-testid="unlock-submit">
					{busy ? 'Checking…' : 'Unlock'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
