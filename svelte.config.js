// svelte.config.js
// File konfigurasi SvelteKit untuk NEXUS-SENTIENT-PLATFORM.
// Mengintegrasikan adapter, preprocessor (Tailwind, TypeScript), dan konfigurasi lainnya.

import adapter from '@sveltejs/adapter-auto'; // <<<<<<<<< SESUAIKAN DENGAN ADAPTER YANG DIGUNAKAN (auto, vercel, netlify, dll.)
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // --- Preprosesor ---
    // vitePreprocess menangani TypeScript, SCSS, Less, PostCSS (termasuk Tailwind) secara otomatis.
    preprocess: vitePreprocess(),

    kit: {
        // --- Adapter ---
        // adapter-auto memilih adapter yang tepat berdasarkan lingkungan deploy (Vercel, Netlify, dll.).
        // Untuk produksi, Anda bisa mengganti dengan adapter spesifik jika diperlukan.
        adapter: adapter(),

        // --- Alias ---
        // Memungkinkan impor dengan path absolut menggunakan $lib, $components, dll.
        alias: {
            $lib: './src/lib',
            '$lib/*': './src/lib/*',
            // Tambahkan alias lain jika diperlukan
            // '$components': './src/lib/components',
            // '$components/*': './src/lib/components/*',
            // '$server': './src/lib/server',
            // '$server/*': './src/lib/server/*',
            // '$utils': './src/lib/server/utils',
            // '$utils/*': './src/lib/server/utils/*',
            // '$ai': './src/lib/server/ai',
            // '$ai/*': './src/lib/server/ai/*',
            // '$db': './src/lib/server/db',
            // '$db/*': './src/lib/server/db/*'
        },

        // --- Konfigurasi Lainnya (Opsional) ---
        // csrf: { checkOrigin: true }, // Aktifkan jika perlu proteksi CSRF
        // csp: { ... }, // Aktifkan jika perlu Content Security Policy
        // files: { ... }, // Untuk menyesuaikan lokasi file khusus jika diperlukan
        // paths: { ... }, // Untuk menyesuaikan base path jika diperlukan
        // trailingSlash: 'never', // Aturan untuk trailing slash di URL
        // version: { ... }, // Untuk versioning aplikasi
    },

    // --- Konfigurasi Compiler (Opsional) ---
    // compilerOptions: { ... }, // Untuk opsi compiler Svelte jika diperlukan

    // --- Konfigurasi Vite (Didefinisikan di vite.config.js) ---
    // vitePlugin: { ... }, // Opsi untuk plugin Svelte Vite (didefinisikan di vite.config.js)
};

export default config;