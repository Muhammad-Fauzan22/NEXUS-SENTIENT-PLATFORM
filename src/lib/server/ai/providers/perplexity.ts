import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Generates text using the Perplexity API.
 *
 * @param prompt The user prompt to send to the model.
 * @returns A promise that resolves to the generated text content.
 * @throws {InternalServerError} If the API call fails.
 */
async function generate(prompt: string): Promise<string> {
	try {
		const response = await fetch(PERPLEXITY_API_URL, {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
				authorization: `Bearer ${env.PERPLEXITY_API_KEY}`
			},
			body: JSON.stringify({
				model: 'pplx-7b-online', // Model with internet access
				messages: [{ role: 'user', content: prompt }]
			})
		});

		if (!response.ok) {
			const errorBody = await response.json();
			logger.error('Perplexity API request failed', {
				status: response.status,
				body: errorBody
			});
			throw new InternalServerError('Perplexity API request failed');
		}

		const data = await response.json();
		const content = data.choices[0]?.message?.content || '';
		return content.trim();
	} catch (error) {
		logger.error('An unexpected error occurred while calling Perplexity API', { error });
		if (error instanceof InternalServerError) {
			throw error;
		}
		throw new InternalServerError('Failed to communicate with Perplexity API.');
	}
}

export const perplexityProvider = {
	generate
};