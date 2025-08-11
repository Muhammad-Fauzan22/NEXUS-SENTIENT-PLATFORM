import { logger } from '$lib/server/utils/logger';
import { buildAssessmentPrompt } from '$lib/server/ai/promptBuilder';
import { retrieveContext } from '$lib/server/ai/rag';
import { azureProvider } from '$lib/server/ai/providers/azure';
import type { Database } from '$lib/types/database.types';
import { generatedIdpSchema, type GeneratedIDP, type AssessmentSubmission } from '$lib/types/schemas';

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Row'];

/**
 * Mengorkestrasi proses pembuatan IDP.
 */
export async function generateIdp(profile: StructuredProfile): Promise<GeneratedIDP> {
	logger.info({ profileId: profile.id }, 'Memulai proses generasi IDP...');

	try {
		// 1. Retrieval-Augmented Generation (RAG)
		const ragQuery = `${profile.aspirations}. ${profile.portfolio_text}`;
		const contextChunks = await retrieveContext(ragQuery);

		// 2. Bangun Prompt
        // Pastikan data yang dikirim ke prompt sesuai dengan skema AssessmentSubmission
        const submissionData: AssessmentSubmission = {
            aspirations: profile.aspirations,
            portfolio_text: profile.portfolio_text,
            // Lakukan type assertion yang aman di sini
            riasec_scores: profile.riasec_scores as any,
            pwb_scores: profile.pwb_scores as any,
        };
		const prompt = buildAssessmentPrompt(submissionData, contextChunks);
		logger.debug('Prompt untuk AI telah berhasil dibuat.');

		// 3. Panggil Provider AI
		const generatedContent = await azureProvider.generateStructuredContent(prompt);
		logger.info({ profileId: profile.id }, 'Konten IDP berhasil digenerate oleh AI.');

        // 4. Validasi output AI dengan Zod
        const validationResult = generatedIdpSchema.safeParse(generatedContent);
        if (!validationResult.success) {
            logger.error({ errors: validationResult.error.flatten() }, 'Output IDP dari AI tidak sesuai skema.');
            throw new Error('Gagal memvalidasi struktur data dari layanan AI.');
        }

		return validationResult.data;
	} catch (error) {
		const e = error as Error;
		logger.error({ error: e, profileId: profile.id }, 'Gagal dalam pipeline generasi IDP.');
		throw e;
	}
}