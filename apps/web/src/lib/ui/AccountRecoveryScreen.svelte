<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	type Props = {
		onRecover: (hex: string) => void | Promise<void>;
		onBack?: () => void;
	};

	let { onRecover, onBack }: Props = $props();
	let hex = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);

	async function submit() {
		busy = true;
		error = null;
		try {
			await onRecover(hex);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Recovery failed';
		} finally {
			busy = false;
		}
	}
</script>

<div
	class="bg-background flex min-h-svh items-center justify-center px-4"
	data-testid="account-recovery-screen"
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Reset with recovery kit</Card.Title>
			<Card.Description>
				Paste the kit you saved when you created this account. You will set a new passphrase next.
			</Card.Description>
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
					<Label for="recovery-hex">Recovery kit</Label>
					<Input
						id="recovery-hex"
						bind:value={hex}
						data-testid="recovery-hex"
						autocomplete="off"
						spellcheck={false}
						aria-invalid={error ? true : undefined}
						oninput={() => (error = null)}
					/>
					{#if error}
						<p class="text-destructive text-sm" role="alert">{error}</p>
					{/if}
				</div>
				<Button type="submit" class="w-full" disabled={busy || !hex.trim()} data-testid="recovery-submit">
					{busy ? 'Checking…' : 'Continue'}
				</Button>
			</form>
			{#if onBack}
				<Button
					type="button"
					variant="outline"
					class="mt-4 w-full"
					data-testid="recovery-back"
					onclick={onBack}
				>
					Back
				</Button>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
