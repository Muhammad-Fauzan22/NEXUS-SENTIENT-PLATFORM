import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Generates text using the Anthropic Claude API.
 *
 * @param prompt The user prompt to send to the model.
 * @returns A promise that resolves to the generated text content.
 * @throws {InternalServerError} If the API call fails.
 */
async function generate(prompt: string): Promise<string> {
	try {
		const response = await fetch(CLAUDE_API_URL, {
			method: 'POST',
			headers: {
				'x-api-key': env.CLAUDE_API_KEY,
				'anthropic-version': '2023-06-01',
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				model: 'claude-3-opus-20240229',
				max_tokens: 4096,
				messages: [{ role: 'user', content: prompt }]
			})
		});

		if (!response.ok) {
			const errorBody = await response.json();
			logger.error('Claude API request failed', {
				status: response.status,
				body: errorBody
			});
			throw new InternalServerError('Claude API request failed');
		}

		const data = await response.json();
		const content = data.content[0]?.text || '';
		return content.trim();
	} catch (error) {
		logger.error('An unexpected error occurred while calling Claude API', { error });
		// Re-throw as a standardized error
		if (error instanceof InternalServerError) {
			throw error;
		}
		throw new InternalServerError('Failed to communicate with Claude API.');
	}
}

export const claudeProvider = {
	generate
};