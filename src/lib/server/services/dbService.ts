import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { logger } from '$lib/server/utils/logger';
import { InternalServerError, NotFoundError } from '$lib/server/utils/errors';
import type { Database } from '$lib/types/database.types';

// Mendefinisikan tipe baris tabel untuk kemudahan penggunaan
type RawAssessmentInsert = Database['public']['Tables']['raw_assessment_data']['Insert'];
type StructuredProfileInsert = Database['public']['Tables']['processed_profiles']['Insert'];
type IdpRecordInsert = Database['public']['Tables']['idp_records']['Insert'];
type StructuredProfileRow = Database['public']['Tables']['processed_profiles']['Row'];
type IdpRecordRow = Database['public']['Tables']['idp_records']['Row'];


/**
 * Layanan terpusat untuk semua interaksi database.
 */
export const dbService = {
	/**
	 * Menyimpan data asesmen mentah ke dalam tabel raw_assessment_data.
	 */
	saveRawAssessment: async function (submissionData: RawAssessmentInsert): Promise<string> {
		logger.debug('Menyimpan data asesmen mentah...');
		const { data, error } = await supabaseAdmin
			.from('raw_assessment_data')
			.insert(submissionData)
			.select('id')
			.single();

		if (error) {
			logger.error({ error }, 'Gagal menyimpan data asesmen mentah.');
			throw new InternalServerError('Gagal menyimpan data asesmen mentah.');
		}
		return data.id;
	},

	/**
	 * Menyimpan profil terstruktur ke dalam tabel processed_profiles.
	 */
	saveStructuredProfile: async function (profileData: StructuredProfileInsert): Promise<string> {
		logger.debug('Menyimpan profil terstruktur...');
		const { data, error } = await supabaseAdmin
			.from('processed_profiles')
			.insert(profileData)
			.select('id')
			.single();

		if (error) {
			logger.error({ error }, 'Gagal menyimpan profil terstruktur.');
			throw new InternalServerError('Gagal menyimpan profil terstruktur.');
		}
		return data.id;
	},

    /**
	 * Mengambil profil terstruktur berdasarkan ID-nya.
	 */
    getProfileById: async function (profileId: string): Promise<StructuredProfileRow> {
        logger.debug({ profileId }, 'Mengambil profil terstruktur...');
        const { data, error } = await supabaseAdmin
            .from('processed_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundError('PROFILE_NOT_FOUND', `Profil dengan ID ${profileId} tidak ditemukan.`);
            }
            logger.error({ error, profileId }, 'Gagal mengambil profil.');
			throw new InternalServerError('Gagal mengambil data profil.');
        }
        return data;
    },

	/**
	 * Menyimpan record IDP yang telah digenerate.
	 */
	saveIdpRecord: async function (idpData: IdpRecordInsert): Promise<IdpRecordRow> {
		logger.debug({ profileId: idpData.profile_id }, 'Menyimpan record IDP...');
		const { data, error } = await supabaseAdmin
			.from('idp_records')
			.insert(idpData)
			.select()
			.single();

		if (error) {
			logger.error({ error, profileId: idpData.profile_id }, 'Gagal menyimpan record IDP.');
			throw new InternalServerError('Gagal menyimpan record IDP.');
		}
		return data;
	},

    /**
	 * Mengambil record IDP berdasarkan ID-nya.
	 */
    getIdpRecord: async function (idpRecordId: string): Promise<IdpRecordRow> {
        logger.debug({ idpRecordId }, 'Mengambil record IDP...');
        const { data, error } = await supabaseAdmin
            .from('idp_records')
            .select(`*, processed_profiles ( nim, nama_lengkap )`)
            .eq('id', idpRecordId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundError('IDP_NOT_FOUND', `Record IDP dengan ID ${idpRecordId} tidak ditemukan.`);
            }
            logger.error({ error, idpRecordId }, 'Gagal mengambil record IDP.');
			throw new InternalServerError('Gagal mengambil data IDP.');
        }
        return data;
    }
};