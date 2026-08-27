<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import App from '../App.svelte';

	onMount(() => {
		if ('serviceWorker' in navigator) {
			void navigator.serviceWorker.register('/sw.js');
		}
	});
</script>

<App />
