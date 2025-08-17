import { env } from '$env/dynamic/private';
import { claudeProvider } from '$lib/server/ai/providers/claude';
import { geminiProvider } from '$lib/server/ai/providers/gemini';
import { localProvider } from '$lib/server/ai/providers/local';

const preferLocal = env.PREFERRED_AI_PROVIDER === 'local' || Boolean(env.LOCAL_LLM_BASE_URL);

export const aiManager = {
	/**
	 * @param {'ANALYZE' | 'GENERATE_DRAFT' | 'SUMMARIZE' | 'EMBEDDING'} taskType
	 * @param {string} prompt
	 * @param {object} [_options]
	 */
	async executeTask(taskType, prompt, _options = {}) {
		console.log(`Executing AI task: ${taskType}`);

		/** @param {string} p */
		const gen = async (p) => {
			if (preferLocal) return localProvider.generate(p);
			if (taskType === 'GENERATE_DRAFT') return claudeProvider.generate(p);
			return geminiProvider.generate(p);
		};

		switch (taskType) {
			case 'ANALYZE':
				return gen(prompt);
			case 'GENERATE_DRAFT':
				return gen(prompt);
			case 'SUMMARIZE':
				return gen(prompt);
			case 'EMBEDDING':
				throw new Error('Embedding provider not yet implemented.');
			default:
				throw new Error(`Unknown AI task type: ${taskType}`);
		}
	}
};
