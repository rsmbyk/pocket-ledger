<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatLockoutRemaining } from '$lib/application/lockout-wait';
	import { focusFirstTextField } from '$lib/ui/focus-first-text-field.js';

	type Props = {
		variant?: 'device' | 'account';
		lockedUntil?: number | null;
		showRecovery?: boolean;
		onUnlock: (passphrase: string) => void | Promise<void>;
		onOpenRecovery?: () => void;
	};

	let {
		variant = 'device',
		lockedUntil = null,
		showRecovery = false,
		onUnlock,
		onOpenRecovery
	}: Props = $props();
	let error = $state<string | null>(null);
	let busy = $state(false);
	let now = $state(Date.now());
	let screenEl = $state<HTMLDivElement | null>(null);

	const locked = $derived(lockedUntil != null && now < lockedUntil);
	const remainingLabel = $derived(
		lockedUntil != null ? formatLockoutRemaining(lockedUntil - now) : '0:00'
	);

	// Spec 254: Enter must work without a click — focus the passphrase field
	// when the form becomes visible (mount, and after a lockout expires).
	$effect(() => {
		if (locked || !screenEl) return;
		// Never steal focus from something already inside the screen (e.g. the
		// recovery button); only grab it when it is outside (body after render).
		if (screenEl.contains(document.activeElement)) return;
		focusFirstTextField(screenEl);
	});

	$effect(() => {
		if (lockedUntil == null) return;
		now = Date.now();
		const id = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(id);
	});

	async function submitPass(value: string) {
		if (busy || locked || !value) return;
		busy = true;
		error = null;
		try {
			await onUnlock(value);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unlock failed';
		} finally {
			busy = false;
		}
	}
</script>

<div
	bind:this={screenEl}
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
					? 'Enter your account passphrase.'
					: 'Enter the passphrase that encrypts this browser’s copy of the ledger.'}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if locked}
				<p class="text-destructive text-sm" role="alert" data-testid="lockout-wait">
					Too many guesses. Try again in {remainingLabel}.
				</p>
			{:else}
				<form
					class="space-y-3"
					onsubmit={(e) => {
						e.preventDefault();
						// Spec 254: read the DOM value — password managers can fill the
						// field without firing `input`, so bound state may lag behind.
						const value = new FormData(e.currentTarget).get('pass') ?? '';
						void submitPass(String(value));
					}}
				>
					<div class="space-y-2">
						<Label for="unlock-pass"
							>{variant === 'account' ? 'Account passphrase' : 'Device passphrase'}</Label
						>
						<Input
							id="unlock-pass"
							name="pass"
							type="password"
							autocomplete="current-password"
							data-testid="unlock-passphrase"
							aria-invalid={error ? true : undefined}
							oninput={() => (error = null)}
						/>
						{#if error}
							<p
								class="text-destructive text-sm"
								role="alert"
								data-testid="unlock-field-error-passphrase"
							>
								{error}
							</p>
						{/if}
					</div>
					<Button type="submit" class="w-full" disabled={busy} data-testid="unlock-submit">
						{busy ? 'Checking…' : 'Unlock'}
					</Button>
				</form>
			{/if}
			{#if showRecovery && onOpenRecovery}
				<Button
					type="button"
					variant="outline"
					class="mt-4 w-full"
					data-testid="account-recovery-open"
					onclick={onOpenRecovery}
				>
					Reset with recovery kit
				</Button>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
