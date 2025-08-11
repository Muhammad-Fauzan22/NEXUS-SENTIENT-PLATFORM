// packages/backend/src/utils/ai.manager.cjs
// Manajer Orkestrasi AI untuk skrip backend.
// Menangani routing tugas, fallback, dan pooling key.

const logger = require('./logger.cjs');

// Memuat API keys langsung dari environment variables
const {
    CLAUDE_API_KEY,
    GEMINI_API_KEY,
    PERPLEXITY_API_KEY,
    OPENAI_API_KEY,
    DEEPSEEK_API_KEYS,
    COHERE_API_KEYS
} = process.env;

// --- 1. Konfigurasi Routing Tugas & Fallback ---
const TASK_ROUTING_CONFIG = {
    embedding: {
        primary: { provider: 'COHERE', model: 'embed-multilingual-v3.0' },
        fallback: [
            { provider: 'OPENAI', model: 'text-embedding-3-small' }
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

async function callClaude(payload, modelOverride) {
    if (!CLAUDE_API_KEY) {
        return { success: false, data: null, error: new Error('[AI Manager] CLAUDE_API_KEY tidak ditemukan.') };
    }
    const model = modelOverride || 'claude-3-5-sonnet-20240620';
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    const headers = {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
    };
    logger.debug(`[AI Manager] Memanggil Claude (${model})...`);
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ...payload, model: model })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] Claude (${model}) panggilan BERHASIL.`);
        return { success: true, data, error: null };
    } catch (error) {
        logger.error(`[AI Manager] Claude (${model}) panggilan GAGAL: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}

async function callDeepSeek(payload, modelOverride) {
    const keys = DEEPSEEK_API_KEYS ? DEEPSEEK_API_KEYS.split(',') : [];
    if (keys.length === 0) {
        return { success: false, data: null, error: new Error('[AI Manager] Tidak ada API key DeepSeek yang tersedia.') };
    }
    const apiKey = keys[deepseekKeyIndex];
    deepseekKeyIndex = (deepseekKeyIndex + 1) % keys.length;

    const model = modelOverride || 'deepseek-chat';
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    logger.debug(`[AI Manager] Memanggil DeepSeek (${model})...`);
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ...payload, model: model })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] DeepSeek (${model}) panggilan BERHASIL.`);
        return { success: true, data, error: null };
    } catch (error) {
        logger.error(`[AI Manager] DeepSeek (${model}) panggilan GAGAL: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}

async function callCohere(payload, modelOverride) {
    const keys = COHERE_API_KEYS ? COHERE_API_KEYS.split(',') : [];
    if (keys.length === 0) {
        return { success: false, data: null, error: new Error('[AI Manager] Tidak ada API key Cohere yang tersedia.') };
    }
    const apiKey = keys[cohereKeyIndex];
    cohereKeyIndex = (cohereKeyIndex + 1) % keys.length;

    const model = modelOverride || 'command-r-plus';
    // For embedding tasks, the payload structure is different
    const isEmbedding = payload.input && typeof payload.input === 'string';
    const apiUrl = isEmbedding ? 'https://api.cohere.ai/v1/embed' : 'https://api.cohere.ai/v1/chat';
    
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    logger.debug(`[AI Manager] Memanggil Cohere (${model}) untuk ${isEmbedding ? 'embedding' : 'chat'}...`);
    
    try {
        let body;
        if (isEmbedding) {
            body = JSON.stringify({
                texts: [payload.input], // Cohere embedding expects a "texts" array
                model: model,
                input_type: 'search_document',
                embedding_types: ['float']
            });
        } else {
             body = JSON.stringify({
                model: model,
                message: payload.messages[payload.messages.length - 1].content,
                chat_history: payload.messages.slice(0, -1).map(m => ({ role: m.role.toUpperCase(), message: m.content })),
            });
        }

        const response = await fetch(apiUrl, { method: 'POST', headers, body });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] Cohere (${model}) panggilan BERHASIL.`);
        return { success: true, data, error: null };
    } catch (error) {
        logger.error(`[AI Manager] Cohere (${model}) panggilan GAGAL: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}

// --- Placeholder functions for other providers to ensure script runs ---
async function callGemini(payload, modelOverride) {
    logger.warn(`[AI Manager] GEMINI (${modelOverride}) tidak diimplementasikan di skrip ini. Melewati.`);
    return { success: false, data: null, error: new Error('Not implemented') };
}

async function callPerplexity(payload, modelOverride) {
    logger.warn(`[AI Manager] PERPLEXITY (${modelOverride}) tidak diimplementasikan di skrip ini. Melewati.`);
    return { success: false, data: null, error: new Error('Not implemented') };
}

async function callOpenAI(payload, modelOverride) {
    const isEmbedding = payload.input && typeof payload.input === 'string';
    const model = modelOverride || (isEmbedding ? 'text-embedding-3-small' : 'gpt-4-turbo');
    
    if (!OPENAI_API_KEY) {
        return { success: false, data: null, error: new Error('[AI Manager] OPENAI_API_KEY tidak ditemukan.') };
    }
    
    const apiUrl = isEmbedding ? 'https://api.openai.com/v1/embeddings' : 'https://api.openai.com/v1/chat/completions';
    const headers = { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' };
    logger.debug(`[AI Manager] Memanggil OpenAI (${model})...`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ...payload, model: model })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        logger.info(`[AI Manager] OpenAI (${model}) panggilan BERHASIL.`);
        return { success: true, data, error: null };
    } catch (error) {
        logger.error(`[AI Manager] OpenAI (${model}) panggilan GAGAL: ${error.message}`, error);
        return { success: false, data: null, error };
    }
}


// --- 4. Fungsi Utama Orkestrasi AI ---
async function callAI(task, payload, options = {}) {
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

module.exports = { callAI };
