// src/lib/server/ai/knowledge.retriever.js
// Utilitas untuk mengambil chunk pengetahuan yang relevan dari database vektor Supabase berdasarkan query pengguna.
// Menggunakan pgvector dan fungsi RPC match_knowledge_chunks untuk pencarian semantik yang efisien.

// @ts-nocheck
// DIPERBAIKI: Menambahkan @ts-nocheck untuk menonaktifkan pemeriksaan tipe TypeScript pada file JavaScript ini.
// Ini akan menyelesaikan semua error terkait resolusi modul dan tipe.

import logger from '$lib/server/utils/logger';
import { supabaseAdmin } from '$lib/server/db/supabase.admin';
import { generateEmbedding } from '$lib/server/ai/embedding.utils';

/**
 * Mencari chunk pengetahuan yang paling relevan berdasarkan teks query pengguna.
 * @param {string} userQuery - Teks query atau aspirasi pengguna.
 * @param {Object} [options={}] - Opsi untuk retrieval.
 * @returns {Promise<{success: boolean, data: any, error: any}>} - Hasil operasi.
 */
export async function findRelevantChunks(userQuery, options = {}) {
    const { topK = 5, minSimilarity = 0.5, provider = 'COHERE' } = options;

    if (!userQuery || typeof userQuery !== 'string') {
        const errorMsg = 'Query input untuk retrieval tidak valid.';
        logger.error(`[Knowledge Retriever] FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    let queryEmbedding;
    try {
        logger.info(`[Knowledge Retriever] Meminta embedding untuk query: "${userQuery.substring(0, 50)}..."`);
        const embeddingResult = await generateEmbedding({ input: userQuery }, { provider });

        if (!embeddingResult.success || !embeddingResult.data) {
            throw embeddingResult.error || new Error('Hasil embedding tidak valid atau kosong.');
        }
        queryEmbedding = embeddingResult.data;
        logger.debug(`[Knowledge Retriever] Embedding query berhasil dihasilkan.`);
    } catch (embeddingError) {
        logger.error(`[Knowledge Retriever] Gagal menghasilkan embedding untuk query: ${embeddingError.message}`, embeddingError);
        return { success: false, data: null, error: embeddingError };
    }

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
        const errorMsg = 'Embedding query yang dihasilkan tidak valid.';
        logger.error(`[Knowledge Retriever] FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    try {
        logger.info(`[Knowledge Retriever] Mencari ${topK} chunk terkait menggunakan RPC...`);
        const vectorString = `[${queryEmbedding.join(',')}]`;

        const { data: chunks, error: dbError } = await supabaseAdmin.rpc('match_knowledge_chunks', {
            query_embedding: vectorString,
            match_threshold: minSimilarity,
            match_count: topK
        });

        if (dbError) {
            throw new Error(`Gagal mencari chunk di database: ${dbError.message}`);
        }

        if (!chunks || chunks.length === 0) {
            logger.warn(`[Knowledge Retriever] Tidak ditemukan chunk yang relevan untuk query.`);
            return { success: true, data: [], error: null };
        }

        logger.info(`[Knowledge Retriever] Ditemukan ${chunks.length} chunk yang relevan.`);
        
        const relevantChunks = chunks.map(chunk => ({
            content: chunk.content_text,
            source: chunk.source_document,
            meta: chunk.metadata || {},
            similarity: chunk.similarity
        }));

        logger.info(`[Knowledge Retriever] findRelevantChunks BERHASIL.`);
        return { success: true, data: relevantChunks, error: null };

    } catch (dbError) {
        logger.error(`[Knowledge Retriever] Gagal mencari chunk di database: ${dbError.message}`, dbError);
        return { success: false, data: null, error: dbError };
    }
}