<script lang="ts">
	import { setContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	type Props = {
		value: string | number | null;
		name: string;
	};

	let { value = $bindable(), name }: Props = $props();

	// Bagikan state 'value' dan 'name' ke semua komponen anak melalui context
	setContext('radioGroup', {
		value: $derived(value),
		name: $derived(name),
		updateValue: (newValue: string | number | null) => {
			value = newValue;
		}
	});
</script>

<div role="radiogroup" {...$$restProps}>
	<slot />
</div>