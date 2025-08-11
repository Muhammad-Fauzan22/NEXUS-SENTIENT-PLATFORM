import { claudeProvider } from './providers/claude';
import { geminiProvider } from './providers/gemini';
import { perplexityProvider } from './providers/perplexity';
import { logger } from '$lib/server/utils/logger';
import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';

// --- Key Pooling Utilities ---
// A simple in-memory counter for round-robin key selection.
const keyCounters: { [key: string]: number } = {
	deepseek: 0,
	cohere: 0
};

/**
 * Retrieves the next key from a comma-separated string of keys in a round-robin fashion.
 * @param keyPool The comma-separated string of API keys from the environment.
 * @param poolName The name of the pool to track the counter.
 * @returns The next API key to use.
 * @throws {Error} If the key pool is empty.
 */
function getKeyFromPool(keyPool: string, poolName: 'deepseek' | 'cohere'): string {
	const keys = keyPool.split(',').map(k => k.trim()).filter(Boolean);
	if (keys.length === 0) {
		const errorMessage = `No keys available in the ${poolName} API key pool.`;
		logger.error(errorMessage);
		throw new InternalServerError(errorMessage);
	}
	const index = keyCounters[poolName] % keys.length;
	keyCounters[poolName]++;
	return keys[index];
}

// --- AI Service ---

/**
 * A centralized service for interacting with various AI models.
 * It abstracts away the specific provider logic and handles errors consistently.
 */
export const aiService = {
	/**
	 * Calls the Claude model.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callClaude(prompt: string): Promise<string> {
		try {
			logger.info('Calling Claude provider');
			return await claudeProvider.generate(prompt);
		} catch (error) {
			logger.error('Claude provider failed', { originalError: error });
			throw error; // Propagate the standardized error
		}
	},

	/**
	 * Calls the Gemini model.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callGemini(prompt: string): Promise<string> {
		try {
			logger.info('Calling Gemini provider');
			return await geminiProvider.generate(prompt);
		} catch (error) {
			logger.error('Gemini provider failed', { originalError: error });
			throw error;
		}
	},

	/**
	 * Calls the Perplexity model.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callPerplexity(prompt: string): Promise<string> {
		try {
			logger.info('Calling Perplexity provider');
			return await perplexityProvider.generate(prompt);
		} catch (error) {
			logger.error('Perplexity provider failed', { originalError: error });
			throw error;
		}
	},

	// NOTE: DeepSeek and Cohere providers are not yet implemented.
	// The key pooling logic is ready for when we create them.

	/**
	 * Gets the next available DeepSeek API key from the pool.
	 * @returns A DeepSeek API key.
	 */
	getDeepSeekKey: (): string => getKeyFromPool(env.DEEPSEEK_API_KEYS, 'deepseek'),

	/**
	 * Gets the next available Cohere API key from the pool.
	 * @returns A Cohere API key.
	 */
	getCohereKey: (): string => getKeyFromPool(env.COHERE_API_KEYS, 'cohere')
};