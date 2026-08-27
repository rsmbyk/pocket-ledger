<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	type Props = {
		variant?: 'device' | 'account';
		allowHex?: boolean;
		lockedUntil?: number | null;
		onUnlock: (passphrase: string) => void | Promise<void>;
		onUnlockHex?: (hex: string) => void | Promise<void>;
	};

	let {
		variant = 'device',
		allowHex = false,
		lockedUntil = null,
		onUnlock,
		onUnlockHex
	}: Props = $props();
	let passphrase = $state('');
	let hex = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);
	let now = $state(Date.now());

	const locked = $derived(lockedUntil != null && now < lockedUntil);

	async function submitPass() {
		if (locked) return;
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

	async function submitHex() {
		if (!onUnlockHex) return;
		busy = true;
		error = null;
		try {
			await onUnlockHex(hex);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unlock failed';
		} finally {
			busy = false;
		}
	}
</script>

<div
	class="bg-background flex min-h-svh items-center justify-center px-4"
	data-testid={variant === 'account' ? 'account-unlock-screen' : 'unlock-screen'}
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>
				{variant === 'account' ? 'Unlock your account' : 'Unlock this device'}
			</Card.Title>
			<Card.Description>
				{variant === 'account'
					? 'Enter your account passphrase. This is not the optional device lock.'
					: 'Enter the passphrase that encrypts this browser’s copy of the ledger.'}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if locked}
				<p class="text-destructive text-sm" role="alert" data-testid="lockout-wait">
					Too many guesses. Try again later.
				</p>
			{/if}
			<form
				class="space-y-3"
				onsubmit={(e) => {
					e.preventDefault();
					void submitPass();
				}}
			>
				<div class="space-y-2">
					<Label for="unlock-pass">{variant === 'account' ? 'Account passphrase' : 'Device passphrase'}</Label>
					<Input
						id="unlock-pass"
						type="password"
						autocomplete="current-password"
						bind:value={passphrase}
						data-testid="unlock-passphrase"
						disabled={locked}
						aria-invalid={error ? true : undefined}
						oninput={() => (error = null)}
					/>
					{#if error}
						<p class="text-destructive text-sm" role="alert" data-testid="unlock-field-error-passphrase">
							{error}
						</p>
					{/if}
				</div>
				<Button type="submit" class="w-full" disabled={busy || locked} data-testid="unlock-submit">
					{busy ? 'Checking…' : 'Unlock'}
				</Button>
			</form>
			{#if allowHex && onUnlockHex}
				<form
					class="mt-6 space-y-3"
					data-testid="hex-unlock-form"
					onsubmit={(e) => {
						e.preventDefault();
						void submitHex();
					}}
				>
					<Label for="unlock-hex">Or paste your recovery kit</Label>
					<Input
						id="unlock-hex"
						bind:value={hex}
						data-testid="unlock-hex"
						autocomplete="off"
						spellcheck={false}
					/>
					<Button type="submit" variant="outline" class="w-full" disabled={busy} data-testid="unlock-hex-submit">
						Unlock with kit
					</Button>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
