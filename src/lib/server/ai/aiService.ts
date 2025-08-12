import { claudeProvider } from './providers/claude';
import { geminiProvider } from './providers/gemini';
import { perplexityProvider } from './providers/perplexity';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';
import type { AssessmentData } from '$lib/types/schemas/assessment';
import { pwbAnalyzer } from './analyzers/pwbAnalyzer';
import { riasecAnalyzer } from './analyzers/riasecAnalyzer';
import { idpGenerator } from './generators/idpGenerator';

/**
 * Layanan terpusat untuk mengorkestrasi alur kerja AI yang kompleks.
 * Bertindak sebagai "Facade" yang menyembunyikan kompleksitas interaksi
 * antar-modul AI dari seluruh aplikasi.
 */
export const aiService = {
	/**
	 * Menjalankan pipeline asesmen end-to-end secara penuh.
	 * Ini adalah metode inti dari sistem PPSDM-AI.
	 *
	 * @param assessmentData Data mentah lengkap dari submisi pengguna.
	 * @returns Promise yang me-resolve dengan artefak analisis dan IDP final.
	 */
	async runFullAssessmentPipeline(assessmentData: AssessmentData) {
		try {
			// FASE 1: Analisis Paralel
			// Menjalankan analisis independen secara bersamaan untuk efisiensi maksimum.
			logger.info('Starting parallel analysis phase.', { email: assessmentData.user_data.email });
			const [riasecResult, pwbResult] = await Promise.all([
				riasecAnalyzer.analyze(assessmentData.riasec_answers),
				pwbAnalyzer.analyze(assessmentData.pwb_answers)
			]);

			// FASE 2: Sintesis & Generasi
			// Menggunakan hasil analisis untuk menghasilkan laporan akhir.
			logger.info('Starting synthesis phase (IDP Generation).', { email: assessmentData.user_data.email });
			const idpResult = await idpGenerator.generate({
				userData: assessmentData.user_data,
				riasecAnalysis: riasecResult,
				pwbAnalysis: pwbResult
			});

			// FASE 3: Mengembalikan Artefak Final
			return { riasecResult, pwbResult, idpResult };
			
		} catch (error) {
			logger.error('A critical error occurred during the AI assessment pipeline.', { error });
			if (error instanceof InternalServerError) throw error;
			throw new InternalServerError('An unexpected failure occurred in the AI pipeline.');
		}
	},

	// --- Akses Provider Langsung (untuk tugas spesifik di luar pipeline) ---
	callClaude: (prompt: string) => claudeProvider.generate(prompt),
	callGemini: (prompt: string) => geminiProvider.generate(prompt),
	callPerplexity: (prompt: string) => perplexityProvider.generate(prompt)
};