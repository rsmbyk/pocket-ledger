<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	type Props = {
		open: boolean;
		onCancel: () => void;
		onConsent: () => void | Promise<void>;
	};

	let { open, onCancel, onConsent }: Props = $props();
	let busy = $state(false);
</script>

<Dialog.Root
	{open}
	onOpenChange={(next) => {
		if (!next) onCancel();
	}}
>
	<Dialog.Content class="sm:max-w-md" data-testid="local-conflict-dialog">
		<Dialog.Header>
			<Dialog.Title>This Google account already has a ledger</Dialog.Title>
			<Dialog.Description>
				Signing in discards local data on this device. Export a backup first if you need it. Cloud
				history is not overwritten.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-2">
			<Button
				type="button"
				variant="outline"
				onclick={onCancel}
				data-testid="local-conflict-cancel"
			>
				Cancel
			</Button>
			<Button
				type="button"
				variant="destructive"
				data-testid="local-conflict-consent"
				disabled={busy}
				onclick={() => {
					busy = true;
					void (async () => {
						try {
							await onConsent();
						} finally {
							busy = false;
						}
					})();
				}}
			>
				Discard local and continue
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
