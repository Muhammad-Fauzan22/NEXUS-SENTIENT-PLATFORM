// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
	const session = await getSession();
	
	// Jika tidak ada sesi, alihkan ke halaman login
	if (!session) {
		throw redirect(303, '/login');
	}
	
	// Jika ada sesi, kembalikan data sesi
	return { session };
};