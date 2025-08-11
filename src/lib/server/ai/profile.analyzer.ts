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
export async function analyzeProfile(
	rawData: AssessmentSubmission
): Promise<StructuredProfile> {
	if (!rawData || typeof rawData !== 'object') {
		const errorMsg = 'Data asesmen mentah tidak valid atau kosong.';
		logger.error(`[Profile Analyzer] FAILED: ${errorMsg}`);
		throw new Error(errorMsg);
	}

	logger.info(`Memulai analisis profil...`);

	try {
		// Menentukan tipe dominan dari skor RIASEC
		const riasecScores = rawData.riasec_scores;
		const dominantRIASEC = Object.keys(riasecScores).reduce((a, b) =>
			riasecScores[a as keyof typeof riasecScores] > riasecScores[b as keyof typeof riasecScores] ? a : b
		);

		// Menentukan tipe dominan dari skor PWB
		const pwbScores = rawData.pwb_scores;
		const dominantPWB = Object.keys(pwbScores).reduce((a, b) =>
			pwbScores[a as keyof typeof pwbScores] > pwbScores[b as keyof typeof pwbScores] ? a : b
		);

		const processedProfile: StructuredProfile = {
			// Asumsikan raw_assessment_id akan ditambahkan oleh pemanggil setelah data mentah disimpan
			// raw_assessment_id: 'some-uuid',
			
			// Data dari asesmen langsung
			aspirations: rawData.aspirations,
			portfolio_text: rawData.portfolio_text,

			// Hasil analisis
			analyzed_summary: `Seorang individu dengan aspirasi di bidang ${rawData.aspirations}, menunjukkan kekuatan pada area ${dominantPWB} (PWB) dan minat vokasional yang kuat pada tipe ${dominantRIASEC} (RIASEC).`,
			
			// Data JSONB untuk skor
			riasec_scores: rawData.riasec_scores,
			pwb_scores: rawData.pwb_scores,
		};

		logger.info(`Analisis profil selesai. Tipe RIASEC dominan: ${dominantRIASEC}, PWB dominan: ${dominantPWB}.`);
		return processedProfile;

	} catch (error) {
		const e = error as Error;
		const errorMsg = `Gagal menganalisis data asesmen: ${e.message}`;
		logger.error(`[Profile Analyzer] FAILED: ${errorMsg}`, { stack: e.stack });
		throw new Error(errorMsg);
	}
}
