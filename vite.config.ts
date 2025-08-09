import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],

	// Konfigurasi server pengembangan
	server: {
		port: 5173,
		strictPort: true,
	},

	// Konfigurasi untuk build produksi
	build: {
		sourcemap: true,
	},

	// Konfigurasi Vitest untuk pengujian unit
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		environment: 'jsdom', // Lingkungan mirip browser untuk tes komponen UI
		globals: true, // Mengaktifkan global (describe, it, expect) secara otomatis
		setupFiles: ['./vitest-setup.ts'], // File setup untuk tes
	}
};

export default defineConfig(config);