import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Menghasilkan teks menggunakan Perplexity API.
 * Provider ini dioptimalkan untuk tugas-tugas yang memerlukan informasi
 * real-time dari internet.
 *
 * @param prompt Prompt pengguna untuk dikirim ke model.
 * @returns Promise yang me-resolve dengan konten teks yang dihasilkan.
 * @throws {InternalServerError} Jika panggilan API gagal atau respons tidak valid.
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
				model: 'pplx-7b-online', // Model dengan akses internet
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
		// Ekstraksi konten yang aman dengan optional chaining
		const content = data.choices?.[0]?.message?.content || '';

		if (!content) {
			logger.warn('Perplexity API returned a successful response but with empty content.', { responseData: data });
		}

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