import { aiService } from '../aiService';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';
import type { UserData } from '$lib/types/schemas/assessment';
import type { RIASECAnalysisResult } from '../analyzers/riasecAnalyzer';
import type { PWBAnalysisResult } from '../analyzers/pwbAnalyzer';

// --- Type Definitions ---

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
 * Builds the master prompt for generating an IDP based on a scientific, evidence-based framework.
 * @param input The combined user data and analysis results.
 * @returns A string containing the full prompt for the AI.
 */
function buildIDPPrompt(input: IDPGeneratorInput): string {
	const { userData, riasecAnalysis, pwbAnalysis } = input;

	return `
    **Role:** You are an expert career and personal development coach named "Nexus". You operate based on a scientific, evidence-based methodology.
    **Task:** Synthesize the provided RIASEC and PWB data into a comprehensive Individual Development Plan (IDP). You must identify synergies and frictions between the user's personality and their well-being. The output MUST be a single, minified JSON object with no markdown formatting.

    **Client Profile Data:**
    1.  **User Data:**
        - Name: ${userData.name}
        - Occupation: ${userData.occupation}
    2.  **RIASEC Analysis (Career Personality - Holland, 1997):**
        - Top Code: ${riasecAnalysis.topCode}
        - Summary: ${riasecAnalysis.summary}
        - Keywords: ${riasecAnalysis.keywords.join(', ')}
    3.  **PWB Analysis (Psychological Well-Being - Ryff, 1989):**
        - Score: ${pwbAnalysis.totalScore}
        - Level: ${pwbAnalysis.level}
        - Interpretation: ${pwbAnalysis.interpretation}
        - Initial Recommendations: ${pwbAnalysis.recommendations.join('; ')}

    **Methodology:**
    1.  **Synthesize Strengths:** Combine the RIASEC personality strengths with the positive aspects of the PWB interpretation.
    2.  **Identify Growth Areas:** Analyze how the challenges identified in the PWB interpretation might be influenced or exacerbated by the user's RIASEC personality traits.
    3.  **Formulate Action Plan (Gap Analysis):** Create concrete action items. The 'strengths' plan should leverage RIASEC traits. The 'growth' plan should directly address the PWB recommendations, forming a strategy to close the competency gap.

    **JSON Output Schema (Strict Adherence Required):**
    {
      "title": "Personalized Individual Development Plan for ${userData.name}",
      "introduction": "A welcoming paragraph introducing the IDP, mentioning the user by name and acknowledging their role as a ${userData.occupation}. State that this plan is a synthesis of their personality and well-being data.",
      "strengthsAnalysis": {
        "summary": "A paragraph synthesizing the user's key strengths. Example: 'Your Enterprising nature (E) synergizes well with your high sense of Purpose in Life, making you a natural leader in projects you believe in.'",
        "points": ["A bullet point highlighting a key strength.", "Another bullet point.", "A third bullet point."]
      },
      "growthAreas": {
        "summary": "A paragraph identifying potential growth areas by finding friction points. Example: 'Your Artistic (A) and independent nature might sometimes conflict with developing Positive Relations with Others, a key area for growth identified in your PWB analysis.'",
        "points": ["A bullet point highlighting a key growth area.", "Another bullet point."]
      },
      "actionPlan": {
        "strengths": [
          {
            "title": "A short, actionable title for leveraging a strength.",
            "description": "A 1-2 sentence description of a concrete action the user can take.",
            "rationale": "A brief explanation of why this action is beneficial, explicitly linking it to their RIASEC code (e.g., 'This leverages your Social (S) trait...')."
          }
        ],
        "growth": [
          {
            "title": "A short, actionable title for addressing a growth area.",
            "description": "A 1-2 sentence description of a concrete action based on a PWB recommendation.",
            "rationale": "A brief explanation of how this action will improve a specific PWB dimension (e.g., 'This will directly enhance your Environmental Mastery...')."
          }
        ]
      }
    }

    **Your JSON Response:**
  `;
}

/**
 * Generates an Individual Development Plan (IDP) by synthesizing RIASEC and PWB analyses.
 * @param input The combined user data and analysis results.
 * @returns A structured IDP object.
 */
async function generate(input: IDPGeneratorInput): Promise<IDPResult> {
	logger.info('Starting scientific IDP generation.', { user: input.userData.name });

	const prompt = buildIDPPrompt(input);

	try {
		const rawResponse = await aiService.callClaude(prompt);
		const parsedResponse: IDPResult = JSON.parse(rawResponse);

		// Rigorous validation of the final synthesized object
		if (
			!parsedResponse.title ||
			!parsedResponse.strengthsAnalysis?.summary ||
			!parsedResponse.growthAreas?.summary ||
			!Array.isArray(parsedResponse.actionPlan?.strengths) ||
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