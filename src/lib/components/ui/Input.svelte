<script lang="ts">
	export let id: string;
	export let label: string;
	export let value: string | number;
	export let type: 'text' | 'email' | 'number' | 'password' = 'text';
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
	<input
		{id}
		{type}
		{...$$restProps}
		bind:value
		class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
	/>
</div>