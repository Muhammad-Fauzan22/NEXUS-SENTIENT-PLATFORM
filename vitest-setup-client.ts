// vitest-setup-client.ts
// File setup untuk lingkungan test client-side Vitest.
// Mengatur mocking dan polyfill yang diperlukan untuk menjalankan test komponen Svelte di lingkungan Node.js.

import '@testing-library/jest-dom/vitest'; // <<<<<<<<< TAMBAHKAN INI UNTUK MATCHER JEST-DOM
// --- 1. Polyfill untuk API Browser yang Tidak Tersedia di Node.js ---
// Vitest berjalan di lingkungan Node.js, jadi kita perlu mem-polyfill beberapa API browser
// yang digunakan oleh komponen Svelte atau library seperti `@testing-library/svelte`.

// --- a. Polyfill untuk `fetch` ---
// `fetch` adalah API browser modern untuk membuat request HTTP.
// Node.js tidak memiliki `fetch` secara built-in sebelum versi 18.
// Kita gunakan `node-fetch` untuk memastikan kompatibilitas.
import fetch, { Headers, Request, Response } from 'node-fetch';

// Cek apakah `fetch` sudah tersedia secara global (misalnya, di Node.js 18+)
// Jika belum, pasang polyfill dari `node-fetch`
if (!globalThis.fetch) {
    globalThis.fetch = fetch as any; // Casting ke any untuk kompatibilitas tipe
    globalThis.Headers = Headers as any;
    globalThis.Request = Request as any;
    globalThis.Response = Response as any;
    console.log('[Vitest Setup Client] Polyfill `fetch` diaplikasikan.');
} else {
    console.log('[Vitest Setup Client] `fetch` sudah tersedia secara global.');
}

// --- b. Polyfill untuk `window` dan `document` (jika diperlukan oleh library tertentu) ---
// `@testing-library/svelte` biasanya menangani ini dengan `jsdom`.
// Namun, jika komponen Anda atau test mengakses `window` atau `document` secara langsung,
// Anda mungkin perlu menambahkan mock secara eksplisit di sini.
// Contoh (jika diperlukan):
/*
Object.defineProperty(globalThis, 'window', {
    value: globalThis, // Gunakan globalThis sebagai window
    writable: true,
    configurable: true
});
Object.defineProperty(globalThis, 'document', {
    value: {}, // Mock document kosong atau dengan properti yang diperlukan
    writable: true,
    configurable: true
});
*/

// --- 2. Setup untuk Testing Library Svelte ---
// `@testing-library/svelte` menyediakan utilitas untuk merender dan menguji komponen Svelte.
// Tidak perlu setup tambahan selain impor jika menggunakan `jsdom` environment.

// --- 3. Setup untuk Mocking Modul atau Fungsi Global (Opsional) ---
// Jika komponen Anda bergantung pada modul atau fungsi global yang perlu dimock,
// Anda bisa melakukannya di sini menggunakan `vi.mock` atau `vi.stubGlobal`.
// Contoh:
// vi.mock('$lib/server/utils/logger', () => ({
//     default: {
//         info: vi.fn(),
//         warn: vi.fn(),
//         error: vi.fn()
//     }
// }));
// vi.stubGlobal('localStorage', {
//     getItem: vi.fn(),
//     setItem: vi.fn(),
//     removeItem: vi.fn()
// });

// --- 4. Setup untuk Environment Variables (Opsional) ---
// Jika test Anda memerlukan variabel lingkungan tertentu, Anda bisa menyetelnya di sini.
// Contoh:
// process.env.VITE_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
// process.env.VITE_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// --- 5. Setup untuk Supabase Client (Opsional, jika test berinteraksi dengan Supabase) ---
// Jika Anda ingin mengetes interaksi dengan Supabase, Anda bisa membuat mock client di sini.
// Contoh (menggunakan `vitest.mock`):
/*
import { vi } from 'vitest';
vi.mock('$lib/server/db/supabase.admin', () => {
    return {
        supabaseAdmin: {
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: null, error: null })
                    }))
                })),
                insert: vi.fn(() => ({
                    select: vi.fn().mockResolvedValue({ data: [{ id: 'mock-id' }], error: null })
                }))
            }))
        }
    };
});
*/

// --- Catatan Penting ---
// - File ini dijalankan SEBELUM setiap file test client-side dijalankan.
// - Ini memastikan bahwa lingkungan test memiliki semua yang diperlukan.
// - Pastikan `vite.config.js` merujuk ke file ini di konfigurasi `test.setupFiles`.
// - Jika menggunakan `@testing-library/svelte`, pastikan `jsdom` environment diatur di `vite.config.js`.

console.log('[Vitest Setup Client] Lingkungan test client-side telah disiapkan.');