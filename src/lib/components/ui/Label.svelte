<script lang="ts">
	import { clsx } from 'clsx';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Props = HTMLLabelAttributes & {};

	let { ...rest }: Props = $props();

	const baseClasses =
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';

	const finalClasses = clsx(baseClasses, rest.class as string);
</script>

<label class={finalClasses} {...rest}>
	<!-- svelte-ignore slot_element_deprecated -->
	<slot />
</label>
