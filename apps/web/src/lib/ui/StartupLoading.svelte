<script lang="ts">
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
</script>

<div
	class="bg-background text-muted-foreground flex min-h-svh items-center justify-center"
	data-testid="startup-loading"
	role="status"
	aria-label="Loading"
>
	<LoaderCircleIcon class="size-8 animate-spin" aria-hidden="true" />
</div>
