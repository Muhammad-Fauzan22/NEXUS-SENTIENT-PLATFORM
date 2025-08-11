import { logger } from '$lib/server/utils/logger';
import { buildAssessmentPrompt } from '$lib/server/ai/promptBuilder';
import { retrieveContext } from '$lib/server/ai/rag';
import { azureProvider } from '$lib/server/ai/providers/azure'; // Menggunakan provider AI kita
import type { Database } from '$lib/types/database.types';
import type { GeneratedIDP } from '$lib/types/schemas';

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Row'];

/**
 * Mengorkestrasi proses pembuatan IDP.
 * 1. Mengambil konteks yang relevan (RAG).
 * 2. Membangun prompt yang komprehensif.
 * 3. Memanggil model AI untuk menghasilkan konten terstruktur.
 *
 * @param profile - Profil terstruktur dari pengguna.
 * @returns Promise yang resolve menjadi objek IDP yang telah digenerate.
 * @throws {Error} Jika terjadi kegagalan dalam proses generasi.
 */
export async function generateIdp(profile: StructuredProfile): Promise<GeneratedIDP> {
	logger.info({ profileId: profile.id }, 'Memulai proses generasi IDP...');

	try {
		// 1. Retrieval-Augmented Generation (RAG)
		// Gabungkan teks dari profil untuk membuat query RAG yang kaya
		const ragQuery = `${profile.aspirations}. ${profile.portfolio_text}`;
		const contextChunks = await retrieveContext(ragQuery);

		// 2. Bangun Prompt
		// Kita asumsikan 'submission_data' ada di dalam profil, atau kita perlu menyesuaikan tipe
		// Untuk sekarang, kita akan gunakan data yang ada di 'profile'
		const submissionData = {
			aspirations: profile.aspirations,
			portfolio_text: profile.portfolio_text,
			riasec_scores: profile.riasec_scores,
			pwb_scores: profile.pwb_scores
		};
		const prompt = buildAssessmentPrompt(submissionData, contextChunks);
		logger.debug('Prompt untuk AI telah berhasil dibuat.');

		// 3. Panggil Provider AI
		const generatedContent = await azureProvider.generateStructuredContent(prompt);
		logger.info({ profileId: profile.id }, 'Konten IDP berhasil digenerate oleh AI.');

		return generatedContent;
	} catch (error) {
		const e = error as Error;
		logger.error({ error: e, profileId: profile.id }, 'Gagal dalam pipeline generasi IDP.');
		// Lempar kembali error agar bisa ditangani oleh endpoint API
		throw e;
	}
}
