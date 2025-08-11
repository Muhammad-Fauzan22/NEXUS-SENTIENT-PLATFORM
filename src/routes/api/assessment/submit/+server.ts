import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { aiService } from '$lib/server/ai/aiService';
import { dbService, type AssessmentSubmissionPayload } from '$lib/server/services/dbService';
import { logger } from '$lib/server/utils/logger';
import { BadRequestError, ApiError } from '$lib/server/utils/errors';

/**
 * API Endpoint to submit assessment data, generate analysis, and create an IDP.
 * This endpoint now uses dedicated services for AI and Database operations.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const assessmentData = await request.json();

		// Step 1: Validate incoming data payload
		if (!assessmentData?.user_data || !assessmentData?.riasec_answers || !assessmentData?.pwb_answers) {
			throw new BadRequestError('Invalid or incomplete assessment data payload.');
		}

		// Step 2: Orchestrate calls to the AI service for analysis (in parallel)
		// NOTE: For now, we assume analyzers exist. We will build these next.
		// const [riasecResult, pwbResult] = await Promise.all([
		// 	aiService.analyzeRIASEC(assessmentData.riasec_answers),
		// 	aiService.analyzePWB(assessmentData.pwb_answers)
		// ]);
		// Placeholder results until analyzers are built:
		const riasecResult = { code: 'TBD', analysis: 'Analysis pending.' };
		const pwbResult = { score: 0, analysis: 'Analysis pending.' };


		// Step 3: Orchestrate call to the AI service to generate the IDP
		// const idpResult = await aiService.generateIDP({ ... });
		// Placeholder result:
		const idpResult = { plan: 'IDP generation pending.' };


		// Step 4: Assemble the payload for the database service
		const submissionPayload: AssessmentSubmissionPayload = {
			user_info: assessmentData.user_data,
			riasec_answers: assessmentData.riasec_answers,
			pwb_answers: assessmentData.pwb_answers,
			riasec_result: riasecResult,
			pwb_result: pwbResult,
			generated_idp: idpResult
		};

		// Step 5: Call the database service to store the results
		const submissionData = await dbService.createAssessmentSubmission(submissionPayload);

		logger.info('Successfully processed and stored new assessment.', { submissionId: submissionData.id });

		// Step 6: Return the successful response
		return json({
			success: true,
			submissionId: submissionData.id,
			idp: idpResult
		}, { status: 201 });

	} catch (err) {
		// Centralized error handling
		if (err instanceof ApiError) {
			logger.warn(`API Error: ${err.message}`, { status: err.status, context: err.context });
			return json({ message: err.message }, { status: err.status });
		}

		// Catch-all for unexpected errors
		logger.error('An unexpected error occurred in the submission endpoint.', { error: err });
		return json({ message: 'An unexpected server error occurred.' }, { status: 500 });
	}
};