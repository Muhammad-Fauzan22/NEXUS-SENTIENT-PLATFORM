<!-- src/lib/components/core/Logo.svelte -->
<script lang="ts">
	// Pertahankan prop untuk ukuran
	let { size = 8 } = $props<{ size?: number }>();
</script>

<img
	src="https://katamata.wordpress.com/wp-content/uploads/2013/11/logo-m-its-red.png"
	alt="Logo HMM ITS"
	width={size * 4}
	class="h-auto"
/>
