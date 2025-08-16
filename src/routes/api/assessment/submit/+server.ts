import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';

/**
 * API endpoint untuk menerima data dari form assessment dan menyimpannya ke database
 * @param request - HTTP request yang berisi data profil mahasiswa
 * @returns Respons JSON yang menunjukkan status pemrosesan
 */
export async function POST({ request }) {
	// Validasi keamanan: Periksa API key dari header Authorization
	const authHeader = request.headers.get('Authorization');
	const expectedApiKey = env.INGEST_API_KEY;

	if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
		return json(
			{ error: 'Unauthorized' },
			{ status: 401 }
		);
	}

	try {
		// Parsing data dari request body
		const data = await request.json();

		// Tambahkan timestamp jika tidak ada
		const profileData = {
			...data,
			createdAt: data.createdAt || new Date().toISOString()
		};

		// Simpan data ke tabel profiles di Supabase
		const { data: newProfile, error } = await supabaseAdmin
			.from('profiles')
			.insert(profileData)
			.select()
			.single();

		// Penanganan error dari Supabase
		if (error) {
			console.error('Supabase insert error:', error);
			return json(
				{
					message: 'Failed to save data to database',
					details: error.message
				},
				{ status: 500 }
			);
		}

		// TODO: Trigger AI processing pipeline

		// Respons sukses dengan data yang baru dibuat
		return json(
			{
				message: 'Data submitted successfully',
				profile: newProfile
			},
			{ status: 201 }
		);
	} catch (error) {
		// Tangani error parsing JSON atau error lainnya
		console.error('Request processing error:', error);
		return json(
			{ error: 'Invalid JSON payload' },
			{ status: 400 }
		);
	}
}