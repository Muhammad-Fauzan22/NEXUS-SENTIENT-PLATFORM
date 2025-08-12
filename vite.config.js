import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Menggunakan lingkungan 'jsdom' untuk mensimulasikan browser,
		// yang krusial untuk pengujian komponen Svelte di lingkungan Node.js.
		environment: 'jsdom',

		// Secara eksplisit mendefinisikan file mana yang dianggap sebagai file tes.
		include: ['src/**/*.{test,spec}.{js,ts}'],

		// Memuat file setup ini sebelum setiap rangkaian tes dijalankan.
		// Ini digunakan untuk mengkonfigurasi lingkungan pengujian,
		// seperti menambahkan matchers jest-dom untuk asserstion yang lebih baik.
		setupFiles: ['./vitest-setup.ts']
	}
});