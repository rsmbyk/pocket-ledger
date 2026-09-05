<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { kitDownloadBlob, type RecoveryKit } from '$lib/application/hex-kit';

	type Props = {
		kit: RecoveryKit;
		onConfirm: () => void | Promise<void>;
	};

	let { kit, onConfirm }: Props = $props();
	let stored = $state(false);
	let copied = $state(false);
	let downloaded = $state(false);
	let error = $state<string | null>(null);
	let busy = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(kit.grouped);
		copied = true;
	}

	function download() {
		const blob = kitDownloadBlob(kit.grouped);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'pocket-ledger-recovery-kit.txt';
		a.click();
		URL.revokeObjectURL(url);
		downloaded = true;
	}
</script>

<div
	class="bg-background flex min-h-svh items-center justify-center px-4"
	data-testid="hex-kit-screen"
>
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>Save your recovery kit</Card.Title>
			<Card.Description>
				Copy or download this kit. If you forget the account passphrase, this is the only way back
				in.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			<p class="bg-muted rounded-md p-3 font-mono text-sm break-all" data-testid="hex-kit-value">
				{kit.grouped}
			</p>
			<div class="flex gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => void copy()}
					data-testid="hex-kit-copy"
				>
					{copied ? 'Copied' : 'Copy'}
				</Button>
				<Button type="button" variant="outline" onclick={download} data-testid="hex-kit-download">
					{downloaded ? 'Downloaded' : 'Download'}
				</Button>
			</div>
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					class="size-5 accent-primary md:size-4"
					bind:checked={stored}
					disabled={(!copied && !downloaded) || busy}
					data-testid="hex-kit-stored"
				/>
				I stored this kit somewhere I can find it
			</label>
			{#if error}
				<p class="text-destructive text-sm" role="alert">{error}</p>
			{/if}
			<Button
				type="button"
				class="w-full"
				disabled={!stored || busy}
				data-testid="hex-kit-confirm"
				onclick={() => {
					busy = true;
					error = null;
					void (async () => {
						try {
							await onConfirm();
						} catch (err) {
							error = err instanceof Error ? err.message : 'Could not finish setup';
						} finally {
							busy = false;
						}
					})();
				}}
			>
				Continue
			</Button>
		</Card.Content>
	</Card.Root>
</div>
