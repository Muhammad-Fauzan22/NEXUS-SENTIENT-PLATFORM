import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Generates text using the Google Gemini API.
 *
 * @param prompt The user prompt to send to the model.
 * @returns A promise that resolves to the generated text content.
 * @throws {InternalServerError} If the API call fails.
 */
async function generate(prompt: string): Promise<string> {
	try {
		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();
		return text.trim();
	} catch (error) {
		logger.error('An unexpected error occurred while calling Gemini API', {
			// Ensure we log the actual error object from the SDK
			sdkError: error instanceof Error ? { message: error.message, stack: error.stack } : error
		});
		// Throw a standardized error for consistent handling upstream
		throw new InternalServerError('Failed to communicate with Gemini API.');
	}
}

export const geminiProvider = {
	generate
};