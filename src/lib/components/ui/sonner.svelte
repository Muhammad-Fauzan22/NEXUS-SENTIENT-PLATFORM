<script lang="ts">
	import { Toaster as Sonner, type ToasterProps } from 'svelte-sonner';

	type $$Props = ToasterProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Sonner
	class="{className}"
	theme="light"
	toastOptions="{{
		classes: {
			toast:
				'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
			description: 'group-[.toast]:text-muted-foreground',
			actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
			cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
		}
	}}"
	{...$$restProps}
/>
