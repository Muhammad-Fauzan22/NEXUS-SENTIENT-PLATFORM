import { json, type RequestHandler } from '@svelte/kit';
import { assessmentSchema } from '$lib/types/schemas';
import { dbService } from '$lib/server/services/dbService';
import { analyzeProfile } from '$lib/server/ai/profile.analyzer';
import { generateIdp } from '$lib/server/ai/idp.generator';
import { formatIdp } from '$lib/server/ai/idp.formatter';
import { handleApiError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';

/**
 * @description API Endpoint for submitting assessment data and triggering the full IDP generation pipeline.
 */
export const POST: RequestHandler = async ({ request }) => {
	const transactionId = crypto.randomUUID();
	logger.info({ transactionId }, `Menerima pengajuan asesmen baru.`);

	try {
		const rawData = await request.json();
		logger.debug({ transactionId }, `Mem-parsing dan memvalidasi body permintaan.`);

		const assessmentData = assessmentSchema.parse(rawData);
		logger.info({ transactionId }, `Validasi berhasil.`);

		const rawAssessmentId = await dbService.saveRawAssessment({
			submission_data: assessmentData as any
		});
		logger.info({ transactionId, rawAssessmentId }, `Asesmen mentah berhasil disimpan.`);

		const structuredProfile = await analyzeProfile(assessmentData);
		logger.info({ transactionId }, `Analisis profil selesai.`);

		const profileId = await dbService.saveStructuredProfile({
			...structuredProfile,
			raw_assessment_id: rawAssessmentId
		});
		logger.info({ transactionId, profileId }, `Profil terstruktur berhasil disimpan.`);

        const fullProfile = await dbService.getProfileById(profileId);

		const idpJsonContent = await generateIdp(fullProfile);
		logger.info({ transactionId }, `Konten IDP JSON berhasil digenerate.`);

		const idpHtmlContent = formatIdp(idpJsonContent);
		logger.info({ transactionId }, `Konten IDP HTML berhasil diformat.`);

		const idpRecord = await dbService.saveIdpRecord({
			profile_id: profileId,
			json_content: idpJsonContent as any,
			html_content: idpHtmlContent
		});
		logger.info({ transactionId, idpRecordId: idpRecord.id }, `Record IDP final berhasil disimpan.`);

		return json(
			{
				success: true,
				message: 'IDP berhasil digenerate.',
				idpRecordId: idpRecord.id
			},
			{ status: 201 }
		);

	} catch (error) {
		return handleApiError(error, transactionId);
	}
};
