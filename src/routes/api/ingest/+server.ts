import { json } from '@sveltejs/kit';
import type { IStudentProfile } from '$lib/types/profile.ts';

/**
 * API endpoint untuk menerima data dari Google Form dan memulai pipeline pemrosesan
 * @param request - HTTP request yang berisi data profil mahasiswa
 * @returns Respons JSON yang menunjukkan status pemrosesan
 */
export async function POST({ request }) {
	// Validasi keamanan: Periksa API key dari header Authorization
	const authHeader = request.headers.get('Authorization');
	const expectedApiKey = process.env.INGEST_API_KEY;

	if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Parsing data dari request body
		const data = await request.json();

		// Validasi struktur data dasar
		if (!data.fullName || !data.email) {
			return json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// TODO: Save data to Supabase
		// TODO: Trigger AI processing pipeline

		// Respons sukses dengan data yang diterima (untuk debugging)
		return json(
			{
				message: 'Data ingested successfully',
				receivedData: data as IStudentProfile
			},
			{ status: 200 }
		);
	} catch (error) {
		// Tangani error parsing JSON atau error lainnya
		return json({ error: 'Invalid JSON payload' }, { status: 400 });
	}
}
