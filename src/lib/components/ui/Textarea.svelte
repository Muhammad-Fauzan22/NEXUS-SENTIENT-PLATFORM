<script lang="ts">
	import { clsx } from 'clsx';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = HTMLTextareaAttributes & {
		value?: string;
		hasError?: boolean;
	};

	let { value = $bindable(), hasError = false, ...rest }: Props = $props();

	const baseClasses =
		'flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

	const errorClasses = 'border-destructive focus-visible:ring-destructive';

	$: finalClasses = clsx(baseClasses, hasError && errorClasses, rest.class);
</script>

<textarea class={finalClasses} bind:value {...rest} />