import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError, NotFoundError } from '$lib/server/utils/errors';
import type { AssessmentSubmission } from '$lib/types/schemas';
import type { Database } from '$lib/types/database.types';

// Mendefinisikan tipe baris tabel untuk kemudahan penggunaan
type AssessmentRow = Database['public']['Tables']['assessments']['Row'];
type IdpVersionRow = Database['public']['Tables']['idp_versions']['Row'];

/**
 * Menyimpan data asesmen baru ke database.
 * @param userId - ID pengguna yang melakukan submit.
 * @param submissionData - Data asesmen yang telah divalidasi.
 * @returns Objek asesmen yang berhasil disimpan.
 * @throws {InternalServerError} Jika terjadi kegagalan saat menyimpan.
 */
export async function saveAssessment(
	userId: string,
	submissionData: AssessmentSubmission
): Promise<AssessmentRow> {
	logger.debug({ userId }, 'Menyimpan asesmen baru...');

	const { data, error } = await supabaseAdmin
		.from('assessments')
		.insert({ user_id: userId, submission_data: submissionData as any }) // 'as any' untuk menangani tipe JSONB Supabase
		.select()
		.single();

	if (error) {
		logger.error({ error, userId }, 'Gagal menyimpan asesmen ke Supabase.');
		throw new InternalServerError('Gagal menyimpan data asesmen.');
	}

	logger.info({ assessmentId: data.id, userId }, 'Asesmen berhasil disimpan.');
	return data;
}

/**
 * Menyimpan versi IDP yang baru digenerate.
 * @param assessmentId - ID dari asesmen terkait.
 * @param idpData - Data IDP hasil dari AI.
 * @returns Objek IDP yang berhasil disimpan.
 * @throws {InternalServerError} Jika terjadi kegagalan saat menyimpan.
 */
export async function saveIdpVersion(assessmentId: string, idpData: object): Promise<IdpVersionRow> {
	logger.debug({ assessmentId }, 'Menyimpan versi IDP baru...');

	// TODO: Implementasikan logika untuk menaikkan version_number secara otomatis
	const versionNumber = 1;

	const { data, error } = await supabaseAdmin
		.from('idp_versions')
		.insert({
			assessment_id: assessmentId,
			idp_data: idpData as any, // 'as any' untuk menangani tipe JSONB Supabase
			version_number: versionNumber
		})
		.select()
		.single();

	if (error) {
		logger.error({ error, assessmentId }, 'Gagal menyimpan versi IDP ke Supabase.');
		throw new InternalServerError('Gagal menyimpan hasil IDP.');
	}

	logger.info({ idpVersionId: data.id, assessmentId }, 'Versi IDP berhasil disimpan.');
	return data;
}

/**
 * Mengambil IDP terbaru berdasarkan ID asesmen.
 * @param assessmentId - ID asesmen yang ingin dicari IDP-nya.
 * @returns Objek IDP terbaru yang ditemukan.
 * @throws {NotFoundError} Jika tidak ada IDP yang ditemukan untuk asesmen tersebut.
 */
export async function getLatestIdpByAssessmentId(assessmentId: string): Promise<IdpVersionRow> {
	logger.debug({ assessmentId }, 'Mengambil IDP terbaru...');

	const { data, error } = await supabaseAdmin
		.from('idp_versions')
		.select('*')
		.eq('assessment_id', assessmentId)
		.order('version_number', { ascending: false })
		.limit(1)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			// Kode Supabase untuk "no rows found"
			throw new NotFoundError('IDP_NOT_FOUND', `Tidak ada IDP yang ditemukan untuk asesmen ID ${assessmentId}.`);
		}
		logger.error({ error, assessmentId }, 'Gagal mengambil IDP dari Supabase.');
		throw new InternalServerError('Gagal mengambil data IDP.');
	}

	return data;
}