// src/scripts/etl/2-chunk-text.js
// Script untuk memecah teks panjang menjadi potongan-potongan kecil (chunks) yang dapat dimengerti oleh model AI embedding.
// Digunakan dalam pipeline ETL untuk mempersiapkan data pengetahuan dari dokumen ITS.

import fs from 'fs/promises';
import path from 'path';
import logger from '$lib/server/utils/logger';

// --- Konfigurasi ---
const PROCESSED_DATA_DIR = path.join(process.cwd(), 'src', 'lib', 'data', 'processed');
const CHUNKED_OUTPUT_DIR = path.join(process.cwd(), 'src', 'lib', 'data', 'chunked');
const CHUNKING_CONFIG = {
    maxSize: 1000, // Maksimal karakter per chunk
    overlap: 100  // Jumlah karakter yang tumpang tindih antar chunk
};

/**
 * Membagi teks panjang menjadi potongan-potongan kecil (chunks).
 * @param {string} text - Teks yang akan di-chunk.
 * @param {Object} [config=CHUNKING_CONFIG] - Konfigurasi chunking.
 * @returns {Array<string>} - Array berisi potongan-potongan teks.
 */
function chunkText(text, config = CHUNKING_CONFIG) {
    const { maxSize, overlap } = config;
    if (!text || typeof text !== 'string') {
        logger.warn('[ETL Chunk Text] Teks input tidak valid untuk chunking.');
        return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        let end = Math.min(start + maxSize, text.length);
        let chunk = text.substring(start, end);

        // Jika bukan chunk terakhir dan overlap diinginkan
        if (end < text.length && overlap > 0) {
            // Temukan batas kata terdekat ke akhir chunk untuk menghindari memotong kata
            const lastSpaceIndex = chunk.lastIndexOf(' ', maxSize - overlap);
            if (lastSpaceIndex > 0) {
                chunk = chunk.substring(0, lastSpaceIndex);
                end = start + chunk.length;
            }
            start = end - overlap;
        } else {
            start = end;
        }

        const trimmedChunk = chunk.trim();
        if (trimmedChunk) {
            chunks.push(trimmedChunk);
        }
    }

    logger.info(`[ETL Chunk Text] Teks berhasil di-chunk menjadi ${chunks.length} potongan.`);
    return chunks;
}

/**
 * Fungsi utama untuk menjalankan proses chunking terhadap file JSON yang berisi teks.
 */
async function runChunking() {
    logger.info('[ETL Step 2] Memulai proses chunking teks...');

    try {
        // Pastikan folder output ada
        await fs.mkdir(CHUNKED_OUTPUT_DIR, { recursive: true });

        // Baca file data yang diproses dari direktori processed
        const processedFiles = await fs.readdir(PROCESSED_DATA_DIR);
        const jsonFiles = processedFiles.filter(file => path.extname(file) === '.json');

        if (jsonFiles.length === 0) {
            logger.warn('[ETL Step 2] Tidak ada file JSON ditemukan di folder processed.');
            return;
        }

        logger.info(`[ETL Step 2] Ditemukan ${jsonFiles.length} file JSON untuk di-chunk.`);

        // Array untuk menyimpan semua chunk dari semua file
        let allChunks = [];

        // Proses setiap file JSON
        for (const file of jsonFiles) {
            const filePath = path.join(PROCESSED_DATA_DIR, file);
            logger.info(`\n[ETL Step 2] Memproses file: ${file}`);

            try {
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const jsonData = JSON.parse(fileContent);

                // Asumsikan struktur file JSON memiliki field `content_text` atau `html_content`
                // Sesuaikan logika ini jika struktur file berbeda
                let textToChunk = '';
                if (jsonData.content_text) {
                    textToChunk = jsonData.content_text;
                } else if (jsonData.html_content) {
                     // Jika file berisi HTML, Anda mungkin perlu mengekstrak teksnya terlebih dahulu
                     // Untuk sekarang, kita chunk HTML langsung.
                     // Di produksi, pertimbangkan untuk menggunakan library seperti `cheerio` atau `jsdom`.
                    textToChunk = jsonData.html_content;
                } else {
                    // Jika struktur tidak sesuai, log dan lewati
                    logger.warn(`[ETL Step 2] File ${file} tidak memiliki field 'content_text' atau 'html_content'. Melewati.`);
                    continue;
                }

                if (!textToChunk || typeof textToChunk !== 'string') {
                    logger.warn(`[ETL Step 2] Konten untuk ${file} tidak valid (kosong/bukan string). Melewati.`);
                    continue;
                }

                // Panggil fungsi chunking untuk teks ini
                const fileChunks = chunkText(textToChunk, CHUNKING_CONFIG);

                // Tambahkan metadata ke setiap chunk
                const chunksWithMetadata = fileChunks.map((chunkText, index) => ({
                    id: `${path.parse(file).name}_chunk_${index + 1}`,
                    source_document: file,
                    content_text: chunkText,
                    chunk_metadata: {
                        original_file_size: textToChunk.length,
                        chunk_index: index + 1,
                        total_chunks: fileChunks.length,
                        chunking_strategy: 'fixed_size_with_overlap'
                    }
                }));

                // Tambahkan chunk file ini ke array gabungan
                allChunks = [...allChunks, ...chunksWithMetadata];

                logger.info(`[ETL Step 2] File ${file} berhasil di-chunk. Jumlah chunk: ${fileChunks.length}`);

            } catch (fileError) {
                logger.error(`[ETL Step 2] Gagal memproses file ${file}: ${fileError.message}`, fileError);
                // Lanjutkan ke file berikutnya
            }
        }

        // Simpan hasil chunking ke file JSON
        const outputFilePath = path.join(CHUNKED_OUTPUT_DIR, 'chunked_knowledge_base.json');
        await fs.writeFile(outputFilePath, JSON.stringify(allChunks, null, 2));
        logger.info(`\n[ETL Step 2] Chunking selesai. Total chunk yang dihasilkan: ${allChunks.length}`);
        logger.info(`[ETL Step 2] Data chunk disimpan di: ${outputFilePath}`);

    } catch (error) {
        logger.error('[ETL Step 2] Terjadi kesalahan fatal dalam proses chunking:', error);
        process.exit(1);
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runChunking().catch(console.error);
}

// --- Eksport fungsi untuk digunakan oleh script lain ---
export { runChunking, chunkText };

// SARAN: LANJUTKAN KE FILE src/scripts/etl/3-vectorize-chunks.js