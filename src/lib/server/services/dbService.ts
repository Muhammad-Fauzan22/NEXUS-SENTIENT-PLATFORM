import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError, NotFoundError } from '$lib/server/utils/errors';
import type { AssessmentSubmission } from '$lib/types/schemas';
import type { Database } from '$lib/types/database.types';

// Mendefinisikan tipe baris tabel untuk kemudahan penggunaan
type RawAssessmentInsert = Database['public']['Tables']['raw_assessment_data']['Insert'];
type StructuredProfileInsert = Database['public']['Tables']['processed_profiles']['Insert'];
type IdpRecordInsert = Database['public']['Tables']['idp_records']['Insert'];

/**
 * Layanan terpusat untuk semua interaksi database.
 * Menyediakan antarmuka yang bersih dan aman secara tipe untuk operasi data.
 */
export const dbService = {
	/**
	 * Menyimpan data asesmen mentah ke dalam tabel raw_assessment_data.
	 * @param submissionData - Data asesmen yang telah divalidasi.
	 * @returns ID dari baris yang baru saja dimasukkan.
	 * @throws {InternalServerError} Jika terjadi kegagalan saat menyimpan.
	 */
	saveRawAssessment: async function (submissionData: RawAssessmentInsert): Promise<string> {
		logger.debug('Menyimpan data asesmen mentah ke database...');
		const { data, error } = await supabaseAdmin
			.from('raw_assessment_data')
			.insert(submissionData)
			.select('id')
			.single();

		if (error) {
			logger.error({ error }, 'Gagal menyimpan data asesmen mentah ke Supabase.');
			throw new InternalServerError('Gagal menyimpan data asesmen mentah.');
		}

		logger.info({ rawAssessmentId: data.id }, 'Data asesmen mentah berhasil disimpan.');
		return data.id;
	},

	/**
	 * Menyimpan profil terstruktur ke dalam tabel processed_profiles.
	 * @param profileData - Profil yang telah diproses oleh profile.analyzer.
	 * @returns ID dari baris yang baru saja dimasukkan.
	 * @throws {InternalServerError} Jika terjadi kegagalan saat menyimpan.
	 */
	saveStructuredProfile: async function (profileData: StructuredProfileInsert): Promise<string> {
		logger.debug('Menyimpan profil terstruktur ke database...');
		const { data, error } = await supabaseAdmin
			.from('processed_profiles')
			.insert(profileData)
			.select('id')
			.single();

		if (error) {
			logger.error({ error }, 'Gagal menyimpan profil terstruktur ke Supabase.');
			throw new InternalServerError('Gagal menyimpan profil terstruktur.');
		}

		logger.info({ profileId: data.id }, 'Profil terstruktur berhasil disimpan.');
		return data.id;
	},

	/**
	 * Menyimpan record IDP yang telah digenerate (JSON dan HTML) ke tabel idp_records.
	 * @param idpData - Data IDP yang berisi profileId, konten JSON, dan konten HTML.
	 * @returns Record IDP lengkap yang telah disimpan.
	 * @throws {InternalServerError} Jika terjadi kegagalan saat menyimpan.
	 */
	saveIdpRecord: async function (idpData: IdpRecordInsert): Promise<Database['public']['Tables']['idp_records']['Row']> {
		logger.debug({ profileId: idpData.profile_id }, 'Menyimpan record IDP ke database...');
		const { data, error } = await supabaseAdmin
			.from('idp_records')
			.insert(idpData)
			.select()
			.single();

		if (error) {
			logger.error({ error, profileId: idpData.profile_id }, 'Gagal menyimpan record IDP ke Supabase.');
			throw new InternalServerError('Gagal menyimpan record IDP.');
		}

		logger.info({ idpRecordId: data.id }, 'Record IDP berhasil disimpan.');
		return data;
	},

    /**
	 * Mengambil record IDP berdasarkan ID-nya.
	 * @param idpRecordId - UUID dari record IDP.
	 * @returns Record IDP yang ditemukan.
	 * @throws {NotFoundError} Jika record tidak ditemukan.
	 */
    getIdpRecord: async function (idpRecordId: string): Promise<Database['public']['Tables']['idp_records']['Row']> {
        logger.debug({ idpRecordId }, 'Mengambil record IDP dari database...');
        const { data, error } = await supabaseAdmin
            .from('idp_records')
            .select(`
                *,
                processed_profiles (
                    nim,
                    nama_lengkap
                )
            `)
            .eq('id', idpRecordId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // "No rows found"
                throw new NotFoundError('IDP_NOT_FOUND', `Record IDP dengan ID ${idpRecordId} tidak ditemukan.`);
            }
            logger.error({ error, idpRecordId }, 'Gagal mengambil record IDP dari Supabase.');
			throw new InternalServerError('Gagal mengambil data IDP.');
        }

        return data;
    }
};
