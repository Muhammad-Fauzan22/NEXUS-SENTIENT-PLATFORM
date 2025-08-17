<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface $$Props extends Partial<SVGElement> {
		class?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let size: $$Props['size'] = 'md';

	const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8'
	};

	// ensure size is valid key
	$: _sizeKey = (size ?? 'md') as 'sm' | 'md' | 'lg';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={cn('animate-spin', sizeClasses[_sizeKey], className)}
>
	<path d="M21 12a9 9 0 1 1-6.219-8.56" />
</svg>
