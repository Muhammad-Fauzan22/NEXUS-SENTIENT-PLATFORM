import { env } from '$env/dynamic/private';
import { claudeProvider } from '$lib/server/ai/providers/claude';
import { geminiProvider } from '$lib/server/ai/providers/gemini';

// Mengelola pool API key
const deepseekKeys = JSON.parse(env.DEEPSEEK_API_KEYS || '[]');
const cohereKeys = JSON.parse(env.COHERE_API_KEYS || '[]');
let deepseekIndex = 0;
let cohereIndex = 0;

/**
 * @param {string[]} pool
 * @param {number} index
 * @returns {string|null}
 */
function getNextKey(pool, index) {
	if (pool.length === 0) return null;
	const key = pool[index];
	index = (index + 1) % pool.length;
	return key;
}

export const aiManager = {
	/**
