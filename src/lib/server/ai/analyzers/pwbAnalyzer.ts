import type { PWBAnswer } from '$lib/types/schemas/assessment';
import { aiService } from '../aiService';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';

// --- Definisi Tipe ---

export interface PWBAnalysisResult {
	totalScore: number;
	level: 'Low' | 'Moderate' | 'High';
	interpretation: string;
	recommendations: string[];
}

// --- Fungsi Logika Murni (Dapat Diuji) ---

/**
 * Menghitung total skor PWB dari jawaban. Fungsi murni untuk testability.
 */
export function calculatePWBScore(answers: PWBAnswer[]): number {
	return answers.reduce((sum, answer) => sum + answer.score, 0);
}

/**
 * Membangun prompt AI yang sangat terstruktur untuk analisis PWB.
 */
function buildPWBPrompt(totalScore: number): string {
	return `
    **Role:** You are a psychological analyst AI specializing in Ryff's six-factor model of psychological well-being.
    **Task:** Analyze the provided PWB score. Your response MUST be a single, minified JSON object with no markdown formatting.

    **PWB Score:** ${totalScore}
    **Context:** Max score is 84. Tiers: Low (<45), Moderate (45-65), High (>65).

    **JSON Schema:**
    {
      "totalScore": ${totalScore},
      "level": "'Low' | 'Moderate' | 'High'",
      "interpretation": "A detailed, empathetic paragraph explaining what this score level indicates about the individual's psychological well-being according to Ryff's model.",
      "recommendations": [
        "A concise, actionable recommendation focusing on self-acceptance or purpose in life.",
        "A concise, actionable recommendation focusing on personal growth or environmental mastery.",
        "A concise, actionable recommendation focusing on positive relations or autonomy."
      ]
    }
    **Your JSON Response:**
  `;
}

// --- Fungsi Orkestrasi Utama ---

/**
 * Menganalisis satu set jawaban PWB menggunakan AI.
 */
async function analyze(answers: PWBAnswer[]): Promise<PWBAnalysisResult> {
	logger.info('Starting PWB analysis based on Ryff\'s model.');
	const totalScore = calculatePWBScore(answers);
	const prompt = buildPWBPrompt(totalScore);

	try {
		const rawResponse = await aiService.callClaude(prompt);
		const parsedResponse: PWBAnalysisResult = JSON.parse(rawResponse);

		// Validasi ketat terhadap skema yang diharapkan.
		if (
			parsedResponse.totalScore !== totalScore ||
			!['Low', 'Moderate', 'High'].includes(parsedResponse.level) ||
			!parsedResponse.interpretation ||
			!Array.isArray(parsedResponse.recommendations) ||
			parsedResponse.recommendations.length !== 3
		) {
			throw new Error('AI response for PWB analysis did not match the required schema.');
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