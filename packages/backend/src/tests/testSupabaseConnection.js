// scripts/tests/testSupabaseConnection.js
// Skrip mandiri untuk menguji koneksi ke database Supabase menggunakan supabaseAdmin.

import logger from '$lib/server/utils/logger';
import { supabaseAdmin } from '$lib/server/db/supabase.admin';

/**
 * Fungsi utama untuk menguji koneksi ke Supabase.
 */
// --- GANTI KODE DARI BARIS 11 SAMPAI 39 ---

/**
 * Fungsi utama untuk menguji koneksi ke Supabase.
 */
async function testSupabaseConnection() {
    logger.info('[Test Supabase Conn] Memulai pengujian koneksi ke Supabase...');

    try {
        // --- Lakukan operasi sederhana untuk menguji koneksi ---
        // Misalnya, ambil 1 record dari tabel `raw_assessment_data` (atau tabel lain yang pasti ada)
        logger.debug('[Test Supabase Conn] Mencoba mengambil 1 record dari tabel raw_assessment_data...');
        // DIPERBAIKI: Menambahkan variabel 'data' yang hilang saat destructuring
        const { data, error } = await supabaseAdmin
            .from('raw_assessment_data')
            .select('id') // Hanya ambil ID untuk pengujian ringan
            .limit(1);

        if (error) {
            // Tangani error khusus "tabel tidak ditemukan"
            if (error.code === '42P01' || (error.message?.includes('relation') && error.message?.includes('does not exist'))) {
                logger.warn('[Test Supabase Conn] Tabel raw_assessment_data tidak ditemukan. Koneksi ke DB berhasil, tetapi tabel belum dibuat.');
                console.log('✅ Koneksi ke Supabase BERHASIL! (Tabel belum dibuat)');
            } else {
                throw error; // Lempar error lainnya
            }
        } else {
            // DIPERBAIKI: Menggunakan variabel 'data' yang sudah didefinisikan
            logger.info(`[Test Supabase Conn] Koneksi ke Supabase BERHASIL. Ditemukan ${data?.length || 0} record di tabel raw_assessment_data.`);
            console.log('✅ Koneksi ke Supabase BERHASIL!');
            // DIPERBAIKI: Menggunakan variabel 'data'
            if (data && data.length > 0) {
                // DIPERBAIKI: Menggunakan variabel 'data'
                console.log(`   - Sample Record ID: ${data[0].id}`);
            }
        }

    } catch (error) {
        logger.error('[Test Supabase Conn] Koneksi ke Supabase GAGAL:', error);
        console.error('❌ Koneksi ke Supabase GAGAL:', error.message);
        process.exit(1); // Keluar dengan kode error
    }
}
// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    testSupabaseConnection().catch(console.error);
}

export { testSupabaseConnection };