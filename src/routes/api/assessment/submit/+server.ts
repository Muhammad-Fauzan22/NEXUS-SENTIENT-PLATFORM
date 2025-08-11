import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/db/supabase'; // Assuming supabase client is in lib/db
import { pwbAnalyzer } from '$lib/server/ai/analyzers/pwbAnalyzer';
import { riasecAnalyzer } from '$lib/server/ai/analyzers/riasecAnalyzer';
import { idpGenerator } from '$lib/server/ai/generators/idpGenerator';
import { logger } from '$lib/server/utils/logger';
import { BadRequestError, InternalServerError } from '$lib/server/utils/errors';

/**
 * API Endpoint to submit assessment data, generate analysis, and create an IDP.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const assessmentData = await request.json();

		// Basic validation
		if (!assessmentData || !assessmentData.user_data || !assessmentData.riasec_answers || !assessmentData.pwb_answers) {
			throw new BadRequestError('Invalid assessment data payload.');
		}

		// 1. Analyze RIASEC and PWB in parallel
		const [riasecResult, pwbResult] = await Promise.all([
			riasecAnalyzer.analyze(assessmentData.riasec_answers),
			pwbAnalyzer.analyze(assessmentData.pwb_answers)
		]);

		// 2. Generate the Individual Development Plan (IDP)
		const idpResult = await idpGenerator.generate({
			userData: assessmentData.user_data,
			riasecAnalysis: riasecResult,
			pwbAnalysis: pwbResult
		});

		// 3. Store everything in Supabase
		const { data: submissionData, error: submissionError } = await supabase
			.from('assessment_submissions')
			.insert([
				{
					user_info: assessmentData.user_data,
					riasec_answers: assessmentData.riasec_answers,
					pwb_answers: assessmentData.pwb_answers,
					riasec_result: riasecResult,
					pwb_result: pwbResult,
					generated_idp: idpResult,
					// TODO: Link to a user ID if you have authentication
					// user_id: '...'
				}
			])
			.select()
			.single();

		if (submissionError) {
			throw new InternalServerError('Failed to store assessment results.', { dbError: submissionError });
		}

		logger.info('Successfully processed and stored new assessment.', { submissionId: submissionData.id });

		return json({
			success: true,
			submissionId: submissionData.id,
			idp: idpResult
		}, { status: 201 });

	} catch (err) {
		if (err instanceof ApiError) {
			logger.warn(`API Error: ${err.message}`, { status: err.status, context: err.context });
			return json({ message: err.message }, { status: err.status });
		}

		logger.error('An unexpected error occurred in the submission endpoint.', { error: err });
		return json({ message: 'An unexpected error occurred.' }, { status: 500 });
	}
};