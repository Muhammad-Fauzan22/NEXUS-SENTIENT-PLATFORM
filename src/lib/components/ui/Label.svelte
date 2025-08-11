<script lang="ts">
	import { clsx } from 'clsx';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Props = HTMLLabelAttributes & {};

	let { ...rest }: Props = $props();

	const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';

	$: finalClasses = clsx(baseClasses, rest.class);
</script>

<label class={finalClasses} {...rest}>
	<slot />
</label>