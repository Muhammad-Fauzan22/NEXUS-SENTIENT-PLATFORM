// src/hooks.server.js
// Hook server SvelteKit untuk logging, auth middleware, dan penanganan error global.

import logger from '$lib/server/utils/logger';
import { sequence } from '@sveltejs/kit/hooks'; // Untuk menggabungkan beberapa hooks

// --- 1. Hook Logging Middleware ---
/**
 * Middleware untuk mencatat setiap request yang masuk ke server.
 * @type {import('@sveltejs/kit').Handle}
 */
async function loggingMiddleware({ event, resolve }) {
    const startTime = Date.now();
    const userAgent = event.request.headers.get('user-agent') || 'Unknown';
    const clientIP = event.getClientAddress();
    
    logger.info(`[Server Hook] ${event.request.method} ${event.url.pathname}`, {
        userAgent,
        clientIP
    });

    // Lanjutkan ke handler route berikutnya
    const response = await resolve(event);

    const duration = Date.now() - startTime;
    logger.info(`[Server Hook] ${event.request.method} ${event.url.pathname} - Status: ${response.status} - Duration: ${duration}ms`);

    return response;
}

// --- 2. Hook Error Handling Global ---
/**
 * Hook untuk menangkap error yang tidak tertangani secara global di server.
 * @type {import('@sveltejs/kit').HandleServerError}
 */
export async function handleError({ error, event }) {
    // --- Logging Error Global ---
    logger.error(`[Server Hook Global Error Handler] Unhandled server error for ${event.request.method} ${event.url.pathname}:`, error);

    // --- Kembalikan pesan error yang aman untuk client ---
    // Jangan kirim detail error internal ke browser.
    return {
        message: 'Whoops! Something went wrong on our end. Please try again later.'
    };
}

// --- 3. (Opsional/Future) Hook Auth Middleware ---
/**
 * (Placeholder) Middleware untuk autentikasi dan otorisasi pengguna.
 * @type {import('@sveltejs/kit').Handle}
 */
// async function authMiddleware({ event, resolve }) {
//      // --- Contoh logika auth dasar ---
//      // const authHeader = event.request.headers.get('Authorization');
//      // if (!authHeader || !authHeader.startsWith('Bearer ')) {
//      //     logger.warn(`[Server Hook Auth] Unauthorized access attempt to ${event.url.pathname}`);
//      //     // Anda bisa melempar error 401 di sini
//      //     // throw error(401, 'Unauthorized');
//      //     // Atau set `event.locals.user = null` dan lanjutkan
//      // }
//
//      // --- Contoh logika auth dengan Supabase (jika digunakan) ---
//      // import { supabaseAdmin } from '$lib/server/db/supabase.admin';
//      // const token = authHeader?.substring(7); // Hilangkan 'Bearer '
//      // const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
//      // if (error || !user) {
//      //     logger.warn(`[Server Hook Auth] Invalid or expired token for ${event.url.pathname}`);
//      //     event.locals.user = null;
//      // } else {
//      //     event.locals.user = user;
//      //     logger.info(`[Server Hook Auth] User authenticated: ${user.email}`);
//      // }
//
//     // Lanjutkan ke handler route berikutnya
//     return await resolve(event);
// }

// --- 4. Gabungkan Hooks ---
// Gunakan `sequence` untuk menjalankan hooks secara berurutan.
// Tambahkan `authMiddleware` ke dalam sequence jika sudah diimplementasikan.
export const handle = sequence(loggingMiddleware /*, authMiddleware*/);

// --- Catatan Penting ---
// - File ini adalah hook server SvelteKit.
// - Ini berjalan di server untuk setiap request.
// - `handle` adalah hook utama untuk middleware (logging, auth).
// - `handleError` adalah hook untuk menangkap error global.
// - Pastikan path import seperti `$lib/server/utils/logger` sudah benar.