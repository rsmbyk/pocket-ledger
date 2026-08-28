<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	type Props = {
		onSetPassphrase: () => void;
	};

	let { onSetPassphrase }: Props = $props();
	let ack = $state(false);
</script>

<Card.Root class="p-(--card-spacing) border-destructive/40" data-testid="device-skip-warning">
	<Card.Header class="px-0">
		<Card.Title class="text-base">This device is not encrypted</Card.Title>
		<Card.Description>
			Without a passphrase, anyone who can use this browser can read your ledger if the device is
			lost or left unlocked. Set a passphrase to encrypt it on this device.
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-3 px-0">
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" class="size-5 accent-primary md:size-4" bind:checked={ack} data-testid="device-skip-ack" />
			No passphrase: data on this device can be read if access is lost or shared.
		</label>
		<Button type="button" onclick={onSetPassphrase} data-testid="device-skip-set">
			Set a passphrase
		</Button>
	</Card.Content>
</Card.Root>
