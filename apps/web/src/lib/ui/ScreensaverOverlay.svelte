<script lang="ts">
	import { screensaverPrompt } from '$lib/application/idle';

	type Props = {
		signedIn: boolean;
		lockEnabled: boolean;
		onContinue: () => void | Promise<void>;
	};

	let { signedIn, lockEnabled, onContinue }: Props = $props();
	const label = $derived(screensaverPrompt({ signedIn, lockEnabled }));
</script>

<button
	type="button"
	class="fixed inset-0 z-80 flex flex-col items-center justify-center gap-3 bg-black/90 text-white"
	data-testid="screensaver"
	onclick={() => void onContinue()}
>
	<span class="text-4xl" aria-hidden="true">◆</span>
	<span class="text-sm tracking-wide">{label}</span>
</button>
