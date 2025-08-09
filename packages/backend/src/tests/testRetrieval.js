// src/scripts/tests/testRetrieval.js
// Skrip pengujian mandiri untuk menguji fungsi retrieval pengetahuan dari knowledge base vektor.
// Menggunakan knowledge.retriever.js untuk mencari chunk yang relevan berdasarkan query teks.
// Jalankan dengan: node src/scripts/tests/testRetrieval.js

import logger from '$lib/server/utils/logger';
import { findRelevantChunks } from '$lib/server/ai/knowledge.retriever';

/**
 * Fungsi utama untuk menjalankan pengujian retrieval pengetahuan.
 */
async function runTest() {
    logger.info('[Test Retrieval Script] Memulai pengujian fungsi knowledge.retriever.js...');

    // --- 1. Siapkan query uji coba ---
    const testQueries = [
        "Apa saja mata kuliah pilihan untuk minat di bidang energi?",
        "Kurikulum kepeminatan manufaktur mencakup materi apa saja?",
        "Bagaimana cara mengembangkan soft skill kepemimpinan?",
        "Rekomendasi kegiatan organisasi untuk mahasiswa semester 1?",
        "Apa itu TM184861 dan bagaimana penerapannya?",
        // Tambahkan query lain yang relevan dengan dokumen knowledge base Anda
    ];

    // --- 2. Iterasi dan uji setiap query ---
    for (const query of testQueries) {
        logger.info(`\n--- Mengujikan Query: "${query}" ---`);
        
        try {
            // --- 3. Panggil fungsi findRelevantChunks ---
            const retrievalOptions = {
                topK: 3, // Ambil 3 chunk teratas
                minSimilarity: 0.2, // Threshold kesamaan minimum
                provider: 'DEEPSEEK' // Penyedia AI untuk embedding query (akan diabaikan oleh ai.manager.js karena routing)
            };

            const result = await findRelevantChunks(query, retrievalOptions);

            // --- 4. Evaluasi hasil ---
            if (result.success) {
                logger.info(`✅ Retrieval BERHASIL. Ditemukan ${result.data.length} chunk:`);
                result.data.forEach((chunk, index) => {
                    logger.info(`  ${index + 1}. Sumber: ${chunk.source}`);
                    logger.info(`     Konten (50 chars): ${chunk.content.substring(0, 50)}...`);
                    logger.debug(`     Similarity: ${chunk.similarity}`); // Log detail similarity jika diperlukan
                });
            } else {
                logger.error(`❌ Retrieval GAGAL untuk query "${query}": ${result.error?.message || result.message}`);
            }

        } catch (error) {
            logger.error(`❌ Error tidak tertangkap saat menguji query "${query}": ${error.message}`, error);
        }
    }

    logger.info('\n[Test Retrieval Script] Pengujian retrieval pengetahuan selesai.');
}

// --- 5. Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runTest().catch(console.error);
}

// --- 6. Eksport fungsi untuk digunakan oleh skrip lain ---
export { runTest };

// SARAN: LANJUTKAN KE FILE src/scripts/tests/testIDPGeneration.js UNTUK MENGINTEGRASIKAN RETRIEVAL DENGAN GENERASI IDP MENGGUNAKAN AI