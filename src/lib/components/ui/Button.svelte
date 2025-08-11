<script lang="ts">
	import { clsx } from 'clsx';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = (HTMLButtonAttributes | HTMLAnchorAttributes) & {
		variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		href?: string;
	};

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		href = undefined,
		...rest
	}: Props = $props();

	const Tag = href ? 'a' : 'button';

	const baseClasses =
		'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

	const variantClasses = {
		primary: 'bg-primary text-white hover:bg-primary-hover',
		secondary: 'bg-secondary text-text hover:bg-secondary-hover',
		destructive: 'bg-destructive text-white hover:bg-destructive-hover',
		ghost: 'hover:bg-secondary hover:text-text'
	};

	const sizeClasses = {
		sm: 'h-9 px-3',
		md: 'h-10 px-4 py-2',
		lg: 'h-11 px-8'
	};

	$: finalClasses = clsx(baseClasses, variantClasses[variant], sizeClasses[size], rest.class);
</script>

<Tag
	class={finalClasses}
	href={href}
	disabled={loading || rest.disabled}
	aria-busy={loading ? 'true' : undefined}
	{...rest}
	on:click
>
	{#if loading}
		<svg
			class="animate-spin -ml-1 mr-3 h-5 w-5"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
		<span>Memproses...</span>
	{:else}
		<slot />
	{/if}
</Tag>