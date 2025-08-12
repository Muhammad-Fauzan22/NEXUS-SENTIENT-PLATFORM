// CORRECTED: Using relative paths for all server-side module imports for robustness.
import { claudeProvider } from './providers/claude';
import { geminiProvider } from './providers/gemini';
import { perplexityProvider } from './providers/perplexity';
import { logger } from '../utils/logger';
import { env } from '../config';
import { InternalServerError } from '../utils/errors';
import type { AssessmentData } from '$lib/types/schemas/assessment';
import { pwbAnalyzer } from './analyzers/pwbAnalyzer';
import { riasecAnalyzer } from './analyzers/riasecAnalyzer';
import { idpGenerator } from './generators/idpGenerator';

/**
 * A centralized service for orchestrating complex AI workflows.
 */
export const aiService = {
	/**
	 * Executes the full end-to-end assessment pipeline.
	 * @param assessmentData The complete raw data from the user submission.
	 * @returns A promise that resolves to the final, generated Individual Development Plan.
	 */
	async runFullAssessmentPipeline(assessmentData: AssessmentData) {
		try {
			logger.info('Starting parallel analysis phase.', { email: assessmentData.user_data.email });
			const [riasecResult, pwbResult] = await Promise.all([
				riasecAnalyzer.analyze(assessmentData.riasec_answers),
				pwbAnalyzer.analyze(assessmentData.pwb_answers)
			]);

			logger.info('Starting synthesis phase (IDP Generation).', { email: assessmentData.user_data.email });
			const idpResult = await idpGenerator.generate({
				userData: assessmentData.user_data,
				riasecAnalysis: riasecResult,
				pwbAnalysis: pwbResult
			});

			return {
				riasecResult,
				pwbResult,
				idpResult
			};
		} catch (error) {
			logger.error('A critical error occurred during the AI assessment pipeline.', { error });
			if (error instanceof InternalServerError) {
				throw error;
			}
			throw new InternalServerError('An unexpected failure occurred in the AI pipeline.');
		}
	},

	/**
	 * Directly calls the Claude model for general-purpose tasks.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callClaude(prompt: string): Promise<string> {
		return claudeProvider.generate(prompt);
	},

	/**
	 * Directly calls the Gemini model.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callGemini(prompt: string): Promise<string> {
		return geminiProvider.generate(prompt);
	},

	/**
	 * Directly calls the Perplexity model.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callPerplexity(prompt: string): Promise<string> {
		return perplexityProvider.generate(prompt);
	}
};