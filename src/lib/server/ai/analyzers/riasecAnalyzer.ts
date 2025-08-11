import type { RIASECAnswer } from '$lib/types/schemas/assessment';
import { aiService } from '../aiService';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';

// --- Type Definitions ---
export type RIASECCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECAnalysisResult {
	topCode: string; // e.g., "S.E.A"
	summary: string;
	keywords: string[];
	careers: string[];
}

// --- Constants ---
// Mapping of question IDs to their corresponding RIASEC category.
// This is a critical part of the business logic.
const RIASEC_QUESTION_MAP: { [key: number]: RIASECCode } = {
	1: 'R', 2: 'I', 3: 'A', 4: 'S', 5: 'E', 6: 'C',
	7: 'R', 8: 'I', 9: 'A', 10: 'S', 11: 'E', 12: 'C',
	13: 'R', 14: 'I', 15: 'A', 16: 'S', 17: 'E', 18: 'C',
	19: 'R', 20: 'I', 21: 'A', 22: 'S', 23: 'E', 24: 'C',
	25: 'R', 26: 'I', 27: 'A', 28: 'S', 29: 'E', 30: 'C',
	31: 'R', 32: 'I', 33: 'A', 34: 'S', 35: 'E', 36: 'C',
	37: 'R', 38: 'I', 39: 'A', 40: 'S', 41: 'E', 42: 'C',
};

/**
 * Calculates RIASEC scores from a list of answers.
 * @param answers The user's answers.
 * @returns A record of scores for each RIASEC code.
 */
function calculateRIASECScores(answers: RIASECAnswer[]): Record<RIASECCode, number> {
	const scores: Record<RIASECCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
	for (const answer of answers) {
		if (answer.answer === 'yes') {
			const code = RIASEC_QUESTION_MAP[answer.question_id];
			if (code) {
				scores[code]++;
			}
		}
	}
	return scores;
}

/**
 * Determines the top 3 RIASEC codes based on scores.
 * @param scores The calculated scores for each code.
 * @returns An array of the top 3 RIASEC codes.
 */
function getTopRIASECCodes(scores: Record<RIASECCode, number>): RIASECCode[] {
	return (Object.keys(scores) as RIASECCode[]).sort((a, b) => scores[b] - scores[a]).slice(0, 3);
}

/**
 * Builds a detailed prompt for the AI to analyze RIASEC results.
 * @param topCodes The user's top 3 RIASEC codes.
 * @returns A string containing the full prompt for the AI.
 */
function buildRIASECPrompt(topCodes: RIASECCode[]): string {
	const codeStr = topCodes.join(', ');
	return `
    Analyze the following Holland Code (RIASEC) combination: ${codeStr}.

    **Context:**
    The codes represent personality types related to career interests:
    - R (Realistic): The "Doers" - practical, hands-on, physical.
    - I (Investigative): The "Thinkers" - analytical, observant, scientific.
    - A (Artistic): The "Creators" - expressive, original, independent.
    - S (Social): The "Helpers" - enjoy working with people, helping, teaching.
    - E (Enterprising): The "Persuaders" - leaders, persuasive, ambitious.
    - C (Conventional): The "Organizers" - detail-oriented, structured, precise.

    **Task:**
    Provide a detailed analysis for the combination "${codeStr}". Your response MUST be a single, minified JSON object with no markdown formatting.

    **JSON Schema:**
    {
      "topCode": "The three-letter code, e.g., 'S.E.A'",
      "summary": "A detailed paragraph describing the personality profile, work style, and typical environment for someone with this code combination. Explain how the three traits interact.",
      "keywords": ["An array of 5-7 keywords that describe this personality type, e.g., 'Empathetic', 'Leader', 'Creative', 'Organized'"],
      "careers": ["An array of 5-7 specific job titles that are an excellent match for this profile, e.g., 'Social Worker', 'HR Manager', 'Event Coordinator'"]
    }

    **Example for S, E, A:**
    {"topCode":"S.E.A","summary":"Individuals with an SEA code are sociable, ambitious, and creative. They thrive in roles where they can lead and persuade others while also using their artistic and expressive talents. They are often found in leadership positions within creative industries, enjoying both the social interaction and the opportunity for innovation.","keywords":["Empathetic","Persuasive","Expressive","Leader","Communicative","Innovative"],"careers":["Public Relations Manager","Fundraising Director","Art Director","Non-Profit Program Manager","Corporate Trainer"]}

    **Your JSON Response:**
  `;
}

/**
 * Analyzes a set of RIASEC answers using an AI model.
 * @param answers The array of RIASEC answers.
 * @returns A structured analysis of the user's RIASEC profile.
 */
async function analyze(answers: RIASECAnswer[]): Promise<RIASECAnalysisResult> {
	logger.info('Starting RIASEC analysis.');

	const scores = calculateRIASECScores(answers);
	const topCodes = getTopRIASECCodes(scores);
	const prompt = buildRIASECPrompt(topCodes);

	try {
		const rawResponse = await aiService.callClaude(prompt);
		const parsedResponse: RIASECAnalysisResult = JSON.parse(rawResponse);

		if (
			!parsedResponse.topCode ||
			!parsedResponse.summary ||
			!Array.isArray(parsedResponse.keywords) ||
			!Array.isArray(parsedResponse.careers)
		) {
			throw new Error('AI response for RIASEC analysis did not match the expected schema.');
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