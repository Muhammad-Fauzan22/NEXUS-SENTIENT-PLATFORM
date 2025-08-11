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
 * @param answers The array of PWB answers.
 * @returns The total calculated score.
 */
function calculatePWBScore(answers: PWBAnswer[]): number {
	return answers.reduce((sum, answer) => sum + answer.score, 0);
}

/**
 * Builds a detailed prompt for the AI to analyze PWB results.
 * @param totalScore The total calculated PWB score.
 * @returns A string containing the full prompt for the AI.
 */
function buildPWBPrompt(totalScore: number): string {
	return `
    Analyze the following Psychological Well-Being (PWB) score based on Ryff's model.

    **Total PWB Score:** ${totalScore}

    **Context:**
    The score is derived from a questionnaire assessing six dimensions of well-being: Autonomy, Environmental Mastery, Personal Growth, Positive Relations with Others, Purpose in Life, and Self-Acceptance. The maximum possible score is 84.
    - A score below 45 is considered "Low".
    - A score between 45 and 65 is considered "Moderate".
    - A score above 65 is considered "High".

    **Task:**
    Provide a comprehensive analysis based on the total score. Your response MUST be a single, minified JSON object with no markdown formatting.

    **JSON Schema:**
    {
      "totalScore": number,
      "level": "'Low' | 'Moderate' | 'High'",
      "interpretation": "A detailed, empathetic paragraph explaining what this score level generally indicates about the individual's psychological well-being. Explain the potential strengths and challenges associated with this level.",
      "recommendations": [
        "A concise, actionable recommendation focusing on self-acceptance or purpose.",
        "A concise, actionable recommendation focusing on personal growth or environmental mastery.",
        "A concise, actionable recommendation focusing on positive relations or autonomy."
      ]
    }

    **Example for a score of 50:**
    {"totalScore":50,"level":"Moderate","interpretation":"A moderate level of psychological well-being suggests a solid foundation but with areas for potential growth. The individual likely experiences a decent sense of purpose and self-acceptance, but may face challenges in certain aspects of life, such as mastering their environment or maintaining deep, positive relationships.","recommendations":["Practice daily affirmations to strengthen self-acceptance.","Identify one new skill to learn this month to foster personal growth.","Schedule a meaningful conversation with a close friend to nurture positive relations."]}

    **Your JSON Response:**
  `;
}

/**
 * Analyzes a set of PWB answers using an AI model.
 * @param answers The array of PWB answers.
 * @returns A structured analysis of the user's psychological well-being.
 */
async function analyze(answers: PWBAnswer[]): Promise<PWBAnalysisResult> {
	logger.info('Starting PWB analysis.');

	const totalScore = calculatePWBScore(answers);
	const prompt = buildPWBPrompt(totalScore);

	try {
		const rawResponse = await aiService.callClaude(prompt); // Using Claude as the primary analyzer
		const parsedResponse: PWBAnalysisResult = JSON.parse(rawResponse);

		// Validate the structure of the parsed response
		if (
			typeof parsedResponse.totalScore !== 'number' ||
			!['Low', 'Moderate', 'High'].includes(parsedResponse.level) ||
			typeof parsedResponse.interpretation !== 'string' ||
			!Array.isArray(parsedResponse.recommendations)
		) {
			throw new Error('AI response for PWB analysis did not match the expected schema.');
		}
		
		logger.info('Successfully completed PWB analysis.', { score: parsedResponse.totalScore });
		return parsedResponse;

	} catch (error) {
		logger.error('Failed to analyze PWB data.', { error });
		throw new InternalServerError('Error processing PWB analysis with AI.');
	}
}

export const pwbAnalyzer = {
	analyze
};