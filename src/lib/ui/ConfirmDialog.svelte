<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	type Props = {
		open: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		/** Destructive styling on the confirm action. */
		destructive?: boolean;
		confirmTestId?: string;
		onOpenChange: (open: boolean) => void;
		onConfirm: () => void | Promise<void>;
	};

	let {
		open,
		title,
		description,
		confirmLabel = 'Continue',
		cancelLabel = 'Cancel',
		destructive = false,
		confirmTestId = 'confirm-dialog-confirm',
		onOpenChange,
		onConfirm
	}: Props = $props();

	let busy = $state(false);

	async function confirm() {
		busy = true;
		try {
			await onConfirm();
			onOpenChange(false);
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={onOpenChange}>
	<Dialog.Content class="sm:max-w-md" data-testid="confirm-dialog" showCloseButton={false}>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 sm:justify-end">
			<Button
				type="button"
				variant="outline"
				disabled={busy}
				data-testid="confirm-dialog-cancel"
				onclick={() => onOpenChange(false)}
			>
				{cancelLabel}
			</Button>
			<Button
				type="button"
				variant={destructive ? 'destructive' : 'default'}
				disabled={busy}
				data-testid={confirmTestId}
				onclick={() => void confirm()}
			>
				{confirmLabel}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
