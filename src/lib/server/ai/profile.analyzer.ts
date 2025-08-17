import { logger } from '$lib/server/utils/logger';
import type { AssessmentSubmission } from '$lib/types/schemas';
import type { Database } from '$lib/types/database.types';

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Insert'];

/**
 * Menganalisis data asesmen mentah dan mengubahnya menjadi profil terstruktur
 * yang siap disimpan ke database dan digunakan oleh AI.
 *
 * @param rawData - Objek data asesmen yang telah divalidasi, sesuai dengan AssessmentSubmission.
 * @returns Promise yang resolve menjadi objek profil terstruktur.
 * @throws {Error} Jika data input tidak valid.
 */
export async function analyzeProfile(rawData: AssessmentSubmission): Promise<StructuredProfile> {
	if (!rawData || typeof rawData !== 'object') {
		const errorMsg = 'Data asesmen mentah tidak valid atau kosong.';
		logger.error(`[Profile Analyzer] FAILED: ${errorMsg}`);
		throw new Error(errorMsg);
	}

	logger.info(`Memulai analisis profil...`);

	try {
		// Menentukan tipe dominan dari skor RIASEC
		// narrow unknown to number map
		const riasecScores = rawData.riasec_scores as Record<string, number>;
		const dominantRIASEC = Object.keys(riasecScores).reduce((a, b) =>
			riasecScores[a] > riasecScores[b] ? a : b
		);

		// Menentukan tipe dominan dari skor PWB
		const pwbScores = rawData.pwb_scores as Record<string, number>;
		const dominantPWB = Object.keys(pwbScores).reduce((a, b) =>
			pwbScores[a] > pwbScores[b] ? a : b
		);

		const processedProfile = {
			aspirations: rawData.aspirations,
			portfolio_text: rawData.portfolio_text,
			riasec_scores: rawData.riasec_scores as any,
			pwb_scores: rawData.pwb_scores as any
		} as StructuredProfile;

		logger.info(
			`Analisis profil selesai. Tipe RIASEC dominan: ${dominantRIASEC}, PWB dominan: ${dominantPWB}.`
		);
		return processedProfile;
	} catch (error) {
		const e = error as Error;
		const errorMsg = `Gagal menganalisis data asesmen: ${e.message}`;
		logger.error(`[Profile Analyzer] FAILED: ${errorMsg}`, { stack: e.stack });
		throw new Error(errorMsg);
	}
}
