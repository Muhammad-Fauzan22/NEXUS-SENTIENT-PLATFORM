// src/routes/submission/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Inisialisasi Supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export const load: PageServerLoad = async ({ params }) => {
	// Ambil ID dari parameter URL
	const { id } = params;

	// Query ke Supabase untuk mengambil data submission
	const { data, error: dbError } = await supabase
		.from('submissions')
		.select('*')
		.eq('id', id)
		.single();

	// Jika terjadi error atau data tidak ditemukan
	if (dbError || !data) {
		throw error(404, 'Submission not found');
	}

	// Kembalikan data submission
	return {
		submission: data
	};
};

