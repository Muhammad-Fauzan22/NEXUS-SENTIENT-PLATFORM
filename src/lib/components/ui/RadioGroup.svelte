<!-- src/lib/components/ui/RadioGroup.svelte -->
<script lang="ts">
	// Gunakan sintaksis Svelte 5 Runes
	let { group = $bindable() } = $props<{ group: string }>();
	let { label } = $props<{ label: string }>();
	let { options } = $props<{ options: string[] }>();
	let { name } = $props<{ name: string }>();
</script>

<div class="mb-4">
	<p class="font-medium mb-2">{label}</p>
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
		{#each options as option, i}
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="radio"
					name={name}
					value={option}
					bind:group={group}
					class="w-4 h-4 text-primary bg-secondary border-secondary focus:ring-primary focus:ring-2"
				/>
				<span class="text-foreground/90">{option}</span>
			</label>
		{/each}
	</div>
</div>