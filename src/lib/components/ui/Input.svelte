<script lang="ts">
	export let id: string;
	export let label: string;
	export let value: string | number;
	// CORRECTED: Removed dynamic type to prevent Svelte error with two-way binding.
	// For different input types, create separate components or use a different binding strategy.
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
	<input
		{id}
		{...$$restProps}
		bind:value
		class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
	/>
</div>```

Setelah Anda menerapkan semua perbaikan ini, seluruh sistem Anda akan stabil. Jalankan kembali `npm test` dan `npx playwright test` untuk memverifikasi.