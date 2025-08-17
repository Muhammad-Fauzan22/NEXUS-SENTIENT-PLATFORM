import { logger } from '$lib/server/utils/logger';
import { buildAssessmentPrompt } from '$lib/server/ai/promptBuilder';
import { retrieveContext } from '$lib/server/ai/rag';
import { aiManager } from '$lib/server/services/ai.manager.js';
import type { Database } from '$lib/types/database.types';
import { generatedIdpSchema, type GeneratedIDP, type AssessmentSubmission } from '$lib/types/schemas';

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Row'];

/**
 * Mengorkestrasi proses pembuatan IDP.
 */
export async function generateIdp(profile: StructuredProfile): Promise<GeneratedIDP> {
	logger.info('Memulai proses generasi IDP...', { profileId: profile.id });

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

		// 3. Panggil Provider AI (melalui aiManager -> bisa local/eksternal)
		const raw = await aiManager.executeTask('GENERATE_DRAFT', prompt);
		logger.info('Konten IDP berhasil digenerate oleh AI.', { profileId: profile.id });
		let generatedContent: unknown;
		try {
			generatedContent = JSON.parse(raw);
		} catch (e) {
			throw new Error('AI response is not valid JSON for IDP.');
		}

		// 4. Validasi output AI dengan Zod
		const validationResult = generatedIdpSchema.safeParse(generatedContent);
		if (!validationResult.success) {
			logger.error('Output IDP dari AI tidak sesuai skema.', { errors: validationResult.error.flatten() });
			throw new Error('Gagal memvalidasi struktur data dari layanan AI.');
		}

		return validationResult.data;
	} catch (error) {
		const e = error as Error;
		logger.error('Gagal dalam pipeline generasi IDP.', { error: e, profileId: profile.id });
		throw e;
	}
}