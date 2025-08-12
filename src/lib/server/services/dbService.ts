import { supabaseAdmin } from '../db/supabase.admin';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';
import type { PostgrestError } from '@supabase/supabase-js';

// --- Definisi Tipe Data Transfer Object (DTO) ---

/**
 * Mendefinisikan "kontrak" data yang ketat untuk setiap submisi asesmen baru.
 * Ini memastikan bahwa hanya data dengan bentuk yang benar yang dapat disimpan.
 */
export interface AssessmentSubmissionPayload {
	user_info: unknown;
	riasec_answers: unknown;
	pwb_answers: unknown;
	riasec_result: unknown;
	pwb_result: unknown;
	generated_idp: unknown;
	user_id?: string; // Opsional, untuk integrasi otentikasi di masa depan
}

// --- Logika Layanan Database ---

/**
 * Menyisipkan catatan submisi asesmen yang lengkap ke dalam database.
 *
 * @param submission Objek data asesmen yang sesuai dengan payload.
 * @returns Catatan yang baru saja dibuat dari database.
 * @throws {InternalServerError} jika operasi database gagal.
 */
async function createAssessmentSubmission(submission: AssessmentSubmissionPayload) {
	const { data, error } = await supabaseAdmin
		.from('assessment_submissions')
		.insert(submission)
		.select()
		.single(); // Menggunakan .single() untuk memastikan hanya satu baris yang dikembalikan atau error.

	if (error) {
		logger.error('Failed to insert assessment submission into Supabase.', {
			dbError: { message: error.message, details: error.details, code: error.code }
		});
		throw new InternalServerError('Database operation failed to store assessment.');
	}

	return data;
}

/**
 * Layanan terpusat (Repository Pattern) untuk semua operasi database.
 * Ini mengabstraksi logika query Supabase dari logika bisnis aplikasi.
 */
export const dbService = {
	createAssessmentSubmission
};