<script lang="ts">
	import { onMount } from 'svelte';
	import HomeIcon from '@lucide/svelte/icons/house';
	import ListIcon from '@lucide/svelte/icons/list';
	import TagsIcon from '@lucide/svelte/icons/tags';
	import MoreHorizontalIcon from '@lucide/svelte/icons/ellipsis';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import * as Command from '$lib/components/ui/command/index.js';
	import type { AppRoute } from '$lib/shared/router';

	type Props = {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onNavigate: (route: AppRoute) => void;
		onAdd: () => void;
	};

	let { open = $bindable(false), onOpenChange, onNavigate, onAdd }: Props = $props();

	function run(action: () => void) {
		action();
		onOpenChange(false);
	}

	onMount(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				onOpenChange(!open);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<Command.Dialog
	bind:open
	onOpenChange={onOpenChange}
	title="Command palette"
	description="Jump to a page or add a transaction"
	data-testid="command-palette"
>
	<Command.Input placeholder="Type a command…" data-testid="command-input" />
	<Command.List>
		<Command.Empty>No results.</Command.Empty>
		<Command.Group heading="Navigate">
			<Command.Item onSelect={() => run(() => onNavigate('home'))} data-testid="cmd-home">
				<HomeIcon />
				Home
			</Command.Item>
			<Command.Item onSelect={() => run(() => onNavigate('activity'))} data-testid="cmd-activity">
				<ListIcon />
				Activity
			</Command.Item>
			<Command.Item
				onSelect={() => run(() => onNavigate('categories'))}
				data-testid="cmd-categories"
			>
				<TagsIcon />
				Categories
			</Command.Item>
			<Command.Item onSelect={() => run(() => onNavigate('more'))} data-testid="cmd-more">
				<MoreHorizontalIcon />
				More
			</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Actions">
			<Command.Item onSelect={() => run(onAdd)} data-testid="cmd-add">
				<PlusIcon />
				Add transaction
				<Command.Shortcut>A</Command.Shortcut>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
