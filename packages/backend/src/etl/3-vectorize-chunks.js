// src/scripts/etl/3-vectorize-chunks.js
// Script untuk menghasilkan embedding vektor dari chunk pengetahuan menggunakan AI.
// Menggunakan ai.manager.js untuk orkestrasi dan fallback.

import fs from 'fs/promises';
import path from 'path';
import logger from '$lib/server/utils/logger';
import { callAI } from '$lib/server/ai/ai.manager'; // <<<<<<<<< GUNAKAN ai.manager.js

// --- Konfigurasi ---
const CHUNKED_DATA_DIR = path.join(process.cwd(), 'src', 'lib', 'data', 'chunked');
const VECTORIZED_OUTPUT_DIR = path.join(process.cwd(), 'src', 'lib', 'data', 'vectorized');

// --- Fungsi Utilitas ---
/**
 * Membuat embedding vektor untuk satu teks menggunakan AI.
 * @param {string} text - Teks yang akan di-embed.
 * @param {Object} [options={}] - Opsi untuk embedding.
 * @param {string} [options.provider='DEEPSEEK'] - Penyedia AI untuk embedding.
 * @param {string} [options.model] - Model AI untuk embedding (akan diatur oleh ai.manager.js).
 * @returns {Promise<{success: boolean, data: any, error: any}>} - Hasil operasi.
 */
async function createEmbeddingWithAI(text, options = {}) {
    const { provider = 'DEEPSEEK', model } = options; // <<<<<<<<< PROVIDER DEFAULT

    if (!text || typeof text !== 'string') {
        const errorMsg = 'Teks input untuk embedding tidak valid.';
        logger.error(`[ETL Step 3 - Vectorize] createEmbeddingWithAI FAILED: ${errorMsg}`);
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    try {
        logger.debug(`[ETL Step 3 - Vectorize] Memanggil AI (${provider}) untuk membuat embedding... (Text length: ${text.length} chars)`);

        // --- Siapkan payload untuk AI ---
        const embeddingPayload = {
            input: text,
            model: model || 'text-embedding-ada-002', // <<<<<<<<< MODEL DEFAULT (akan diabaikan oleh ai.manager.js jika routing ada)
            encoding_format: 'float'
        };

        // --- Siapkan opsi untuk callAI ---
        const embeddingOptions = {
            provider: provider, // <<<<<<<<< PROVIDER YANG DIGUNAKAN
            model: model || 'text-embedding-ada-002'
        };

        // --- Panggil AI dengan orkestrasi ---
        const aiResult = await callAI('embedding', embeddingPayload, embeddingOptions); // <<<<<<<<< GUNAKAN callAI

        if (!aiResult.success) {
            throw aiResult.error || new Error(aiResult.message);
        }

        // --- Ekstrak vektor dari respons AI ---
        // Struktur respons tergantung pada penyedia (misalnya, OpenAI: data?.data?.[0]?.embedding)
        const embeddingVector = aiResult.data?.data?.[0]?.embedding; // <<<<<<<<< SESUAIKAN DENGAN STRUKTUR RESPON

        if (!embeddingVector || !Array.isArray(embeddingVector)) {
            logger.error('[ETL Step 3 - Vectorize] Respons AI tidak sesuai atau tidak mengandung vektor embedding yang valid.', aiResult.data);
            throw new Error('Respons AI tidak mengandung vektor embedding yang valid.');
        }

        logger.debug(`[ETL Step 3 - Vectorize] Embedding berhasil dibuat. Dimensi: ${embeddingVector.length}`);
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: true, data: embeddingVector, error: null };

    } catch (error) {
        logger.error(`[ETL Step 3 - Vectorize] Gagal membuat embedding untuk teks (panjang: ${text.length} chars): ${error.message}`, error);
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: false, data: null, error: error };
    }
}

/**
 * Fungsi utama untuk menjalankan proses vectorisasi terhadap semua chunk.
 */
export async function runVectorization() {
    logger.info('[ETL Step 3 - Vectorize] Memulai proses vectorisasi knowledge chunks...');

    try {
        // Pastikan folder output ada
        await fs.mkdir(VECTORIZED_OUTPUT_DIR, { recursive: true });

        // Baca data chunk dari file JSON
        logger.info(`[ETL Step 3 - Vectorize] Membaca chunk dari: ${CHUNKED_DATA_DIR}`);
        const chunkedDataFiles = await fs.readdir(CHUNKED_DATA_DIR);
        const jsonFiles = chunkedDataFiles.filter(file => path.extname(file) === '.json');

        if (jsonFiles.length === 0) {
            logger.warn('[ETL Step 3 - Vectorize] Tidak ada file JSON ditemukan di folder chunked.');
            // Buat file output kosong
            await fs.writeFile(path.join(VECTORIZED_OUTPUT_DIR, 'vectorized_knowledge_base.json'), JSON.stringify([], null, 2));
            return;
        }

        logger.info(`[ETL Step 3 - Vectorize] Ditemukan ${jsonFiles.length} file JSON untuk diproses.`);

        // Array untuk menyimpan semua chunk yang sudah divisualisasikan
        let allVectorizedChunks = [];

        // Proses setiap file JSON
        for (const file of jsonFiles) {
            const filePath = path.join(CHUNKED_DATA_DIR, file);
            logger.info(`\n[ETL Step 3 - Vectorize] Memproses file chunk: ${file}`);

            try {
                const chunkedDataString = await fs.readFile(filePath, 'utf-8');
                const chunkedChunks = JSON.parse(chunkedDataString);

                if (!Array.isArray(chunkedChunks) || chunkedChunks.length === 0) {
                    logger.warn(`[ETL Step 3 - Vectorize] File ${file} kosong atau bukan array. Melewati.`);
                    continue;
                }

                logger.info(`[ETL Step 3 - Vectorize] File ${file} berisi ${chunkedChunks.length} chunk.`);

                // Array untuk menyimpan chunk yang sudah divisualisasikan dari file ini
                const vectorizedChunksFromFile = [];

                // Counter untuk pelacakan
                let processedCount = 0;
                const totalChunks = chunkedChunks.length;

                // Proses setiap chunk dalam file
                for (const chunkItem of chunkedChunks) {
                    const { id, source_document, content_text, chunk_metadata } = chunkItem;
                    processedCount++;

                    logger.debug(`[ETL Step 3 - Vectorize] Memproses chunk ${processedCount}/${totalChunks}: ${id}`);

                    if (!content_text || typeof content_text !== 'string') {
                        logger.warn(`[ETL Step 3 - Vectorize] Konten teks untuk chunk ${id} tidak valid. Melewati.`);
                        continue; // Lewati chunk yang tidak valid
                    }

                    try {
                        // Panggil fungsi untuk membuat embedding menggunakan AI
                        // Gunakan DEEPSEEK sebagai penyedia default untuk embedding
                        const embeddingResult = await createEmbeddingWithAI(content_text, { provider: 'DEEPSEEK' }); // <<<<<<<<< GUNAKAN PROVIDER

                        if (!embeddingResult.success) {
                            throw embeddingResult.error || new Error(embeddingResult.message);
                        }

                        const embeddingVector = embeddingResult.data;

                        // Buat objek chunk baru dengan embedding
                        const vectorizedChunk = {
                            id: id,
                            source_document: source_document,
                            content_text: content_text,
                            content_embedding: embeddingVector, // <<<<<<<<< VEKTOR HASIL EMBEDDING
                            chunk_metadata: chunk_metadata,
                        };

                        // Tambahkan ke array hasil dari file ini
                        vectorizedChunksFromFile.push(vectorizedChunk);

                        logger.debug(`[ETL Step 3 - Vectorize] ✅ Chunk ${id} berhasil divisualisasikan.`);

                        // Tambahkan delay kecil untuk menghindari rate limit API (opsional tapi disarankan)
                        // await new Promise(resolve => setTimeout(resolve, 100)); // Delay 100ms

                    } catch (chunkError) {
                        // Jika gagal membuat embedding untuk satu chunk, log dan lanjutkan ke chunk berikutnya
                        logger.error(`[ETL Step 3 - Vectorize] ❌ Gagal memproses chunk ${id}: ${chunkError.message}`, chunkError);
                        // Anda bisa memilih untuk menghentikan seluruh proses jika satu chunk gagal:
                        // throw new Error(`Proses dihentikan karena gagal memproses chunk ${id}: ${chunkError.message}`);
                    }
                }

                // Gabungkan chunk yang sudah divisualisasikan dari file ini ke array gabungan
                allVectorizedChunks = [...allVectorizedChunks, ...vectorizedChunksFromFile];
                logger.info(`[ETL Step 3 - Vectorize] File ${file} selesai diproses. ${vectorizedChunksFromFile.length} chunk berhasil divisualisasikan.`);

            } catch (fileError) {
                logger.error(`[ETL Step 3 - Vectorize] Gagal memproses file ${file}: ${fileError.message}`, fileError);
                // Lanjutkan ke file berikutnya
            }
        }

        // Simpan hasil vectorisasi ke file JSON
        logger.info(`\n[ETL Step 3 - Vectorize] Menyimpan hasil vectorisasi ke: ${VECTORIZED_OUTPUT_DIR}`);
        const outputFilePath = path.join(VECTORIZED_OUTPUT_DIR, 'vectorized_knowledge_base.json');
        await fs.writeFile(outputFilePath, JSON.stringify(allVectorizedChunks, null, 2));
        logger.info(`[ETL Step 3 - Vectorize] ✅ Proses vectorisasi selesai. Total chunk yang berhasil divisualisasikan: ${allVectorizedChunks.length}`);

    } catch (error) {
        logger.error('[ETL Step 3 - Vectorize] Terjadi kesalahan fatal dalam proses vectorisasi:', error);
        process.exit(1); // Hentikan proses jika ada error kritis
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runVectorization().catch(console.error);
}

// --- Eksport fungsi untuk digunakan oleh script lain ---
export { createEmbeddingWithAI };