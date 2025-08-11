import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { aiService } from '$lib/server/ai/aiService';
import { dbService, type AssessmentSubmissionPayload } from '$lib/server/services/dbService';
import { logger } from '$lib/server/utils/logger';
import { ApiError, BadRequestError } from '$lib/server/utils/errors';
import type { AssessmentData } from '$lib/types/schemas/assessment';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const assessmentData: AssessmentData = await request.json();

		if (!assessmentData?.user_data || !assessmentData?.riasec_answers || !assessmentData?.pwb_answers) {
			throw new BadRequestError('Invalid or incomplete assessment data payload.');
		}

		// Placeholder results until analyzers are built in subsequent tasks
		const riasecResult = { code: 'TBD', analysis: 'Analysis pending.' };
		const pwbResult = { score: 0, analysis: 'Analysis pending.' };
		const idpResult = { plan: 'IDP generation pending.' };

		const submissionPayload: AssessmentSubmissionPayload = {
			user_info: assessmentData.user_data,
			riasec_answers: assessmentData.riasec_answers,
			pwb_answers: assessmentData.pwb_answers,
			riasec_result: riasecResult,
			pwb_result: pwbResult,
			generated_idp: idpResult
		};

		const submissionData = await dbService.createAssessmentSubmission(submissionPayload);

		logger.info('Successfully processed and stored new assessment.', { submissionId: submissionData.id });

		return json(
			{
				success: true,
				submissionId: submissionData.id,
				idp: idpResult
			},
			{ status: 201 }
		);
	} catch (err: unknown) {
		if (err instanceof ApiError) {
			logger.warn(`API Error: ${err.message}`, { status: err.status, context: err.context });
			return json({ message: err.message }, { status: err.status });
		}

		const error = err instanceof Error ? err : new Error(String(err));
		logger.error('An unexpected error occurred in the submission endpoint.', {
			errorMessage: error.message,
			errorStack: error.stack
		});
		return json({ message: 'An unexpected server error occurred.' }, { status: 500 });
	}
};