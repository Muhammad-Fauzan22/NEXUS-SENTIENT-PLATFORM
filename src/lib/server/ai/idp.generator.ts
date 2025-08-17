import { logger } from '$lib/server/utils/logger';
import { performanceMonitor } from '$lib/server/utils/performance';
import { handleError, AIProviderError } from '$lib/server/utils/errors';
import { buildAssessmentPrompt } from '$lib/server/ai/promptBuilder';
import { retrieveContext } from '$lib/server/ai/rag';
import { aiManager } from '$lib/server/services/ai.manager';
import type { Database } from '$lib/types/database.types';
import { generatedIdpSchema, type GeneratedIDP, type AssessmentSubmission } from '$lib/types/schemas';

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Row'];

/**
 * Mengorkestrasi proses pembuatan IDP dengan performance monitoring.
 */
export async function generateIdp(profile: StructuredProfile): Promise<GeneratedIDP> {
	const requestLogger = logger.child({ 
		profileId: profile.id, 
		operation: 'generateIdp' 
	});

	return performanceMonitor.timeAsync(
		'idp_generation_full',
		async () => {
			requestLogger.info('Memulai proses generasi IDP...');

			try {
				// 1. Retrieval-Augmented Generation (RAG)
				const ragQuery = `${profile.aspirations}. ${profile.portfolio_text}`;
				const contextChunks = await performanceMonitor.timeAsync(
					'rag_retrieval',
					() => retrieveContext(ragQuery),
					{ profileId: profile.id, queryLength: ragQuery.length }
				);

				requestLogger.debug('RAG context retrieved', { 
					contextChunksCount: contextChunks.length 
				});

				// 2. Bangun Prompt
				const submissionData: AssessmentSubmission = {
					aspirations: profile.aspirations,
					portfolio_text: profile.portfolio_text,
					riasec_scores: profile.riasec_scores as any,
					pwb_scores: profile.pwb_scores as any,
				};

				const prompt = performanceMonitor.timeSync(
					'prompt_building',
					() => buildAssessmentPrompt(submissionData, contextChunks),
					{ profileId: profile.id }
				);

				requestLogger.debug('Prompt untuk AI telah berhasil dibuat', { 
					promptLength: prompt.length 
				});

				// 3. Panggil Provider AI
				const raw = await performanceMonitor.timeAsync(
					'ai_generation',
					() => aiManager.executeTask('GENERATE_DRAFT', prompt),
					{ profileId: profile.id, promptLength: prompt.length }
				);

				requestLogger.info('Konten IDP berhasil digenerate oleh AI', { 
					profileId: profile.id,
					responseLength: raw.length 
				});

				// 4. Parse JSON response
				let generatedContent: unknown;
				try {
					generatedContent = performanceMonitor.timeSync(
						'json_parsing',
						() => JSON.parse(raw),
						{ profileId: profile.id }
					);
				} catch (parseError) {
					requestLogger.error('AI response is not valid JSON', { 
						parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
						rawResponse: raw.substring(0, 500) // Log first 500 chars for debugging
					});
					throw new AIProviderError('AI response is not valid JSON for IDP.');
				}

				// 5. Validasi output AI dengan Zod
				const validationResult = performanceMonitor.timeSync(
					'schema_validation',
					() => generatedIdpSchema.safeParse(generatedContent),
					{ profileId: profile.id }
				);

				if (!validationResult.success) {
					requestLogger.error('Output IDP dari AI tidak sesuai skema', { 
						errors: validationResult.error.flatten(),
						profileId: profile.id 
					});
					throw new AIProviderError('Gagal memvalidasi struktur data dari layanan AI.');
				}

				requestLogger.info('IDP generation completed successfully', { 
					profileId: profile.id 
				});

				return validationResult.data;

			} catch (error) {
				const apiError = handleError(error, { 
					profileId: profile.id, 
					operation: 'generateIdp' 
				});
				
				requestLogger.error('Gagal dalam pipeline generasi IDP', { 
					error: apiError.message,
					profileId: profile.id 
				});
				
				throw apiError;
			}
		},
		{ profileId: profile.id }
	);
}