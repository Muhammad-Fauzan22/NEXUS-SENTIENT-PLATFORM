import { env } from '$env/dynamic/private';
import { claudeProvider } from '$lib/server/ai/providers/claude';
import { geminiProvider } from '$lib/server/ai/providers/gemini';
import { localProvider } from '$lib/server/ai/providers/local';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';

export type AITaskType = 'ANALYZE' | 'GENERATE_DRAFT' | 'SUMMARIZE' | 'EMBEDDING';

export interface AITaskOptions {
	temperature?: number;
	maxTokens?: number;
	timeout?: number;
}

export interface AIProvider {
	generate(prompt: string, options?: AITaskOptions): Promise<string>;
}

class AIManager {
	private readonly preferLocal: boolean;

	constructor() {
		this.preferLocal = env.PREFERRED_AI_PROVIDER === 'local' || Boolean(env.LOCAL_LLM_BASE_URL);
	}

	/**
	 * Executes an AI task with the appropriate provider
	 * @param taskType - Type of AI task to execute
	 * @param prompt - The prompt to send to the AI
	 * @param options - Additional options for the AI request
	 * @returns Promise resolving to the AI response
	 */
	async executeTask(
		taskType: AITaskType,
		prompt: string,
		options: AITaskOptions = {}
	): Promise<string> {
		logger.info(`Executing AI task: ${taskType}`, {
			taskType,
			promptLength: prompt.length,
			preferLocal: this.preferLocal
		});

		try {
			const response = await this.getProviderForTask(taskType).generate(prompt, options);

			logger.info(`AI task completed successfully`, {
				taskType,
				responseLength: response.length
			});

			return response;
		} catch (error) {
			logger.error(`AI task failed`, {
				taskType,
				error: error instanceof Error ? error.message : 'Unknown error'
			});

			if (error instanceof InternalServerError) {
				throw error;
			}

			throw new InternalServerError(`Failed to execute AI task: ${taskType}`);
		}
	}

	/**
	 * Gets the appropriate AI provider for a given task type
	 * @param taskType - The type of task to execute
	 * @returns The AI provider to use
	 */
	private getProviderForTask(taskType: AITaskType): AIProvider {
		if (this.preferLocal) {
			return localProvider;
		}

		switch (taskType) {
			case 'GENERATE_DRAFT':
				return claudeProvider;
			case 'ANALYZE':
			case 'SUMMARIZE':
				return geminiProvider;
			case 'EMBEDDING':
				throw new InternalServerError('Embedding provider not yet implemented.');
			default:
				logger.warn(`Unknown task type: ${taskType}, falling back to Gemini`);
				return geminiProvider;
		}
	}

	/**
	 * Checks if AI services are available
	 * @returns Promise resolving to availability status
	 */
	async healthCheck(): Promise<{
		status: 'healthy' | 'degraded' | 'unhealthy';
		providers: Record<string, boolean>;
	}> {
		const providers: Record<string, boolean> = {};

		try {
			// Test local provider if preferred
			if (this.preferLocal) {
				try {
					await localProvider.generate('Health check', { timeout: 5000 });
					providers.local = true;
				} catch {
					providers.local = false;
				}
			}

			// Test external providers
			try {
				await claudeProvider.generate('Health check', { timeout: 5000 });
				providers.claude = true;
			} catch {
				providers.claude = false;
			}

			try {
				await geminiProvider.generate('Health check', { timeout: 5000 });
				providers.gemini = true;
			} catch {
				providers.gemini = false;
			}

			const healthyProviders = Object.values(providers).filter(Boolean).length;
			const totalProviders = Object.keys(providers).length;

			let status: 'healthy' | 'degraded' | 'unhealthy';
			if (healthyProviders === totalProviders) {
				status = 'healthy';
			} else if (healthyProviders > 0) {
				status = 'degraded';
			} else {
				status = 'unhealthy';
			}

			return { status, providers };
		} catch (error) {
			logger.error('Health check failed', { error });
			return { status: 'unhealthy', providers };
		}
	}
}

// Export singleton instance
export const aiManager = new AIManager();
