<script lang="ts">
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { cn } from '$lib/utils.js';

	type Props = {
		open: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		/** Destructive styling + danger header chrome. */
		destructive?: boolean;
		/** Hide Cancel; only the confirm/dismiss action is shown. */
		hideCancel?: boolean;
		confirmTestId?: string;
		contentTestId?: string;
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
		hideCancel = false,
		confirmTestId = 'confirm-dialog-confirm',
		contentTestId = 'confirm-dialog',
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
	<Dialog.Content
		class={cn(
			'sm:max-w-md z-[60]',
			destructive && 'gap-0 overflow-hidden p-0'
		)}
		overlayClass="z-[60]"
		data-testid={contentTestId}
		showCloseButton={false}
	>
		{#if destructive}
			<Dialog.Header
				class="gap-1 space-y-0 border-b border-destructive/20 bg-destructive/5 px-6 py-3"
				data-testid="confirm-dialog-danger-header"
			>
				<div class="flex items-center gap-2">
					<TriangleAlertIcon class="text-destructive size-5 shrink-0" aria-hidden="true" />
					<Dialog.Title>{title}</Dialog.Title>
				</div>
			</Dialog.Header>
			<div class="space-y-6 px-6 py-4">
				<Dialog.Description>{description}</Dialog.Description>
				<Dialog.Footer class="gap-2 sm:justify-end">
					{#if !hideCancel}
						<Button
							type="button"
							variant="outline"
							disabled={busy}
							data-testid="confirm-dialog-cancel"
							onclick={() => onOpenChange(false)}
						>
							{cancelLabel}
						</Button>
					{/if}
					<Button
						type="button"
						variant="destructive"
						disabled={busy}
						data-testid={confirmTestId}
						onclick={() => void confirm()}
					>
						{confirmLabel}
					</Button>
				</Dialog.Footer>
			</div>
		{:else}
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Description>{description}</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="gap-2 sm:justify-end">
				{#if !hideCancel}
					<Button
						type="button"
						variant="outline"
						disabled={busy}
						data-testid="confirm-dialog-cancel"
						onclick={() => onOpenChange(false)}
					>
						{cancelLabel}
					</Button>
				{/if}
				<Button
					type="button"
					variant="default"
					disabled={busy}
					data-testid={confirmTestId}
					onclick={() => void confirm()}
				>
					{confirmLabel}
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
