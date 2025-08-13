<!-- src/lib/components/ui/Textarea.svelte -->
<script lang="ts">
	// Gunakan sintaksis Svelte 5 Runes
	let { value = $bindable() } = $props<{ value: string }>();
	
	// Terima semua sisa props menggunakan rest props
	const { ...rest } = $props();
</script>

<textarea
	bind:value={value}
	class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
	{...rest}
></textarea>