// CORRECTED: Using relative path for robust server-side imports.
import { supabaseAdmin } from '../db/supabase.admin';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';

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
	user_id?: string;
}

/**
 * Inserts a complete assessment submission into the database.
 * @param submission The assessment data to insert.
 * @returns The newly created submission record.
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