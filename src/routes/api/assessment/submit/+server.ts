import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { aiService } from '$lib/server/ai/aiService';
import { dbService, type AssessmentSubmissionPayload } from '$lib/server/services/dbService';
import { logger } from '$lib/server/utils/logger';
import { ApiError, BadRequestError } from '$lib/server/utils/errors';
import type { AssessmentData } from '$lib/types/schemas/assessment';

/**
 * Endpoint API untuk menerima, memproses, dan menyimpan submisi asesmen.
 * Bertindak sebagai "Controller" tipis yang mengorkestrasi panggilan ke layanan-layanan
 * yang lebih dalam (AI dan Database).
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const assessmentData: AssessmentData = await request.json();

		// Langkah 1: Validasi Input (Fail-Fast)
		if (!assessmentData?.user_data || !assessmentData?.riasec_answers || !assessmentData?.pwb_answers) {
			throw new BadRequestError('Invalid or incomplete assessment data payload.');
		}

		// Langkah 2: Delegasikan seluruh proses AI ke aiService
		const { riasecResult, pwbResult, idpResult } = await aiService.runFullAssessmentPipeline(
			assessmentData
		);

		// Langkah 3: Siapkan payload untuk penyimpanan
		const submissionPayload: AssessmentSubmissionPayload = {
			user_info: assessmentData.user_data,
			riasec_answers: assessmentData.riasec_answers,
			pwb_answers: assessmentData.pwb_answers,
			riasec_result: riasecResult,
			pwb_result: pwbResult,
			generated_idp: idpResult
		};

		// Langkah 4: Delegasikan penyimpanan ke dbService
		const submissionData = await dbService.createAssessmentSubmission(submissionPayload);

		logger.info('Successfully processed and stored new assessment.', {
			submissionId: submissionData.id,
			user: assessmentData.user_data.email
		});

		// Langkah 5: Kembalikan respons sukses ke klien
		return json(
			{
				success: true,
				submissionId: submissionData.id,
				idp: idpResult
			},
			{ status: 201 } // 201 Created
		);

	} catch (err: unknown) {
		// Penanganan error terpusat dan aman-tipe
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