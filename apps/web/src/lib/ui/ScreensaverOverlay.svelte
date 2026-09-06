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

<!-- Chrome Android dark color-scheme paints a different canvas around native button labels. -->
<button
	type="button"
	class="fixed inset-0 z-80 flex appearance-none flex-col items-center justify-center gap-3 border-0 bg-black/90 p-0 text-white shadow-none scheme-light [-webkit-tap-highlight-color:transparent]"
	data-testid="screensaver"
	onclick={() => void onContinue()}
>
	<span class="bg-transparent text-4xl" aria-hidden="true">◆</span>
	<span class="bg-transparent text-sm tracking-wide">{label}</span>
</button>
