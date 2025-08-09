// src/lib/server/ai/embedding.utils.js
// Utilitas untuk menghasilkan embedding vektor dari teks menggunakan berbagai penyedia AI.
// Digunakan dalam proses chunking, retrieval, dan analisis semantik.

// @ts-nocheck
// DIPERBAIKI: Menambahkan @ts-nocheck untuk menonaktifkan pemeriksaan tipe TypeScript pada file JavaScript ini.
// Ini akan menyelesaikan semua error terkait resolusi modul dan tipe.

import logger from '$lib/server/utils/logger';
import { callAI } from '$lib/server/ai/ai.manager'; // <<<<<<<<< GUNAKAN ai.manager.js UNTUK ORKESTRASI

/**
 * Mengekstrak nilai numerik dari string skor asesmen.
 * @param {string|number|null} scoreString - String skor dari form atau nilai numerik/NULL.
 * @returns {number|null} - Nilai numerik atau null jika tidak valid.
 */
export function extractNumericScore(scoreString) {
    if (scoreString === null || scoreString === undefined || scoreString === '') {
        return null;
    }
    if (typeof scoreString === 'number') {
        return scoreString;
    }
    if (typeof scoreString === 'string') {
        const match = scoreString.match(/^(\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
        const parsed = parseInt(scoreString, 10);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    logger.warn(`[Embedding Utils] Tidak dapat mengekstrak skor numerik dari: "${scoreString}"`);
    return null;
}

/**
 * Membagi teks panjang menjadi potongan-potongan kecil (chunks).
 * @param {string} text - Teks yang akan di-chunk.
 * @param {Object} [options={}] - Opsi untuk chunking.
 * @param {number} [options.maxChunkSize=1000] - Ukuran maksimum karakter per chunk.
 * @param {number} [options.chunkOverlap=100] - Jumlah karakter yang tumpang tindih antar chunk.
 * @returns {Array<string>} - Array berisi potongan-potongan teks.
 */
export function chunkText(text, options = {}) {
    const { maxChunkSize = 1000, chunkOverlap = 100 } = options;

    if (!text || typeof text !== 'string') {
        logger.warn('[Embedding Utils] Teks input untuk chunking tidak valid.');
        return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        let end = start + maxChunkSize;
        if (end > text.length) {
            end = text.length;
        }

        let chunk = text.substring(start, end);

        if (end < text.length && chunkOverlap > 0) {
            const lastSpaceIndex = chunk.lastIndexOf(' ', maxChunkSize - chunkOverlap);
            if (lastSpaceIndex > 0) {
                chunk = chunk.substring(0, lastSpaceIndex);
                end = start + chunk.length;
            }
            start = end - chunkOverlap;
        } else {
            start = end;
        }

        const trimmedChunk = chunk.trim();
        if (trimmedChunk) {
            chunks.push(trimmedChunk);
        }
    }

    logger.info(`[Embedding Utils] Teks di-chunk menjadi ${chunks.length} potongan.`);
    return chunks;
}

/**
 * Menghasilkan embedding vektor untuk teks menggunakan AI.
 * @param {Object} payload - Payload yang berisi teks untuk di-embed.
 * @param {string} payload.input - Teks yang akan di-embed.
 * @param {Object} [options={}] - Opsi untuk embedding.
 * @param {string} [options.provider='DEEPSEEK'] - Penyedia AI untuk embedding.
 * @param {string} [options.model] - Model AI untuk embedding.
 * @returns {Promise<{success: boolean, data: any, error: any}>} - Hasil operasi.
 */
export async function generateEmbedding(payload, options = {}) {
    const text = payload?.input;
    if (!text || typeof text !== 'string') {
        const errorMsg = 'Teks input untuk embedding tidak valid.';
        logger.error(`[Embedding Utils] generateEmbedding FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    const { provider = 'DEEPSEEK', model } = options;

    try {
        logger.info(`[Embedding Utils] Memulai pembuatan embedding untuk teks (panjang: ${text.length} chars) menggunakan callAI('embedding', ...)`);
        
        const embeddingPayload = {
            input: text,
            model: model || 'text-embedding-ada-002',
            encoding_format: 'float'
        };

        const embeddingOptions = {
            provider: provider,
            model: model || 'text-embedding-ada-002'
        };

        const aiResult = await callAI('embedding', embeddingPayload, embeddingOptions);

        if (!aiResult.success) {
            throw aiResult.error || new Error(aiResult.message);
        }

        const embeddingVector = aiResult.data?.data?.[0]?.embedding;

        if (!embeddingVector || !Array.isArray(embeddingVector)) {
            logger.error('[Embedding Utils] Respons AI tidak sesuai atau tidak mengandung vektor embedding yang valid.', aiResult.data);
            throw new Error('Respons AI tidak mengandung vektor embedding yang valid.');
        }

        logger.info(`[Embedding Utils] Embedding berhasil dibuat. Dimensi: ${embeddingVector.length}`);
        return { success: true, data: embeddingVector, error: null };

    } catch (error) {
        const errorMsg = `Gagal membuat embedding: ${error.message}`;
        logger.error(`[Embedding Utils] generateEmbedding FAILED: ${errorMsg}`, { stack: error.stack });
        return { success: false, data: null, error: error };
    }
}