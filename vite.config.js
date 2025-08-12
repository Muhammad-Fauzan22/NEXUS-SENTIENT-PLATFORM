import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Enable a browser-like environment for testing components
		environment: 'jsdom',
		// Define which files to include as tests
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Load setup file before running tests
		setupFiles: ['./vitest-setup.ts']
	}
});