import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Menggunakan lingkungan 'jsdom' untuk mensimulasikan browser,
		// krusial untuk pengujian komponen Svelte.
		environment: 'jsdom',

		// Secara eksplisit mendefinisikan file mana yang dianggap sebagai tes.
		include: ['src/**/*.{test,spec}.{js,ts}'],

		// Memuat file setup sebelum setiap tes dijalankan untuk mengkonfigurasi
		// lingkungan pengujian, seperti menambahkan matchers jest-dom.
		setupFiles: ['./vitest-setup.ts']
	}
});