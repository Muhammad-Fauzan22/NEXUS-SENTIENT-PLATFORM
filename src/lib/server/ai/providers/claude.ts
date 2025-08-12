import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Menghasilkan teks menggunakan Anthropic Claude API.
 * Provider ini dioptimalkan untuk tugas-tugas yang memerlukan penalaran kompleks
 * dan kepatuhan ketat terhadap skema JSON.
 *
 * @param prompt Prompt pengguna untuk dikirim ke model.
 * @returns Promise yang me-resolve dengan konten teks yang dihasilkan.
 * @throws {InternalServerError} Jika panggilan API gagal atau respons tidak valid.
 */
async function generate(prompt: string): Promise<string> {
	try {
		const response = await fetch(CLAUDE_API_URL, {
			method: 'POST',
			headers: {
				'x-api-key': env.CLAUDE_API_KEY as string,
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
		// Ekstraksi konten yang aman dengan optional chaining
		const content = data.content?.[0]?.text || '';
		
		if (!content) {
			logger.warn('Claude API returned a successful response but with empty content.', { responseData: data });
		}

		return content.trim();
	} catch (error) {
		logger.error('An unexpected error occurred while calling Claude API', { error });
		if (error instanceof InternalServerError) {
			throw error;
		}
		throw new InternalServerError('Failed to communicate with Claude API.');
	}
}

export const claudeProvider = {
	generate
};