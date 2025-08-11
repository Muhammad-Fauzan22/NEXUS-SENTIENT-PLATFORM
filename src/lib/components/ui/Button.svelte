<script lang="ts">
	import clsx from 'clsx';

	type Variant = 'primary' | 'secondary';

	export let variant: Variant = 'primary';
	export let disabled: boolean = false;

	const baseClasses =
		'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
		secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
	};

	const disabledClasses = 'opacity-50 cursor-not-allowed';
</script>

<button
	{...$$restProps}
	class={clsx(baseClasses, variantClasses[variant], disabled && disabledClasses, $$props.class)}
	{disabled}
	on:click
>
	<slot />
</button>