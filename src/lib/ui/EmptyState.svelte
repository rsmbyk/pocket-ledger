<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		icon: Snippet;
		title: string;
		description: string;
		testid: string;
		class?: string;
	};

	let { icon, title, description, testid, class: className = '' }: Props = $props();
</script>

<div
	class="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-8 text-center {className}"
	data-testid={testid}
>
	<div class="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
		{@render icon()}
	</div>
	<div class="space-y-1">
		<p class="text-foreground text-sm font-medium">{title}</p>
		<p class="text-sm">{description}</p>
	</div>
</div>
