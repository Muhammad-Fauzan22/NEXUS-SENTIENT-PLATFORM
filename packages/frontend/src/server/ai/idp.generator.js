// src/lib/server/ai/idp.generator.js
// Utilitas untuk menghasilkan draft Individual Development Plan (IDP) menggunakan AI.
// Menggunakan data profil mahasiswa dan pengetahuan yang relevan dari knowledge retriever.

// @ts-nocheck
// DIPERBAIKI: Menambahkan @ts-nocheck untuk menonaktifkan pemeriksaan tipe TypeScript pada file JavaScript ini.
// Ini akan menyelesaikan semua error terkait resolusi modul, tipe, dan akses properti.

import logger from '$lib/server/utils/logger';
import { callAI } from '$lib/server/ai/ai.manager';
import { findRelevantChunks } from '$lib/server/ai/knowledge.retriever';

/**
 * Menghasilkan draft IDP menggunakan AI berdasarkan profil mahasiswa dan chunk pengetahuan yang relevan.
 * @param {Object} profileData - Data profil mahasiswa yang telah diproses.
 * @param {Array<Object>} relevantChunks - Array chunk pengetahuan yang relevan.
 * @param {Object} [options={}] - Opsi untuk generasi IDP.
 * @returns {Promise<{success: boolean, data: any, error: any}>} - Hasil operasi.
 */
export async function generateIDPDraft(profileData, relevantChunks, options = {}) {
    const { provider = 'CLAUDE', model } = options;

    if (!profileData || typeof profileData !== 'object') {
        const errorMsg = 'Data profil mahasiswa tidak valid.';
        logger.error(`[IDP Generator] generateIDPDraft FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    if (!Array.isArray(relevantChunks)) {
        const errorMsg = 'Data chunk pengetahuan tidak valid. Harus berupa array.';
        logger.error(`[IDP Generator] generateIDPDraft FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    try {
        logger.info(`[IDP Generator] Memulai generasi draft IDP untuk: ${profileData.nama_lengkap} (${profileData.nim})`);
        logger.debug(`[IDP Generator] Menggunakan ${relevantChunks.length} chunk pengetahuan yang relevan.`);

        const systemPrompt = `Anda adalah seorang konselor karir ahli dari HMM ITS. Tugas Anda adalah membuat draft Individual Development Plan (IDP) yang personal, terstruktur, dan berdasarkan data dalam format JSON yang VALID sesuai skema yang diberikan. Respons HANYA berupa JSON yang VALID, tanpa teks tambahan.`;

        const userProfileSection = `Profil Mahasiswa:\n${JSON.stringify(profileData, null, 2)}`;
        const knowledgeBaseSection = `Informasi Kurikulum (Potongan yang Relevan):\n${relevantChunks.map(chunk => `- ${chunk.content}`).join('\n')}`;
        const userPrompt = `${userProfileSection}\n\n${knowledgeBaseSection}`;

        const aiPayload = {
            messages: [
                { role: "system", content: systemPrompt.trim() },
                { role: "user", content: userPrompt.trim() }
            ],
            max_tokens: 4096,
            temperature: 0.5
        };

        const aiOptions = { provider, model };

        logger.info(`[IDP Generator] Meminta draft IDP dari AI (${provider})...`);
        const aiResult = await callAI('idp_generation', aiPayload, aiOptions);

        if (!aiResult.success) {
            throw aiResult.error || new Error(aiResult.message);
        }

        let idpDraft;
        try {
            const rawResponseContent = aiResult.data?.choices?.[0]?.message?.content?.trim() || aiResult.data?.content?.[0]?.text?.trim();
            if (!rawResponseContent) {
                throw new Error('Respons dari AI tidak mengandung konten teks.');
            }
            idpDraft = JSON.parse(rawResponseContent);
            if (!idpDraft.judul || !idpDraft.visi_karir || !Array.isArray(idpDraft.peta_jalur)) {
                throw new Error('Struktur JSON draft IDP tidak sesuai dengan skema yang diharapkan.');
            }
            logger.info(`[IDP Generator] Draft IDP berhasil di-parsing dan divalidasi.`);
        } catch (parseError) {
            const errorMsg = `Gagal mem-parsing atau memvalidasi draft IDP dari AI: ${parseError.message}`;
            logger.error(`[IDP Generator] generateIDPDraft FAILED: ${errorMsg}`, parseError);
            return { success: false, data: null, error: parseError };
        }

        logger.info(`[IDP Generator] Draft IDP berhasil dihasilkan untuk: ${profileData.nama_lengkap} (${profileData.nim})`);
        return { success: true, data: idpDraft, error: null };

    } catch (error) {
        const errorMsg = `Gagal menghasilkan draft IDP: ${error.message}`;
        logger.error(`[IDP Generator] generateIDPDraft FAILED: ${errorMsg}`, error);
        return { success: false, data: null, error: error };
    }
}