<script lang="ts">
	import { clsx } from 'clsx';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = HTMLInputAttributes & {
		value?: string;
		hasError?: boolean;
	};

	let { value = $bindable(), hasError = false, ...rest }: Props = $props();

	const baseClasses =
		'flex h-10 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

	const errorClasses = 'border-destructive focus-visible:ring-destructive';

	$: finalClasses = clsx(baseClasses, hasError && errorClasses, rest.class);
</script>

<input class={finalClasses} bind:value {...rest} />