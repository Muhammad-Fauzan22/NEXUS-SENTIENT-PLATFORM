<script lang="ts">
	// --- Props ---
	// Mendefinisikan antarmuka publik dari komponen.
	// `value` diekspor agar dapat diikat dengan `bind:value` dari induk.
	export let value: string | number;
	export let id: string;
	export let label: string;
	export let type: 'text' | 'email' | 'number' | 'password' = 'text';
</script>

<!--
  Komponen ini mengenkapsulasi praktik terbaik untuk elemen form:
  1. Aksesibilitas: `<label for={id}>` secara eksplisit terhubung ke `<input>`,
     memastikan bahwa screen reader dapat mengasosiasikannya dengan benar.
  2. Styling Terpusat: Semua kelas Tailwind didefinisikan di sini, memastikan
     semua input di seluruh aplikasi memiliki tampilan dan nuansa yang konsisten.
  3. Fleksibilitas: `$$restProps` memungkinkan atribut HTML standar
     (seperti `placeholder`, `required`, `min`, `max`) untuk diteruskan
     langsung ke elemen input tanpa perlu mendefinisikannya sebagai props.
-->
<div>
	<label for={id} class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
	<input
		{id}
		{type}
		{...$$restProps}
		bind:value
		class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
	/>
</div>