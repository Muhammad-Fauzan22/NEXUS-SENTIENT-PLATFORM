<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	// Gunakan sintaksis Svelte 5 Runes
	let { href = undefined } = $props<{ href?: string }>();
	let { variant = 'primary' } = $props<{ variant?: 'primary' | 'secondary' }>();

	// Terima semua sisa props menggunakan rest props
	const { children, ...rest } = $props();
</script>

{#if href}
	<!-- Render sebagai tautan <a> -->
	<a
		{href}
		class={`inline-block font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variant === 'secondary' ? 'bg-secondary hover:bg-secondary/80 focus:ring-secondary text-foreground' : 'bg-primary hover:bg-primary/90 focus:ring-primary text-primary-foreground'}`}
		{...rest}
	>
		{children}
	</a>
{:else}
	<!-- Render sebagai tombol <button> -->
	<button
		class={`inline-block font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variant === 'secondary' ? 'bg-secondary hover:bg-secondary/80 focus:ring-secondary text-foreground' : 'bg-primary hover:bg-primary/90 focus:ring-primary text-primary-foreground'}`}
		{...rest}
	>
		{children}
	</button>
{/if}
