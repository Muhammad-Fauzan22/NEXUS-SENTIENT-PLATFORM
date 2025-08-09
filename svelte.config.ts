import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { Config } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Config} */
const config: Config = {
	// Konsultasikan dengan compiler Svelte untuk memproses markup di dalam
	// <script> dan <style> blok.
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto hanya cocok untuk sebagian besar platform target.
		// Jika target build Anda bukan Node.js, Anda mungkin perlu mengadaptasi ini.
		// Lihat https://kit.svelte.dev/docs/adapters untuk informasi lebih lanjut.
		adapter: adapter(),
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$stores: './src/lib/stores',
			$types: './src/lib/types',
			$utils: './src/lib/utils'
		}
	}
};

export default config;