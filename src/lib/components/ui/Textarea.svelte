<!-- src/lib/components/ui/Textarea.svelte -->
<script lang="ts">
	let { value = $bindable(), ...rest } = $props<{ value: string } & Record<string, any>>();
</script>

<textarea
	bind:value
	class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
	{...rest}
></textarea>
