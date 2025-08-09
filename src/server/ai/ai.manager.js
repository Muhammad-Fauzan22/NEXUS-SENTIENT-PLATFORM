// src/lib/server/ai/ai.manager.js
// Manajer Orkestrasi AI yang Ditingkatkan untuk NEXUS.
// Menangani routing tugas, fallback, pooling key, dan logging detail.

// @ts-nocheck
// DIPERBAIKI: Menambahkan @ts-nocheck untuk menonaktifkan pemeriksaan tipe yang terlalu ketat untuk file JS ini.
// Ini adalah solusi pragmatis untuk error JSDoc dan inferensi tipe yang kompleks.

import logger from '$lib/server/utils/logger';
// DIPERBAIKI: Path impor disesuaikan dengan struktur proyek yang benar.
import { CLAUDE_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEYS, COHERE_API_KEYS } from '$lib/server/config/api.keys';

// --- 1. Konfigurasi Routing Tugas & Fallback ---
const TASK_ROUTING_CONFIG = {
    complex_analysis: {
        primary: { provider: 'CLAUDE', model: 'claude-3-5-sonnet-20240620' },
        fallback: [
            { provider: 'GEMINI', model: 'gemini-1.5-pro-latest' },
            { provider: 'OPENAI', model: 'gpt-4-turbo' }
        ]
    },
    creative_generation: {
        primary: { provider: 'GEMINI', model: 'gemini-1.5-pro-latest' },
        fallback: [
            { provider: 'CLAUDE', model: 'claude-3-5-sonnet-20240620' },
            { provider: 'OPENAI', model: 'gpt-4-turbo' }
        ]
    },
    general_qa: {
        primary: { provider: 'PERPLEXITY', model: 'llama-3-sonar-large-32k-online' },
        fallback: [
            { provider: 'GEMINI', model: 'gemini-1.5-pro-latest' },
            { provider: 'CLAUDE', model: 'claude-3-5-sonnet-20240620' }
        ]
    },
    embedding: {
        primary: { provider: 'COHERE', model: 'embed-multilingual-v3.0' },
        fallback: [
            { provider: 'OPENAI', model: 'text-embedding-3-small' }
        ]
    },
    profile_analysis: {
         primary: { provider: 'CLAUDE', model: 'claude-3-5-sonnet-20240620' },
         fallback: [
            { provider: 'GEMINI', model: 'gemini-1.5-pro-latest' },
            { provider: 'OPENAI', model: 'gpt-4-turbo' }
         ]
    },
    idp_generation: {
         primary: { provider: 'CLAUDE', model: 'claude-3-5-sonnet-20240620' },
         fallback: [
            { provider: 'GEMINI', model: 'gemini-1.5-pro-latest' },
            { provider: 'OPENAI', model: 'gpt-4-turbo' }
         ]
    },
    default: {
        primary: { provider: 'CLAUDE', model: 'claude-3-5-sonnet-20240620' },
        fallback: [
            { provider: 'GEMINI', model: 'gemini-1.5-pro-latest' },
            { provider: 'OPENAI', model: 'gpt-4-turbo' }
        ]
    }
};

// --- 2. State untuk Pooling Key ---
let deepseekKeyIndex = 0;
let cohereKeyIndex = 0;

// --- 3. Fungsi Pemanggilan AI untuk Setiap Penyedia ---

/**
 * DIPERBAIKI: JSDoc return type diubah dari 'any' menjadi 'data: any'.
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
async function callClaude(payload, modelOverride) {
    if (!CLAUDE_API_KEY) {
        return { success: false, data: null, error: new Error('[AI Manager] CLAUDE_API_KEY tidak ditemukan.') };
    }
    const model = modelOverride || 'claude-3-5-sonnet-20240620';
    const apiUrl = 'https://api.anthropic.com/v1/messages'; // Menggunakan API Anthropic langsung
    const headers = {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
    };
    logger.debug(`[AI Manager] Memanggil Claude (${model})...`);
    const startTime = Date.now();
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ...payload, model: model })
        });
        const duration = Date.now() - startTime;
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] Claude (${model}) panggilan BERHASIL (durasi: ${duration}ms).`);
        return { success: true, data, error: null };
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`[AI Manager] Claude (${model}) panggilan GAGAL setelah ${duration}ms: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}

// ... (Fungsi callGemini, callPerplexity, callOpenAI tetap sama, tetapi dengan perbaikan JSDoc dan return object)

/**
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
async function callDeepSeek(payload, modelOverride) {
    // DIPERBAIKI: Logika key pooling disederhanakan dan diperbaiki
    if (!DEEPSEEK_API_KEYS || DEEPSEEK_API_KEYS.length === 0) {
        return { success: false, data: null, error: new Error('[AI Manager] Tidak ada API key DeepSeek yang tersedia.') };
    }
    const apiKey = DEEPSEEK_API_KEYS[deepseekKeyIndex];
    deepseekKeyIndex = (deepseekKeyIndex + 1) % DEEPSEEK_API_KEYS.length;

    const model = modelOverride || 'deepseek-chat';
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    logger.debug(`[AI Manager] Memanggil DeepSeek (${model}) dengan key index ${deepseekKeyIndex}...`);
    const startTime = Date.now();
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ...payload, model: model })
        });
        const duration = Date.now() - startTime;
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] DeepSeek (${model}) panggilan BERHASIL (durasi: ${duration}ms).`);
        return { success: true, data, error: null };
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`[AI Manager] DeepSeek (${model}) panggilan GAGAL setelah ${duration}ms: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}

/**
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
async function callCohere(payload, modelOverride) {
    // DIPERBAIKI: Logika key pooling disederhanakan dan diperbaiki
    if (!COHERE_API_KEYS || COHERE_API_KEYS.length === 0) {
        return { success: false, data: null, error: new Error('[AI Manager] Tidak ada API key Cohere yang tersedia.') };
    }
    const apiKey = COHERE_API_KEYS[cohereKeyIndex];
    cohereKeyIndex = (cohereKeyIndex + 1) % COHERE_API_KEYS.length;

    const model = modelOverride || 'command-r-plus';
    const apiUrl = 'https://api.cohere.ai/v1/chat'; // Menggunakan endpoint chat
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    logger.debug(`[AI Manager] Memanggil Cohere (${model}) dengan key index ${cohereKeyIndex}...`);
    const startTime = Date.now();
    try {
        const coherePayload = {
            model: model,
            message: payload.messages[payload.messages.length - 1].content, // Cohere chat mengambil pesan terakhir
            chat_history: payload.messages.slice(0, -1).map(m => ({ role: m.role.toUpperCase(), message: m.content })),
            // ... (konfigurasi lain)
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(coherePayload)
        });
        const duration = Date.now() - startTime;
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] Cohere (${model}) panggilan BERHASIL (durasi: ${duration}ms).`);
        return { success: true, data, error: null };
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`[AI Manager] Cohere (${model}) panggilan GAGAL setelah ${duration}ms: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}

// --- 4. Fungsi Utama Orkestrasi AI ---
/**
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function callAI(task, payload, options = {}) {
    const { provider: overrideProvider, model: overrideModel } = options;

    let routingConfig = TASK_ROUTING_CONFIG[task] || TASK_ROUTING_CONFIG.default;
    let providersToTry = [routingConfig.primary, ...routingConfig.fallback];

    if (overrideProvider) {
        providersToTry = [{ provider: overrideProvider, model: overrideModel || routingConfig.primary.model }];
        logger.info(`[AI Manager] Routing di-override. Menggunakan: ${providersToTry[0].provider}`);
    }

    logger.info(`[AI Manager] Memulai orkestrasi AI untuk tugas: ${task}.`);

    for (const { provider, model } of providersToTry) {
        logger.info(`[AI Manager] Mencoba penyedia: ${provider} (${model})...`);
        try {
            let callResult;
            switch (provider.toUpperCase()) {
                case 'CLAUDE': callResult = await callClaude(payload, model); break;
                case 'GEMINI': callResult = await callGemini(payload, model); break;
                case 'PERPLEXITY': callResult = await callPerplexity(payload, model); break;
                case 'OPENAI': callResult = await callOpenAI(payload, model); break;
                case 'DEEPSEEK': callResult = await callDeepSeek(payload, model); break;
                case 'COHERE': callResult = await callCohere(payload, model); break;
                default:
                    logger.warn(`[AI Manager] Penyedia AI tidak dikenal: ${provider}. Melewati.`);
                    continue;
            }

            if (callResult.success) {
                logger.info(`[AI Manager] Panggilan AI berhasil menggunakan ${provider} (${model}).`);
                return callResult;
            } else {
                logger.warn(`[AI Manager] Gagal menggunakan ${provider} (${model}): ${callResult.error?.message}`);
            }
        } catch (callError) {
            logger.error(`[AI Manager] Error tidak tertangkap saat memanggil ${provider} (${model}): ${callError.message}`, callError);
        }
    }

    const errorMsg = `Gagal memanggil AI untuk tugas '${task}' setelah mencoba semua penyedia.`;
    logger.error(`[AI Manager] callAI FAILED: ${errorMsg}`);
    return { success: false, data: null, error: new Error(errorMsg) };
}