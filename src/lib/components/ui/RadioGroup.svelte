<!-- src/lib/components/ui/RadioGroup.svelte -->
<script lang="ts">
	let {
		group = $bindable(),
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		label,
		options,
		name
	} = $props<{
		group: string;
		label: string;
		options: string[];
		name: string;
	}>();
</script>

<div class="mb-4">
	<p class="font-medium mb-2">{label}</p>
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
		{#each options as option}
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="radio"
					{name}
					value={option}
					bind:group
					class="w-4 h-4 text-primary bg-secondary border-secondary focus:ring-primary focus:ring-2"
				/>
				<span class="text-foreground/90">{option}</span>
			</label>
		{/each}
	</div>
</div>
