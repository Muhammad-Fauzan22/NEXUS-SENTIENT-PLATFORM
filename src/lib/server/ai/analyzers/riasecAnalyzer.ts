import type { RIASECAnswer } from '$lib/types/schemas/assessment';
import { aiService } from '../aiService';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';

// --- Definisi Tipe & Konstanta ---

export type RIASECCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECAnalysisResult {
	topCode: string;
	summary: string;
	keywords: string[];
	careers: string[];
}

// Peta ini adalah "sumber kebenaran" untuk skoring, memisahkan data dari logika.
const RIASEC_QUESTION_MAP: Record<number, RIASECCode> = {
	1: 'R', 2: 'I', 3: 'A', 4: 'S', 5: 'E', 6: 'C', 7: 'R', 8: 'I', 9: 'A', 10: 'S', 11: 'E', 12: 'C',
	13: 'R', 14: 'I', 15: 'A', 16: 'S', 17: 'E', 18: 'C', 19: 'R', 20: 'I', 21: 'A', 22: 'S', 23: 'E', 24: 'C',
	25: 'R', 26: 'I', 27: 'A', 28: 'S', 29: 'E', 30: 'C', 31: 'R', 32: 'I', 33: 'A', 34: 'S', 35: 'E', 36: 'C',
	37: 'R', 38: 'I', 39: 'A', 40: 'S', 41: 'E', 42: 'C',
};

// --- Fungsi Logika Murni (Dapat Diuji) ---

/**
 * Menghitung skor RIASEC berdasarkan jawaban. Fungsi murni untuk testability.
 */
export function calculateRIASECScores(answers: RIASECAnswer[]): Record<RIASECCode, number> {
	const scores: Record<RIASECCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
	for (const answer of answers) {
		if (answer.answer === 'yes') {
			const code = RIASEC_QUESTION_MAP[answer.question_id];
			if (code) scores[code]++;
		}
	}
	return scores;
}

/**
 * Menentukan 3 kode RIASEC teratas. Fungsi murni untuk testability.
 */
export function getTopRIASECCodes(scores: Record<RIASECCode, number>): RIASECCode[] {
	return (Object.keys(scores) as RIASECCode[]).sort((a, b) => scores[b] - scores[a]).slice(0, 3);
}

/**
 * Membangun prompt AI yang sangat terstruktur untuk analisis RIASEC.
 */
function buildRIASECPrompt(topCodes: RIASECCode[]): string {
	const codeStr = topCodes.join(', ');
	return `
    **Role:** Career Counselor AI specializing in John Holland's RIASEC model.
    **Task:** Analyze the Holland Code combination: **${codeStr}**. Provide a detailed, insightful, and encouraging analysis. The output MUST be a single, minified JSON object with no markdown formatting.
    **JSON Schema:**
    {
      "topCode": "The three-letter code, formatted with periods, e.g., 'S.E.A'",
      "summary": "A detailed paragraph describing the personality profile, work style, and typical environment for someone with this code combination. Explain how the three traits interact.",
      "keywords": ["An array of exactly 6 keywords describing this personality type."],
      "careers": ["An array of exactly 5 specific job titles that are an excellent match for this profile."]
    }
    **Your JSON Response for ${codeStr}:**
  `;
}

// --- Fungsi Orkestrasi Utama ---

/**
 * Menganalisis satu set jawaban RIASEC menggunakan AI.
 */
async function analyze(answers: RIASECAnswer[]): Promise<RIASECAnalysisResult> {
	logger.info('Starting RIASEC analysis based on Holland\'s theory.');
	const scores = calculateRIASECScores(answers);
	const topCodes = getTopRIASECCodes(scores);
	const prompt = buildRIASECPrompt(topCodes);

	try {
		const rawResponse = await aiService.callClaude(prompt); // Claude is best for strict JSON adherence.
		const parsedResponse: RIASECAnalysisResult = JSON.parse(rawResponse);

		// Validasi ketat terhadap skema yang diharapkan.
		if (
			!parsedResponse.topCode || !parsedResponse.summary ||
			!Array.isArray(parsedResponse.keywords) || !Array.isArray(parsedResponse.careers) ||
			parsedResponse.keywords.length === 0 || parsedResponse.careers.length === 0
		) {
			throw new Error('AI response for RIASEC analysis did not match the required schema.');
		}

		logger.info('Successfully completed RIASEC analysis.', { topCode: parsedResponse.topCode });
		return parsedResponse;

	} catch (error) {
		logger.error('Failed to analyze RIASEC data.', { error });
		throw new InternalServerError('Error processing RIASEC analysis with AI.');
	}
}

export const riasecAnalyzer = {
	analyze
};