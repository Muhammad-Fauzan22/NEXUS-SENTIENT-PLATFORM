import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Tell Vitest to use a browser-like environment (jsdom)
		environment: 'jsdom',
		// Include all test files
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Explicitly load our setup file before running tests
		setupFiles: ['./vitest-setup.ts']
	}
});