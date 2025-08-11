import { env } from '$env/dynamic/private';
import { callClaude } from './providers/claude.js';
import { callGemini } from './providers/gemini.js';
import { callPerplexity } from './providers/perplexity.js';
// Tambahkan impor untuk provider lain jika sudah Anda buat

// Mengelola pool API key
const deepseekKeys = JSON.parse(env.DEEPSEEK_API_KEYS || '[]');
const cohereKeys = JSON.parse(env.COHERE_API_KEYS || '[]');
let deepseekIndex = 0;
let cohereIndex = 0;

function getNextKey(pool, index) {
	if (pool.length === 0) return null;
	const key = pool[index];
	index = (index + 1) % pool.length;
	return key;
}

export const aiManager = {
	/**
	 * @param {'ANALYZE' | 'GENERATE_DRAFT' | 'SUMMARIZE' | 'EMBEDDING'} taskType
	 * @param {string} prompt
	 * @param {object} [options]
	 */
	async executeTask(taskType, prompt, options = {}) {
		console.log(`Executing AI task: ${taskType}`);

		switch (taskType) {
			case 'ANALYZE':
				// Gunakan model yang cepat dan baik dalam mengikuti instruksi
				return callGemini(prompt, env.GEMINI_API_KEY);

			case 'GENERATE_DRAFT':
				// Gunakan model terbaik untuk penulisan kreatif dan komprehensif
				return callClaude(prompt, env.CLAUDE_API_KEY);

			case 'SUMMARIZE':
				// Gunakan model yang efisien untuk tugas ringkasan
				const deepseekKey = getNextKey(deepseekKeys, deepseekIndex);
				if (!deepseekKey) throw new Error('No DeepSeek API keys available.');
				// Anda perlu membuat fungsi callDeepSeek di provider Anda
				// return callDeepSeek(prompt, deepseekKey);
				// Untuk sementara, kita fallback ke Gemini
				return callGemini(prompt, env.GEMINI_API_KEY);

			case 'EMBEDDING':
				// Cohere sangat baik untuk embedding
				const cohereKey = getNextKey(cohereKeys, cohereIndex);
				if (!cohereKey) throw new Error('No Cohere API keys available.');
				// Anda perlu membuat fungsi callCohereEmbedding di provider Anda
				// return callCohereEmbedding(prompt, cohereKey);
				// Untuk sementara, kita bisa gunakan provider lain jika belum ada
				throw new Error('Embedding provider not yet implemented.');

			default:
				throw new Error(`Unknown AI task type: ${taskType}`);
		}
	}
};