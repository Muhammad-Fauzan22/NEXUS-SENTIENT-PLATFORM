// src/routes/dashboard/+page.server.ts
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { getSession, supabase } }) => {
	const session = await getSession();

	// Jika tidak ada sesi, alihkan ke halaman login
	if (!session) {
		throw redirect(303, '/login');
	}

	// Ambil data pengajuan dari database
	const { data, error: dbError } = await supabase
		.from('submissions')
		.select()
		.eq('user_id', session.user.id);

	// Jika ada error saat mengambil data
	if (dbError) {
		throw error(500, 'Gagal mengambil data pengajuan');
	}

	// Kembalikan data sesi dan pengajuan
	return {
		session,
		submissions: data
	};
};
