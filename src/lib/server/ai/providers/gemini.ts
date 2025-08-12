import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

// Inisialisasi Google Generative AI client.
// Dilakukan sekali saat modul dimuat untuk efisiensi (pola singleton).
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Menghasilkan teks menggunakan Google Gemini API.
 * Provider ini dioptimalkan untuk kecepatan dan tugas-tugas generasi teks umum.
 *
 * @param prompt Prompt pengguna untuk dikirim ke model.
 * @returns Promise yang me-resolve dengan konten teks yang dihasilkan.
 * @throws {InternalServerError} Jika panggilan API gagal.
 */
async function generate(prompt: string): Promise<string> {
	try {
		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();
		
		if (!text) {
			logger.warn('Gemini API returned a successful response but with empty content.', { responseData: response });
		}

		return text.trim();
	} catch (error) {
		// Menangani error spesifik dari SDK dan mencatatnya dengan benar
		const sdkError = error instanceof Error ? { message: error.message, stack: error.stack } : error;
		logger.error('An unexpected error occurred while calling Gemini API', { sdkError });
		
		// Melemparkan error terstandarisasi untuk konsistensi di seluruh aplikasi.
		throw new InternalServerError('Failed to communicate with Gemini API.');
	}
}

export const geminiProvider = {
	generate
};