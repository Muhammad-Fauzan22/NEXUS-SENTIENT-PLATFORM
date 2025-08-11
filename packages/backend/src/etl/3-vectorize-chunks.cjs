// packages/backend/src/etl/3-vectorize-chunks.js
// Script untuk menghasilkan embedding vektor dari chunk pengetahuan menggunakan AI.
// Menggunakan ai.manager.js untuk orkestrasi dan fallback.

const fs = require('fs/promises');
const path = require('path');
const logger = require('../utils/logger.cjs');
const { callAI } = require('../utils/ai.manager.cjs');

// --- Konfigurasi ---
const CHUNKED_DATA_DIR = path.join(process.cwd(), 'data', 'chunked');
const VECTORIZED_OUTPUT_DIR = path.join(process.cwd(), 'data', 'vectorized');

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
    const { provider = 'DEEPSEEK', model } = options;

    if (!text || typeof text !== 'string') {
        const errorMsg = 'Teks input untuk embedding tidak valid.';
        logger.error(`[ETL Step 3 - Vectorize] createEmbeddingWithAI FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    try {
        logger.debug(`[ETL Step 3 - Vectorize] Memanggil AI (${provider}) untuk membuat embedding... (Text length: ${text.length} chars)`);

        const embeddingPayload = {
            input: text,
            model: model || 'text-embedding-ada-002',
            encoding_format: 'float'
        };

        const embeddingOptions = {
            provider: provider,
            model: model
        };

        const aiResult = await callAI('embedding', embeddingPayload, embeddingOptions);

        if (!aiResult.success) {
            throw aiResult.error || new Error(aiResult.message);
        }

        // Struktur respons Cohere: data.embeddings[0]
        // Struktur respons OpenAI: data.data[0].embedding
        const embeddingVector = aiResult.data?.embeddings?.[0] || aiResult.data?.data?.[0]?.embedding;

        if (!embeddingVector || !Array.isArray(embeddingVector)) {
            logger.error('[ETL Step 3 - Vectorize] Respons AI tidak sesuai atau tidak mengandung vektor embedding yang valid.', aiResult.data);
            throw new Error('Respons AI tidak mengandung vektor embedding yang valid.');
        }

        logger.debug(`[ETL Step 3 - Vectorize] Embedding berhasil dibuat. Dimensi: ${embeddingVector.length}`);
        return { success: true, data: embeddingVector, error: null };

    } catch (error) {
        logger.error(`[ETL Step 3 - Vectorize] Gagal membuat embedding untuk teks (panjang: ${text.length} chars): ${error.message}`, error);
        return { success: false, data: null, error: error };
    }
}

/**
 * Fungsi utama untuk menjalankan proses vectorisasi terhadap semua chunk.
 */
async function runVectorization() {
    logger.info('[ETL Step 3 - Vectorize] Memulai proses vectorisasi knowledge chunks...');

    try {
        await fs.mkdir(VECTORIZED_OUTPUT_DIR, { recursive: true });

        logger.info(`[ETL Step 3 - Vectorize] Membaca chunk dari: ${CHUNKED_DATA_DIR}`);
        const chunkedDataFiles = await fs.readdir(CHUNKED_DATA_DIR);
        const jsonFiles = chunkedDataFiles.filter(file => path.extname(file) === '.json');

        if (jsonFiles.length === 0) {
            logger.warn('[ETL Step 3 - Vectorize] Tidak ada file JSON ditemukan di folder chunked.');
            await fs.writeFile(path.join(VECTORIZED_OUTPUT_DIR, 'vectorized_knowledge_base.json'), JSON.stringify([], null, 2));
            return;
        }

        logger.info(`[ETL Step 3 - Vectorize] Ditemukan ${jsonFiles.length} file JSON untuk diproses.`);
        let allVectorizedChunks = [];

        for (const file of jsonFiles) {
            const filePath = path.join(CHUNKED_DATA_DIR, file);
            logger.info(`
[ETL Step 3 - Vectorize] Memproses file chunk: ${file}`);

            try {
                const chunkedDataString = await fs.readFile(filePath, 'utf-8');
                const chunkedChunks = JSON.parse(chunkedDataString);

                if (!Array.isArray(chunkedChunks) || chunkedChunks.length === 0) {
                    logger.warn(`[ETL Step 3 - Vectorize] File ${file} kosong atau bukan array. Melewati.`);
                    continue;
                }

                logger.info(`[ETL Step 3 - Vectorize] File ${file} berisi ${chunkedChunks.length} chunk.`);
                const vectorizedChunksFromFile = [];
                let processedCount = 0;
                const totalChunks = chunkedChunks.length;

                for (const chunkItem of chunkedChunks) {
                    const { id, source_document, content_text, chunk_metadata } = chunkItem;
                    processedCount++;
                    logger.debug(`[ETL Step 3 - Vectorize] Memproses chunk ${processedCount}/${totalChunks}: ${id}`);

                    if (!content_text || typeof content_text !== 'string') {
                        logger.warn(`[ETL Step 3 - Vectorize] Konten teks untuk chunk ${id} tidak valid. Melewati.`);
                        continue;
                    }

                    try {
                        // Coba dengan primary provider (Cohere), lalu fallback (OpenAI)
                        const embeddingResult = await createEmbeddingWithAI(content_text);

                        if (!embeddingResult.success) {
                            throw embeddingResult.error || new Error('Gagal membuat embedding setelah mencoba semua provider.');
                        }

                        const vectorizedChunk = {
                            id: id,
                            source_document: source_document,
                            content_text: content_text,
                            content_embedding: embeddingResult.data,
                            chunk_metadata: chunk_metadata,
                        };

                        vectorizedChunksFromFile.push(vectorizedChunk);
                        logger.debug(`[ETL Step 3 - Vectorize] ✅ Chunk ${id} berhasil divectorisasi.`);

                    } catch (chunkError) {
                        logger.error(`[ETL Step 3 - Vectorize] ❌ Gagal memproses chunk ${id}: ${chunkError.message}`, chunkError);
                    }
                }

                allVectorizedChunks = [...allVectorizedChunks, ...vectorizedChunksFromFile];
                logger.info(`[ETL Step 3 - Vectorize] File ${file} selesai diproses. ${vectorizedChunksFromFile.length} chunk berhasil divectorisasi.`);

            } catch (fileError) {
                logger.error(`[ETL Step 3 - Vectorize] Gagal memproses file ${file}: ${fileError.message}`, fileError);
            }
        }

        logger.info(`
[ETL Step 3 - Vectorize] Menyimpan hasil vectorisasi ke: ${VECTORIZED_OUTPUT_DIR}`);
        const outputFilePath = path.join(VECTORIZED_OUTPUT_DIR, 'vectorized_knowledge_base.json');
        await fs.writeFile(outputFilePath, JSON.stringify(allVectorizedChunks, null, 2));
        logger.info(`[ETL Step 3 - Vectorize] ✅ Proses vectorisasi selesai. Total chunk yang berhasil divectorisasi: ${allVectorizedChunks.length}`);

    } catch (error) {
        logger.error('[ETL Step 3 - Vectorize] Terjadi kesalahan fatal dalam proses vectorisasi:', error);
        process.exit(1);
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runVectorization().catch(console.error);
}

// --- Eksport fungsi untuk digunakan oleh script lain ---
module.exports = { createEmbeddingWithAI, runVectorization };
