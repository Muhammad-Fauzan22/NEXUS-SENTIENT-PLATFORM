import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { aiService } from '$lib/server/ai/aiService';
import { dbService, type AssessmentSubmissionPayload } from '$lib/server/services/dbService';
import { logger } from '$lib/server/utils/logger';
import { ApiError, BadRequestError } from '$lib/server/utils/errors';
import type { AssessmentData } from '$lib/types/schemas/assessment';
import { pwbAnalyzer } from '$lib/server/ai/analyzers/pwbAnalyzer';
import { riasecAnalyzer } from '$lib/server/ai/analyzers/riasecAnalyzer';
import { idpGenerator } from '$lib/server/ai/generators/idpGenerator';

/**
 * API Endpoint to submit assessment data, generate analysis, and create an IDP.
 * This endpoint orchestrates calls to dedicated AI and Database services.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const assessmentData: AssessmentData = await request.json();

		// Step 1: Validate incoming data payload
		if (!assessmentData?.user_data || !assessmentData?.riasec_answers || !assessmentData?.pwb_answers) {
			throw new BadRequestError('Invalid or incomplete assessment data payload.');
		}

		// Step 2: Run analyzers in parallel for efficiency
		logger.info('Starting parallel analysis for RIASEC and PWB.', { email: assessmentData.user_data.email });
		const [riasecResult, pwbResult] = await Promise.all([
			riasecAnalyzer.analyze(assessmentData.riasec_answers),
			pwbAnalyzer.analyze(assessmentData.pwb_answers)
		]);

		// Step 3: Generate the Individual Development Plan (IDP) using the analysis results
		logger.info('Starting IDP generation.', { email: assessmentData.user_data.email });
		const idpResult = await idpGenerator.generate({
			userData: assessmentData.user_data,
			riasecAnalysis: riasecResult,
			pwbAnalysis: pwbResult
		});

		// Step 4: Assemble the final payload for the database
		const submissionPayload: AssessmentSubmissionPayload = {
			user_info: assessmentData.user_data,
			riasec_answers: assessmentData.riasec_answers,
			pwb_answers: assessmentData.pwb_answers,
			riasec_result: riasecResult,
			pwb_result: pwbResult,
			generated_idp: idpResult
		};

		// Step 5: Store the complete record in the database
		const submissionData = await dbService.createAssessmentSubmission(submissionPayload);

		logger.info('Successfully processed and stored new assessment.', { submissionId: submissionData.id });

		// Step 6: Return the successful response to the client
		return json(
			{
				success: true,
				submissionId: submissionData.id,
				idp: idpResult
			},
			{ status: 201 }
		);

	} catch (err: unknown) {
		// Centralized error handling
		if (err instanceof ApiError) {
			logger.warn(`API Error: ${err.message}`, { status: err.status, context: err.context });
			return json({ message: err.message }, { status: err.status });
		}

		// Catch-all for unexpected errors
		const error = err instanceof Error ? err : new Error(String(err));
		logger.error('An unexpected error occurred in the submission endpoint.', {
			errorMessage: error.message,
			errorStack: error.stack
		});
		return json({ message: 'An unexpected server error occurred.' }, { status: 500 });
	}
};