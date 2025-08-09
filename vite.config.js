// vite.config.js
// File konfigurasi Vite (build tool) untuk NEXUS-SENTIENT-PLATFORM.
// Mengintegrasikan SvelteKit, Tailwind CSS, dan Vitest.

import { sveltekit } from '@sveltejs/kit/vite';
// DIPERBAIKI: Mengimpor defineConfig dari 'vitest/config' bukan 'vite'.
// Ini menggabungkan tipe Vite dan Vitest, sehingga properti 'test' dikenali.
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],

	// --- Konfigurasi Server Pengembangan ---
	server: {
		port: 5173,
		strictPort: false,
		host: true
	},

	// --- Konfigurasi Preview (setelah build) ---
	preview: {
		port: 4173,
		strictPort: false,
		host: true
	},

	// --- Konfigurasi Resolve Alias ---
	// Dihapus karena SvelteKit sudah menangani alias '$lib'.

	// --- Konfigurasi Testing (Vitest) ---
	test: {
		// Konfigurasi untuk Unit Test (Node.js Environment)
		name: 'unit-tests',
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: [
			'src/**/*.{svelte}.{test,spec}.{js,ts}',
			'node_modules/**',
			'dist/**',
			'.svelte-kit/**'
		],

		// Konfigurasi Expect
		expect: {
			requireAssertions: true
		}

		// File Setup (opsional)
		// setupFiles: ['./vitest-setup-unit.js'],
	}
});