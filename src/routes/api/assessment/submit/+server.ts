import { json } from '@sveltejs/kit';
import { assessmentSchema } from '$lib/types/schemas';
import { ZodError } from 'zod';
import { saveAssessment } from '$lib/server/services/dbService';
import { logger } from '$lib/server/utils/logger';
import { AppError } from '$lib/server/utils/errors';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// TODO: Implement actual session authentication
	const mockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Placeholder

	try {
		const body = await request.json();
		logger.info('Received new assessment request...');

		// 1. Validate input using Zod
		const submissionData = assessmentSchema.parse(body);
		logger.debug({ data: submissionData }, 'Assessment data is valid.');

		// 2. Save raw assessment data to database
		const assessment = await saveAssessment(mockUserId, submissionData);

		// 3. Trigger IDP generation pipeline (placeholder for now)
		const idp = {
			id: 'mock-idp-id-' + Date.now(),
			assessmentId: assessment.id,
			userId: mockUserId,
			createdAt: new Date().toISOString(),
			status: 'generated'
		};

		logger.info({ userId: mockUserId, idpId: idp.id }, 'IDP successfully generated.');
		return json(idp, { status: 200 });
	} catch (e) {
		if (e instanceof ZodError) {
			logger.warn('Invalid assessment request.', { errors: e.errors });
			return json({ 
				error: 'Invalid input.', 
				details: e.flatten() 
			}, { status: 400 });
		}
		if (e instanceof AppError) {
			logger.warn(`API Error: ${e.message}`, { 
				statusCode: e.statusCode, 
				errorCode: e.errorCode 
			});
			return json({ 
				error: e.message, 
				errorCode: e.errorCode 
			}, { status: e.statusCode });
		}

		// Handle unexpected errors
		const error = e as Error;
		logger.error('Fatal error on assessment submit endpoint:', {
			message: error.message,
			stack: error.stack
		});
		return json({ 
			error: 'Internal server error occurred.' 
		}, { status: 500 });
	}
};
