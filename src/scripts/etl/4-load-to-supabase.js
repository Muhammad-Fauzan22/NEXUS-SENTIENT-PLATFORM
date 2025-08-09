// src/scripts/etl/4-load-to-supabase.js
// Script untuk memuat chunk pengetahuan yang telah divisualisasikan ke tabel `knowledge_chunks` di Supabase.

import fs from 'fs/promises';
import path from 'path';
import logger from '$lib/server/utils/logger';
import { supabaseAdmin } from '$lib/server/db/supabase.admin'; // Gunakan admin untuk insert batch

// --- Konfigurasi ---
const VECTORIZED_DATA_DIR = path.join(process.cwd(), 'src', 'lib', 'data', 'vectorized');
const KNOWLEDGE_CHUNKS_TABLE = 'knowledge_chunks'; // Nama tabel di Supabase

/**
 * Memuat chunk pengetahuan yang telah divisualisasikan ke database Supabase.
 * @param {Array<Object>} vectorizedChunks - Array objek chunk yang telah divisualisasikan.
 * @returns {Promise<{success: boolean, data: any, error: any}>} - Hasil operasi.
 */
async function loadVectorizedChunksToSupabase(vectorizedChunks) {
    if (!Array.isArray(vectorizedChunks) || vectorizedChunks.length === 0) {
        const warnMsg = 'Tidak ada chunk yang diberikan untuk dimuat ke Supabase.';
        logger.warn(`[ETL Step 4 - Load] loadVectorizedChunksToSupabase: ${warnMsg}`);
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: true, data: [], error: null }; // Tidak error, hanya tidak ada data
    }

    try {
        logger.info(`[ETL Step 4 - Load] Memulai proses pemuatan ${vectorizedChunks.length} chunk ke tabel '${KNOWLEDGE_CHUNKS_TABLE}'...`);

        // --- Siapkan data untuk dimuat ---
        // Konversi array objek JS ke format yang sesuai untuk tabel Supabase
        const chunksToInsert = vectorizedChunks.map(chunk => ({
            id: chunk.id, // Gunakan ID dari file JSON
            source_document: chunk.source_document,
            content_text: chunk.content_text,
            content_embedding: chunk.content_embedding, // Array angka, akan dikonversi oleh pgvector
            chunk_metadata: chunk.chunk_metadata || {} // Pastikan metadata adalah objek JSONB
        }));

        // --- Muat data ke Supabase dalam satu batch ---
        logger.debug(`[ETL Step 4 - Load] Memasukkan ${chunksToInsert.length} chunk ke database...`);
        const { data, error: insertError } = await supabaseAdmin
            .from(KNOWLEDGE_CHUNKS_TABLE)
            .insert(chunksToInsert); // <<<<<<<<< INSERT BATCH

        if (insertError) {
            throw insertError;
        }

        logger.info(`[ETL Step 4 - Load] ✅ ${chunksToInsert.length} chunk berhasil dimuat ke tabel '${KNOWLEDGE_CHUNKS_TABLE}'.`);
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: true, data: chunksToInsert, error: null };

    } catch (error) {
        const errorMsg = `Gagal memuat chunk ke Supabase: ${error.message}`;
        logger.error(`[ETL Step 4 - Load] loadVectorizedChunksToSupabase FAILED: ${errorMsg}`, error);
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: false, data: null, error: error };
    }
}

/**
 * Fungsi utama untuk menjalankan proses ETL Langkah 4: Load.
 */
export async function runLoadToSupabase() {
    logger.info('[ETL Step 4 - Load] Memulai proses ETL Langkah 4: Load ke Supabase...');

    try {
        // --- 1. Baca data vektor dari file JSON ---
        logger.info(`[ETL Step 4 - Load] Membaca data vektor dari: ${VECTORIZED_DATA_DIR}`);
        const vectorizedDataFiles = await fs.readdir(VECTORIZED_DATA_DIR);
        const jsonFiles = vectorizedDataFiles.filter(file => path.extname(file) === '.json');

        if (jsonFiles.length === 0) {
            logger.warn('[ETL Step 4 - Load] Tidak ada file JSON ditemukan di folder vectorized.');
            return;
        }

        logger.info(`[ETL Step 4 - Load] Ditemukan ${jsonFiles.length} file JSON untuk dimuat.`);

        // Array untuk menyimpan semua chunk dari semua file
        let allChunks = [];

        // --- 2. Proses setiap file JSON ---
        for (const file of jsonFiles) {
            const filePath = path.join(VECTORIZED_DATA_DIR, file);
            logger.info(`\n[ETL Step 4 - Load] Memproses file: ${file}`);

            try {
                const vectorizedDataString = await fs.readFile(filePath, 'utf-8');
                const vectorizedChunks = JSON.parse(vectorizedDataString);

                if (!Array.isArray(vectorizedChunks) || vectorizedChunks.length === 0) {
                    logger.warn(`[ETL Step 4 - Load] File ${file} kosong atau bukan array. Melewati.`);
                    continue;
                }

                logger.info(`[ETL Step 4 - Load] File ${file} berisi ${vectorizedChunks.length} chunk.`);
                allChunks = [...allChunks, ...vectorizedChunks];

            } catch (fileError) {
                logger.error(`[ETL Step 4 - Load] Gagal memproses file ${file}: ${fileError.message}`, fileError);
                // Lanjutkan ke file berikutnya
            }
        }

        if (allChunks.length === 0) {
            logger.warn('[ETL Step 4 - Load] Tidak ada chunk yang berhasil dibaca dari file JSON manapun.');
            return;
        }

        logger.info(`\n[ETL Step 4 - Load] Total ${allChunks.length} chunk dari ${jsonFiles.length} file akan dimuat.`);

        // --- 3. (Opsional) Bersihkan data lama ---
        // Ini penting untuk memastikan database sinkron dengan knowledge base terbaru.
        // Jika Anda ingin menjaga histori, Anda bisa menambahkan kolom 'version' atau 'is_active'.
        logger.info(`[ETL Step 4 - Load] Membersihkan data lama dari tabel '${KNOWLEDGE_CHUNKS_TABLE}'...`);
        const { error: deleteError } = await supabaseAdmin
            .from(KNOWLEDGE_CHUNKS_TABLE)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Kondisi dummy untuk menghindari penghapusan semua jika tabel kosong

        if (deleteError) {
            logger.error(`[ETL Step 4 - Load] Gagal membersihkan data lama: ${deleteError.message}`);
            throw deleteError;
        }
        logger.info(`[ETL Step 4 - Load] ✅ Pembersihan data lama berhasil.`);

        // --- 4. Muat data ke Supabase ---
        const loadResult = await loadVectorizedChunksToSupabase(allChunks);

        if (!loadResult.success) {
            throw loadResult.error || new Error(loadResult.message);
        }

        logger.info(`\n[ETL Step 4 - Load] ✅ Proses ETL Langkah 4 selesai. Total ${loadResult.data.length} chunk dimuat.`);

    } catch (error) {
        logger.error('[ETL Step 4 - Load] Terjadi kesalahan fatal dalam proses ETL Langkah 4:', error);
        process.exit(1); // Hentikan proses jika ada error kritis
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runLoadToSupabase().catch(console.error);
}

// --- Eksport fungsi untuk digunakan oleh script lain ---
export { loadVectorizedChunksToSupabase };