// .eslintrc.cjs
// Konfigurasi ESLint untuk proyek NEXUS-SENTIENT-PLATFORM.
// Mengintegrasikan Svelte, TypeScript, dan aturan khusus proyek.

module.exports = {
    // --- Extends ---
    // Gunakan konfigurasi yang direkomendasikan oleh SvelteKit dan komunitas.
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // Jika menggunakan TypeScript
        'plugin:svelte/recommended', // Aturan khusus untuk komponen Svelte
        'prettier' // Matikan aturan ESLint yang bentrok dengan Prettier
    ],

    // --- Parser ---
    // Gunakan parser yang sesuai untuk file .svelte dan .ts/.js
    parser: '@typescript-eslint/parser', // Jika menggunakan TypeScript
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // project: './tsconfig.json', // Jika menggunakan TypeScript dan ingin type-checking linting
        extraFileExtensions: ['.svelte'] // Tambahkan ekstensi .svelte
    },

    // --- Plugins ---
    // Plugin yang digunakan
    plugins: [
        '@typescript-eslint', // Jika menggunakan TypeScript
        'svelte' // Plugin untuk linting Svelte
    ],

    // --- Env ---
    // Lingkungan eksekusi
    env: {
        browser: true,
        es2022: true,
        node: true // Untuk file server-side
    },

    // --- Overrides ---
    // Aturan khusus untuk tipe file tertentu
    overrides: [
        {
            // --- Aturan khusus untuk file .svelte ---
            files: ['*.svelte'],
            processor: 'svelte/svelte', // Gunakan processor Svelte
            // Matikan aturan yang tidak kompatibel dengan Svelte
            rules: {
                'svelte/valid-compile': 'warn' // Peringatkan jika ada error kompilasi Svelte
            }
        },
        {
            // --- Aturan khusus untuk file server-side .js/.ts ---
            files: ['src/lib/server/**/*.js', 'src/lib/server/**/*.ts', 'src/routes/api/**/*.js', 'src/routes/api/**/*.ts'],
            env: {
                node: true // Pastikan lingkungan Node.js aktif
            },
            // Tambahkan aturan khusus server jika diperlukan
            rules: {
                // Contoh: Matikan aturan no-console untuk file server
                // 'no-console': 'off'
            }
        }
    ],

    // --- Rules ---
    // Aturan linting khusus proyek
    rules: {
        // --- Aturan Umum ---
        'indent': ['error', 4], // Gunakan indentasi 4 spasi
        'linebreak-style': ['error', 'unix'], // Gunakan linebreak gaya Unix
        'quotes': ['error', 'single'], // Gunakan tanda kutip tunggal
        'semi': ['error', 'always'], // Selalu gunakan titik koma
        'no-unused-vars': ['warn'], // Peringatkan variabel yang tidak digunakan
        'no-console': ['warn'], // Peringatkan penggunaan console (kecuali di server override)
        'prefer-const': 'error', // Dorong penggunaan const jika memungkinkan

        // --- Aturan TypeScript (jika digunakan) ---
        '@typescript-eslint/no-unused-vars': ['warn'], // Peringatkan variabel TS yang tidak digunakan
        '@typescript-eslint/no-explicit-any': 'warn', // Peringatkan penggunaan any eksplisit

        // --- Aturan Svelte ---
        // 'svelte/no-at-html-tags': 'error', // Larang penggunaan {@html} (terlalu ketat untuk IDP)
        // 'svelte/valid-compile': 'error' // Error jika ada error kompilasi Svelte
    },

    // --- Settings ---
    // Konfigurasi tambahan untuk plugin
    settings: {
        // Konfigurasi untuk svelte
        'svelte': {
            // compileOptions: { ... } // Opsi kompilasi Svelte jika diperlukan
        }
    }
};