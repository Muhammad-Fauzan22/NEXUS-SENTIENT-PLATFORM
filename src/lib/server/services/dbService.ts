import { supabaseAdmin } from '$lib/server/db/supabase.admin';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError } from '$lib/server/utils/errors';

/**
 * Defines the structure of the data for a new assessment submission.
 */
export interface AssessmentSubmissionPayload {
	user_info: unknown;
	riasec_answers: unknown;
	pwb_answers: unknown;
	riasec_result: unknown;
	pwb_result: unknown;
	generated_idp: unknown;
	user_id?: string; // Optional: if you have user authentication
}

/**
 * Inserts a complete assessment submission into the database.
 * @param submission The assessment data to insert, conforming to the payload structure.
 * @returns The newly created submission record from the database.
 * @throws {InternalServerError} if the database operation fails.
 */
async function createAssessmentSubmission(submission: AssessmentSubmissionPayload) {
	const { data, error: dbError } = await supabaseAdmin
		.from('assessment_submissions')
		.insert(submission)
		.select()
		.single();

	if (dbError) {
		logger.error('Failed to insert assessment submission into database', {
			dbError: { message: dbError.message, details: dbError.details, code: dbError.code }
		});
		throw new InternalServerError('Database operation failed to store assessment.');
	}

	return data;
}

/**
 * A centralized service for all database operations.
 */
export const dbService = {
	createAssessmentSubmission
};