import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		// Mendefinisikan alias path '$lib' adalah krusial untuk impor yang bersih
		// dan konsisten di seluruh aplikasi.
		alias: {
			'$lib': './src/lib'
		}
	}
};

export default config;