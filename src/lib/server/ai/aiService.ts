import { claudeProvider } from './providers/claude';
import { geminiProvider } from './providers/gemini';
import { perplexityProvider } from './providers/perplexity';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';
import type { AssessmentData } from '$lib/types/schemas/assessment';
import { pwbAnalyzer } from './analyzers/pwbAnalyzer';
import { riasecAnalyzer } from './analyzers/riasecAnalyzer';
import { idpGenerator } from './generators/idpGenerator';

/**
 * A centralized service for orchestrating complex AI workflows.
 * It selects the best provider for a given task and manages the analysis pipeline.
 */
export const aiService = {
	/**
	 * Executes the full end-to-end assessment pipeline.
	 * This function embodies the core logic of the PPSDM-AI system.
	 *
	 * @param assessmentData The complete raw data from the user submission.
	 * @returns A promise that resolves to the final, generated Individual Development Plan.
	 */
	async runFullAssessmentPipeline(assessmentData: AssessmentData) {
		try {
			// --- PHASE 1: PARALLEL ANALYSIS ---
			// Run independent analyses concurrently for maximum efficiency.
			logger.info('Starting parallel analysis phase.', { email: assessmentData.user_data.email });
			const [riasecResult, pwbResult] = await Promise.all([
				riasecAnalyzer.analyze(assessmentData.riasec_answers),
				pwbAnalyzer.analyze(assessmentData.pwb_answers)
			]);
			logger.info('Completed parallel analysis phase.', {
				riasecCode: riasecResult.topCode,
				pwbLevel: pwbResult.level
			});

			// --- PHASE 2: SYNTHESIS & GENERATION ---
			// Use the results of the analysis to generate the final report.
			// This is a complex, creative task, best suited for a powerful model like Claude.
			logger.info('Starting synthesis phase (IDP Generation).', { email: assessmentData.user_data.email });
			const idpResult = await idpGenerator.generate({
				userData: assessmentData.user_data,
				riasecAnalysis: riasecResult,
				pwbAnalysis: pwbResult
			});
			logger.info('Completed synthesis phase.', { userName: assessmentData.user_data.name });

			// --- PHASE 3: RETURN FINAL ARTIFACT ---
			return {
				riasecResult,
				pwbResult,
				idpResult
			};
		} catch (error) {
			logger.error('A critical error occurred during the AI assessment pipeline.', { error });
			// The underlying services (analyzers, generators) are expected to throw ApiError.
			// If not, wrap it in a generic InternalServerError.
			if (error instanceof InternalServerError) {
				throw error;
			}
			throw new InternalServerError('An unexpected failure occurred in the AI pipeline.');
		}
	},

	// --- Direct Provider Access (for specific, non-pipeline tasks) ---

	/**
	 * Directly calls the Claude model for general-purpose tasks.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callClaude(prompt: string): Promise<string> {
		return claudeProvider.generate(prompt);
	},

	/**
	 * Directly calls the Gemini model, often best for quick data extraction or simple generation.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callGemini(prompt: string): Promise<string> {
		return geminiProvider.generate(prompt);
	},

	/**
	 * Directly calls the Perplexity model, best for tasks requiring real-time web information.
	 * @param prompt The prompt to send.
	 * @returns The generated text.
	 */
	async callPerplexity(prompt: string): Promise<string> {
		return perplexityProvider.generate(prompt);
	}
};