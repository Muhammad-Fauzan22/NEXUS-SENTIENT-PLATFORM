import type { PWBAnswer } from '$lib/types/schemas/assessment';
import { aiService } from '../aiService';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';

export interface PWBAnalysisResult {
	totalScore: number;
	level: 'Low' | 'Moderate' | 'High';
	interpretation: string;
	recommendations: string[];
}

/**
 * Calculates the total score from an array of PWB answers.
 * This function is exported for testability.
 * @param answers The array of PWB answers.
 * @returns The total calculated score.
 */
export function calculatePWBScore(answers: PWBAnswer[]): number {
	return answers.reduce((sum, answer) => sum + answer.score, 0);
}

/**
 * Builds a detailed prompt for the AI to analyze PWB results based on scientific standards.
 * This function is exported for testability.
 * @param totalScore The total calculated PWB score.
 * @returns A string containing the full prompt for the AI.
 */
export function buildPWBPrompt(totalScore: number): string {
	return `
    Analyze the following Psychological Well-Being (PWB) score based on Ryff's six-factor model of psychological well-being.

    **Total PWB Score:** ${totalScore}

    **Context & Scoring Rubric:**
    The score is derived from a 14-item questionnaire assessing six dimensions: Autonomy, Environmental Mastery, Personal Growth, Positive Relations with Others, Purpose in Life, and Self-Acceptance. The maximum possible score is 84. The scoring tiers are defined as follows:
    - A score below 45 is considered "Low".
    - A score between 45 and 65 is considered "Moderate".
    - A score above 65 is considered "High".

    **Task:**
    Provide a comprehensive analysis based on the total score. Your response MUST be a single, minified JSON object with no markdown formatting, adhering strictly to the following schema.

    **JSON Schema:**
    {
      "totalScore": ${totalScore},
      "level": "'Low' | 'Moderate' | 'High'",
      "interpretation": "A detailed, empathetic paragraph explaining what this score level generally indicates about the individual's psychological well-being according to Ryff's model. Explain the potential strengths and challenges associated with this level.",
      "recommendations": [
        "A concise, actionable recommendation focusing on self-acceptance or purpose in life.",
        "A concise, actionable recommendation focusing on personal growth or environmental mastery.",
        "A concise, actionable recommendation focusing on positive relations or autonomy."
      ]
    }

    **Your JSON Response:**
  `;
}

/**
 * Analyzes a set of PWB answers using an AI model, following a defined scientific framework.
 * @param answers The array of PWB answers.
 * @returns A structured analysis of the user's psychological well-being.
 */
async function analyze(answers: PWBAnswer[]): Promise<PWBAnalysisResult> {
	logger.info('Starting PWB analysis based on Ryff\'s model.');

	const totalScore = calculatePWBScore(answers);
	const prompt = buildPWBPrompt(totalScore);

	try {
		const rawResponse = await aiService.callClaude(prompt);
		const parsedResponse: PWBAnalysisResult = JSON.parse(rawResponse);

		if (
			parsedResponse.totalScore !== totalScore ||
			!['Low', 'Moderate', 'High'].includes(parsedResponse.level) ||
			typeof parsedResponse.interpretation !== 'string' ||
			!Array.isArray(parsedResponse.recommendations) ||
			parsedResponse.recommendations.length !== 3
		) {
			throw new Error('AI response for PWB analysis did not match the required scientific schema.');
		}
		
		logger.info('Successfully completed PWB analysis.', { score: parsedResponse.totalScore, level: parsedResponse.level });
		return parsedResponse;

	} catch (error) {
		logger.error('Failed to analyze PWB data.', { error });
		throw new InternalServerError('Error processing PWB analysis with AI.');
	}
}

export const pwbAnalyzer = {
	analyze
};