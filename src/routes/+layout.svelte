<script>
	// Impor ini memastikan bahwa gaya global dari app.css, termasuk
	// reset Tailwind dan utilitas dasar, diterapkan ke setiap halaman
	// di dalam aplikasi Anda.
	import '../app.css';
</script>

<!-- 
  Struktur <main> ini berfungsi sebagai container utama untuk semua konten halaman.
  Kelas-kelas Tailwind yang diterapkan di sini (container, mx-auto, padding)
  menciptakan tata letak yang terpusat dan konsisten secara visual untuk
  seluruh aplikasi, memastikan pengalaman pengguna yang seragam.
-->
<main class="container mx-auto px-4 py-8">
	<slot />
</main>