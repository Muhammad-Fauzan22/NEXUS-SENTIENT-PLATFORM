import { json, type RequestHandler } from '@sveltejs/kit';
import { ZodError } from 'zod';
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

		// 1. Validasi input terhadap skema
		const assessmentData = assessmentSchema.parse(rawData);
		logger.info({ transactionId }, `Validasi berhasil.`);

		// 2. Simpan data asesmen mentah ke database
		const rawAssessmentId = await dbService.saveRawAssessment({
			submission_data: assessmentData as any
		});
		logger.info({ transactionId, rawAssessmentId }, `Asesmen mentah berhasil disimpan.`);

		// 3. Analisis data mentah untuk membuat profil terstruktur
		const structuredProfile = await analyzeProfile(assessmentData);
		logger.info({ transactionId }, `Analisis profil selesai.`);

		// 4. Simpan profil terstruktur ke database
		const profileId = await dbService.saveStructuredProfile({
			...structuredProfile,
			raw_assessment_id: rawAssessmentId
		});
		logger.info({ transactionId, profileId }, `Profil terstruktur berhasil disimpan.`);

        // Ambil profil yang baru disimpan untuk mendapatkan semua kolom (termasuk ID)
        const fullProfile = await dbService.getProfileById(profileId);

		// 5. Hasilkan Individual Development Plan (IDP)
		const idpJsonContent = await generateIdp(fullProfile);
		logger.info({ transactionId }, `Konten IDP JSON berhasil digenerate.`);

		// 6. Format IDP JSON menjadi HTML terstruktur
		const idpHtmlContent = formatIdp(idpJsonContent);
		logger.info({ transactionId }, `Konten IDP HTML berhasil diformat.`);

		// 7. Simpan record IDP final ke database
		const idpRecord = await dbService.saveIdpRecord({
			profile_id: profileId,
			json_content: idpJsonContent as any,
			html_content: idpHtmlContent
		});
		logger.info({ transactionId, idpRecordId: idpRecord.id }, `Record IDP final berhasil disimpan.`);

		// 8. Kembalikan ID dari IDP yang digenerate ke klien
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