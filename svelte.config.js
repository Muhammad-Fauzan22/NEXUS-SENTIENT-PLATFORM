import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Menggunakan vitePreprocess memungkinkan Vite untuk menangani semua
	// pra-pemrosesan (TypeScript, PostCSS, dll.) secara efisien.
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto secara cerdas memilih adapter yang tepat untuk lingkungan
		// deployment Anda (Vercel, Netlify, dll.), memberikan fleksibilitas maksimum.
		adapter: adapter(),

		// Mendefinisikan alias path '$lib' adalah krusial untuk impor yang bersih
		// dan konsisten di seluruh aplikasi.
		alias: {
			'$lib': './src/lib'
		}
	}
};

export default config;