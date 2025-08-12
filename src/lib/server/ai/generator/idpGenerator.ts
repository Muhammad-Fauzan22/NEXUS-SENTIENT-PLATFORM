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
 * Builds the master prompt for generating an Individual Development Plan (IDP).
 * @param input The combined user data and analysis results.
 * @returns A string containing the full prompt for the AI.
 */
function buildIDPPrompt(input: IDPGeneratorInput): string {
	const { userData, riasecAnalysis, pwbAnalysis } = input;

	return `
    **Role:** You are an expert career and personal development coach named "Nexus".
    **Task:** Generate a comprehensive Individual Development Plan (IDP) for a user based on their RIASEC (Holland Code) and Psychological Well-Being (PWB) analysis. The tone should be encouraging, insightful, and professional. The output MUST be a single, minified JSON object with no markdown formatting.

    **User & Analysis Data:**
    1.  **User Data:**
        - Name: ${userData.name}
        - Occupation: ${userData.occupation}
    2.  **RIASEC Analysis (Career Personality):**
        - Top Code: ${riasecAnalysis.topCode}
        - Summary: ${riasecAnalysis.summary}
        - Keywords: ${riasecAnalysis.keywords.join(', ')}
    3.  **PWB Analysis (Psychological Well-Being):**
        - Score: ${pwbAnalysis.totalScore}
        - Level: ${pwbAnalysis.level}
        - Interpretation: ${pwbAnalysis.interpretation}
        - Recommendations: ${pwbAnalysis.recommendations.join('; ')}

    **JSON Output Schema:**
    {
      "title": "A personalized title, e.g., 'Individual Development Plan for ${userData.name}'",
      "introduction": "A welcoming paragraph that introduces the purpose of the IDP, mentioning the user by name and acknowledging their role as a ${userData.occupation}.",
      "strengthsAnalysis": {
        "summary": "A paragraph synthesizing the user's key strengths by combining insights from their RIASEC profile and PWB interpretation. How does their personality support their well-being?",
        "points": ["A bullet point highlighting a key strength.", "Another bullet point.", "A third bullet point."]
      },
      "growthAreas": {
        "summary": "A paragraph identifying potential areas for growth. Connect the challenges from the PWB analysis with the user's RIASEC type. Frame this constructively.",
        "points": ["A bullet point highlighting a key growth area.", "Another bullet point."]
      },
      "actionPlan": {
        "strengths": [
          {
            "title": "A short, actionable title for leveraging a strength.",
            "description": "A 1-2 sentence description of a concrete action the user can take.",
            "rationale": "A brief explanation of why this action is beneficial, linking it to their RIASEC/PWB profile."
          }
        ],
        "growth": [
          {
            "title": "A short, actionable title for addressing a growth area.",
            "description": "A 1-2 sentence description of a concrete action the user can take.",
            "rationale": "A brief explanation of how this action will improve their well-being or career alignment."
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
	logger.info('Starting IDP generation.', { user: input.userData.name });

	const prompt = buildIDPPrompt(input);

	try {
		const rawResponse = await aiService.callClaude(prompt);
		const parsedResponse: IDPResult = JSON.parse(rawResponse);

		// Basic validation to ensure the AI followed the schema
		if (
			!parsedResponse.title ||
			!parsedResponse.actionPlan?.strengths ||
			!parsedResponse.actionPlan?.growth
		) {
			throw new Error('AI response for IDP generation did not match the expected schema.');
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