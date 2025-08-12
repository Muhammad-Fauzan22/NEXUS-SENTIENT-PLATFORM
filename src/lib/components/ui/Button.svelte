<script lang="ts">
	import clsx from 'clsx';

	type Variant = 'primary' | 'secondary';

	export let variant: Variant = 'primary';
	export let disabled: boolean = false;

	// --- Kelas Dasar & Varian ---
	// Menggunakan pendekatan berbasis kelas untuk styling yang konsisten dan dapat dipelihara.
	const baseClasses =
		'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
		secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
	};
</script>

<!--
  Tombol ini dirancang untuk fleksibilitas maksimum:
  - {...$$restProps}: Meneruskan semua atribut HTML lainnya (misalnya, `type="submit"`)
    langsung ke elemen tombol.
  - on:click: Meneruskan event `click` ke komponen induk.
  - clsx(...): Menggabungkan kelas-kelas secara dinamis untuk styling yang bersih.
    `$$props.class` memungkinkan penambahan kelas kustom dari luar.
-->
<button
	{...$$restProps}
	class={clsx(baseClasses, variantClasses[variant], $$props.class)}
	{disabled}
	on:click
>
	<slot />
</button>