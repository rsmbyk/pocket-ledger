<script lang="ts">
	import { categoryIconForSlug } from '$lib/ui/category-icons';
	import { cn } from '$lib/utils.js';

	type Props = {
		slug: string;
		class?: string;
	};

	let { slug, class: className = '' }: Props = $props();

	const Icon = $derived(categoryIconForSlug(slug));
</script>

<Icon class={cn('size-4 shrink-0', className)} aria-hidden="true" />
