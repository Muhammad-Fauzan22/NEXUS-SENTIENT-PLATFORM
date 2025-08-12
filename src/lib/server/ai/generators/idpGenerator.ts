import { aiService } from '../aiService';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';
import type { UserData } from '$lib/types/schemas/assessment';
import type { RIASECAnalysisResult } from '../analyzers/riasecAnalyzer';
import type { PWBAnalysisResult } from '../analyzers/pwbAnalyzer';

// --- Definisi Tipe ---

export interface IDPGeneratorInput {
	userData: UserData;
	riasecAnalysis: RIASECAnalysisResult;
	pwbAnalysis: PWBAnalysisResult;
}

export interface ActionItem {
	title: string;
	description: string;
	rationale: string;
}

export interface IDPResult {
	title: string;
	introduction: string;
	strengthsAnalysis: {
		summary: string;
		points: string[];
	};
	growthAreas: {
		summary: string;
		points: string[];
	};
	actionPlan: {
		strengths: ActionItem[];
		growth: ActionItem[];
	};
}

/**
 * Membangun prompt AI master untuk sintesis IDP.
 */
function buildIDPPrompt(input: IDPGeneratorInput): string {
	const { userData, riasecAnalysis, pwbAnalysis } = input;

	return `
    **Role:** Expert career and personal development coach named "Nexus".
    **Task:** Synthesize the provided RIASEC and PWB data into a comprehensive Individual Development Plan (IDP). Identify synergies and frictions between personality and well-being. The output MUST be a single, minified JSON object with no markdown formatting.

    **Client Profile:**
    - **User:** ${userData.name}, ${userData.occupation}
    - **RIASEC Profile (${riasecAnalysis.topCode}):** ${riasecAnalysis.summary}
    - **PWB Profile (${pwbAnalysis.level}):** ${pwbAnalysis.interpretation}

    **JSON Output Schema:**
    {
      "title": "Personalized Individual Development Plan for ${userData.name}",
      "introduction": "A welcoming paragraph introducing the IDP, mentioning the user by name and acknowledging their role.",
      "strengthsAnalysis": {
        "summary": "Synthesize key strengths. Example: 'Your Enterprising nature (E) synergizes well with your high sense of Purpose in Life...'",
        "points": ["Bullet point highlighting a key strength.", "Another bullet point.", "A third bullet point."]
      },
      "growthAreas": {
        "summary": "Identify potential growth areas by finding friction points. Example: 'Your Artistic (A) independence might sometimes conflict with developing Positive Relations...'",
        "points": ["Bullet point highlighting a key growth area.", "Another bullet point."]
      },
      "actionPlan": {
        "strengths": [
          {"title": "Actionable title.", "description": "Concrete action.", "rationale": "Why this action leverages their RIASEC code."}
        ],
        "growth": [
          {"title": "Actionable title.", "description": "Concrete action based on a PWB recommendation.", "rationale": "How this action improves a specific PWB dimension."}
        ]
      }
    }

    **Your JSON Response:**
  `;
}

/**
 * Menghasilkan IDP dengan mensintesis analisis RIASEC dan PWB.
 */
async function generate(input: IDPGeneratorInput): Promise<IDPResult> {
	logger.info('Starting scientific IDP generation.', { user: input.userData.name });
	const prompt = buildIDPPrompt(input);

	try {
		const rawResponse = await aiService.callClaude(prompt);
		const parsedResponse: IDPResult = JSON.parse(rawResponse);

		// Validasi ketat terhadap skema yang diharapkan.
		if (
			!parsedResponse.title || !parsedResponse.strengthsAnalysis?.summary ||
			!parsedResponse.growthAreas?.summary || !Array.isArray(parsedResponse.actionPlan?.strengths) ||
			!Array.isArray(parsedResponse.actionPlan?.growth) ||
			parsedResponse.actionPlan.strengths.length === 0 ||
			parsedResponse.actionPlan.growth.length === 0
		) {
			throw new Error('AI response for IDP generation did not match the required scientific schema.');
		}

		logger.info('Successfully completed IDP generation.', { user: input.userData.name });
		return parsedResponse;

	} catch (error) {
		logger.error('Failed to generate IDP.', { error });
		throw new InternalServerError('Error processing IDP generation with AI.');
	}
}

export const idpGenerator = {
	generate
};